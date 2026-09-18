"""
Evaluate the image-to-recipe matching quality of FoodSnap.

Runs a leave-one-out style evaluation: for every photo in dataset/images/
(or a labelled test folder), encode it with the same encoder the web app
uses, and check whether the correct dish appears in the top-k matches.

Usage:
    python scripts/evaluate.py                 # top-1 / top-5 over dataset/images/
    python scripts/evaluate.py --top 1         # only top-1
"""

import argparse
import os
import sys

import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from main.ml_utils import get_encodings, _load_dataset_encodings, _recipe_stem  # noqa: E402

DEFAULT_DATA = os.path.join(BASE_DIR, "dataset", "images")


def expected_dish(filename: str) -> str:
    return os.path.splitext(filename)[0].rsplit("_", 1)[0].replace("_", " ").strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default=DEFAULT_DATA, help="folder of photos to evaluate")
    parser.add_argument("--top", type=int, default=5, help="top-k considered a correct match")
    args = parser.parse_args()

    encodings, names = _load_dataset_encodings()
    if len(names) == 0:
        raise SystemExit(
            "No dataset index found. Run `python scripts/encode_dataset.py` first."
        )
    print(f"Index contains {len(names)} images, {encodings.shape[1]} features each.")
    print(f"Evaluating {args.data}...")

    filenames = sorted(
        f for f in os.listdir(args.data) if f.lower().endswith((".jpg", ".jpeg", ".png"))
    )
    if not filenames:
        raise SystemExit(f"No images found in {args.data}.")

    counts = {k: 0 for k in range(1, args.top + 1)}
    total = 0

    for filename in filenames:
        ground_truth = expected_dish(filename)
        path = os.path.join(args.data, filename)
        try:
            with Image.open(path) as image:
                query = get_encodings(image)
        except Exception as exc:  # noqa: BLE001
            print(f"Skipping {filename}: {exc}")
            continue

        norm_query = query / (np.linalg.norm(query) + 1e-10)
        norm_idx = encodings / (np.linalg.norm(encodings, axis=1, keepdims=True) + 1e-10)
        scores = norm_idx @ norm_query
        top = np.argsort(scores)[::-1]
        ranked = [_recipe_stem(names[i]) for i in top]

        total += 1
        for k in range(1, args.top + 1):
            if ground_truth in ranked[:k]:
                counts[k] += 1

        label = "OK " if ground_truth == ranked[0] else "MISS"
        print(f"{label} {filename:32s} top1={ranked[0]:24s} truth={ground_truth}")

    if total == 0:
        raise SystemExit("Nothing to evaluate.")

    print("\n=== Results ===")
    for k in range(1, args.top + 1):
        print(f"Top-{k}: {counts[k]}/{total} = {counts[k] / total * 100:.1f}%")


if __name__ == "__main__":
    main()
