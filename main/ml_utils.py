"""
Image-encoding and recipe-matching logic for FoodSnap.

Encodes images into fixed-length feature vectors, then matches an uploaded
photo against a precomputed dataset index using cosine similarity.

Two encoders are supported, chosen automatically:
  * DenseNet201 (TensorFlow) when TensorFlow is installed.
  * A lightweight pure numpy/Pillow color-and-texture encoder otherwise, so
    the app works on Python versions TensorFlow does not support yet.

The dataset index (main/static/main/data/encodings.txt + enc_names.txt) is
built by scripts/encode_dataset.py and must use the SAME encoder as runtime.
"""
import importlib.util
import json
import os
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "main" / "static" / "main" / "data"
ENCODINGS_PATH = DATA_DIR / "encodings.txt"
ENC_NAMES_PATH = DATA_DIR / "enc_names.txt"
RECIPES_PATH = BASE_DIR / "main" / "static" / "main" / "recipes.json"

IMG_SIZE = (224, 224)

TF_AVAILABLE = importlib.util.find_spec("tensorflow") is not None
FALLBACK_FEATURE_DIM = 4 * 4 * 3 + 24 + 4 + 4  # spatial RGB means + HSV histograms
FEATURE_DIM = 1920 if TF_AVAILABLE else FALLBACK_FEATURE_DIM


# --------------------------------------------------------------------------
# Encoders
# --------------------------------------------------------------------------
def _fallback_encodings(image: Image.Image) -> np.ndarray:
    """48-dim color grid + 32-dim HSV histogram. Keep in sync with encode_dataset.py."""
    small = image.convert("RGB").resize((64, 64))
    arr = np.asarray(small, dtype="float32") / 255.0

    feats = []
    for i in range(4):
        for j in range(4):
            cell = arr[i * 16:(i + 1) * 16, j * 16:(j + 1) * 16]
            feats.extend(cell.reshape(-1, 3).mean(axis=0).tolist())

    hsv = np.asarray(small.convert("HSV"), dtype="float32")
    h, s, v = hsv[..., 0] / 255.0 * 360.0, hsv[..., 1] / 255.0, hsv[..., 2] / 255.0
    feats.extend((np.histogram(h, bins=24, range=(0, 360))[0] / 64).tolist())
    feats.extend((np.histogram(s, bins=4, range=(0, 1))[0] / 64).tolist())
    feats.extend((np.histogram(v, bins=4, range=(0, 1))[0] / 64).tolist())

    return np.asarray(feats, dtype="float32")


@lru_cache(maxsize=1)
def _get_model():
    from tensorflow.keras.applications import DenseNet201
    return DenseNet201(weights="imagenet", include_top=False, pooling="avg")


def get_encodings(image: Image.Image) -> np.ndarray:
    """Encode a PIL image into a 1-D feature vector (DenseNet or fallback)."""
    if not TF_AVAILABLE:
        return _fallback_encodings(image)

    from tensorflow.keras.applications.densenet import preprocess_input
    model = _get_model()
    image = image.convert("RGB").resize(IMG_SIZE)
    array = np.asarray(image, dtype="float32")
    array = np.expand_dims(array, axis=0)
    array = preprocess_input(array)
    features = model.predict(array, verbose=0)
    return features.reshape(-1)


# --------------------------------------------------------------------------
# Dataset index
# --------------------------------------------------------------------------
@lru_cache(maxsize=1)
def _load_dataset_encodings():
    if not (ENCODINGS_PATH.exists() and ENC_NAMES_PATH.exists()):
        return np.empty((0, FEATURE_DIM)), []

    encodings = np.loadtxt(ENCODINGS_PATH, delimiter=",")
    if encodings.ndim == 1:
        encodings = encodings.reshape(1, -1)

    # Guard against an index built with the other encoder (different width).
    if encodings.shape[1] != FEATURE_DIM:
        return np.empty((0, FEATURE_DIM)), []

    with open(ENC_NAMES_PATH) as f:
        names = [line.strip() for line in f if line.strip()]

    return encodings, names


def get_recipes_data():
    """Load the structured recipe dataset (name, calories, ingredients, ...).

    Returns an empty list if the file is missing or malformed.
    Results are cached after the first successful load; call
    ``get_recipes_data.cache_clear()`` after updating the JSON file.
    """
    if not hasattr(get_recipes_data, "_cache"):
        if not RECIPES_PATH.exists():
            return []
        try:
            with open(RECIPES_PATH, encoding="utf-8") as f:
                get_recipes_data._cache = json.load(f)
        except (json.JSONDecodeError, OSError):
            return []
    return get_recipes_data._cache


# --------------------------------------------------------------------------
# Matching
# --------------------------------------------------------------------------
def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a_norm = a / (np.linalg.norm(a) + 1e-10)
    b_norm = b / (np.linalg.norm(b, axis=1, keepdims=True) + 1e-10)
    return b_norm @ a_norm


def _recipe_stem(filename: str) -> str:
    """Turn 'jollof_rice_001.jpg' into 'jollof rice'."""
    stem = os.path.splitext(filename)[0].rsplit("_", 1)[0]
    return stem.replace("_", " ").strip()


def match_image(image: Image.Image, top_k: int = 10):
    """Return a list of (recipe_name, confidence) sorted best-first."""
    encodings, names = _load_dataset_encodings()
    if len(names) == 0:
        return []

    query = get_encodings(image)
    similarities = _cosine_similarity(query, encodings)
    ranked_idx = np.argsort(similarities)[::-1][:top_k]

    results = []
    for i in ranked_idx:
        confidence = float(np.clip(similarities[i], 0.0, 1.0))
        results.append((_recipe_stem(names[i]), confidence))
    return results
