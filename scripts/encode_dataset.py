"""
Offline dataset encoding for FoodSnap.

Walks through dataset/images/, encodes every image (with DenseNet201 when
TensorFlow is installed, otherwise a built-in numpy/Pillow fallback), and
writes the results to main/static/main/data/encodings.txt and enc_names.txt.
The web app loads these two files at runtime to compare an uploaded photo
against the whole dataset via cosine similarity.

Usage:
    python scripts/encode_dataset.py
"""

import importlib.util
import os

import numpy as np
from PIL import Image

IMG_SIZE = (224, 224)
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset", "images")
OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "main", "static", "main", "data"
)

# Use DenseNet201 when TensorFlow is available, otherwise a pure
# numpy/Pillow color-and-texture encoder (keep in sync with main/ml_utils.py).
TF_AVAILABLE = importlib.util.find_spec("tensorflow") is not None

FALLBACK_FEATURE_DIM = 4 * 4 * 3 + 24 + 4 + 4
FEATURE_DIM = 1920 if TF_AVAILABLE else FALLBACK_FEATURE_DIM

model = None
if TF_AVAILABLE:
    from tensorflow.keras.applications import DenseNet201
    model = DenseNet201(weights="imagenet", include_top=False, pooling="avg")


def get_encodings(image: Image.Image) -> np.ndarray:
    """Encode a PIL image into a 1-D feature vector (same as the web app uses)."""
    if not TF_AVAILABLE:
        return _fallback_encodings(image)

    from tensorflow.keras.applications.densenet import preprocess_input
    image = image.convert("RGB").resize(IMG_SIZE)
    array = np.asarray(image, dtype="float32")
    array = np.expand_dims(array, axis=0)
    array = preprocess_input(array)
    features = model.predict(array, verbose=0)
    return features.reshape(-1)


def _fallback_encodings(image: Image.Image) -> np.ndarray:
    """Extract a 48-dim color grid + 32-dim HSV histogram vector from an image."""
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


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.isdir(DATASET_DIR):
        print(f"No dataset directory found at {DATASET_DIR}. Add images named like "
              f"'jollof_rice_001.jpg' (recipe-name_index.ext) and re-run this script.")
        return

    filenames = sorted(
        f for f in os.listdir(DATASET_DIR)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    )

    if not filenames:
        print(f"No images found in {DATASET_DIR}.")
        return

    all_encodings = []
    processed_names = []

    for filename in filenames:
        path = os.path.join(DATASET_DIR, filename)
        try:
            with Image.open(path) as image:
                encoding = get_encodings(image)
            all_encodings.append(encoding)
            processed_names.append(filename)
        except Exception as exc:  # noqa: BLE001 - keep the pipeline going past bad files
            print(f"Skipping {filename}: {exc}")

    print(f"Processed {len(processed_names)} images.")

    encodings_path = os.path.join(OUTPUT_DIR, "encodings.txt")
    names_path = os.path.join(OUTPUT_DIR, "enc_names.txt")

    np.savetxt(encodings_path, np.array(all_encodings), delimiter=",")
    with open(names_path, "w") as f:
        f.write("\n".join(processed_names))

    print(f"Wrote {encodings_path} and {names_path}")


if __name__ == "__main__":
    main()
