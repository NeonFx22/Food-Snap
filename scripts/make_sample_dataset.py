"""
Generate a small placeholder dataset (a few synthetic photos per dish) so the
app has something to match against out of the box. Replace these with real
photos of each dish for a meaningful system.

Usage:
    python scripts/make_sample_dataset.py
"""

import os
import random

import numpy as np
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE_DIR, "dataset", "images")

DISHES = {
    "jollof_rice": (205, 70, 35),
    "egusi_soup": (150, 160, 65),
    "moin_moin": (125, 45, 35),
    "suya": (95, 58, 38),
    "pounded_yam": (245, 240, 225),
    "efo_riro": (45, 125, 55),
    "chin_chin": (215, 165, 75),
    "spaghetti_bolognese": (175, 45, 40),
    "grilled_chicken": (225, 175, 95),
    "vegetable_salad": (95, 165, 75),
}


def make_image(base, seed, per_dish):
    rng = random.Random(seed)
    size = 512
    arr = np.zeros((size, size, 3), dtype="float32")
    for y in range(size):
        t = y / size
        arr[y, :, :] = [
            base[0] * (1 - 0.35 * t),
            base[1] * (1 - 0.25 * t),
            base[2] * (1 - 0.30 * t),
        ]

    img = Image.fromarray(np.clip(arr, 0, 255).astype("uint8"))
    draw = ImageDraw.Draw(img, "RGBA")
    for _ in range(rng.randint(6, 12)):
        cx, cy = rng.randint(0, size), rng.randint(0, size)
        rx, ry = rng.randint(30, 110), rng.randint(30, 110)
        shade = rng.randint(-30, 30)
        draw.ellipse(
            (cx - rx, cy - ry, cx + rx, cy + ry),
            fill=(
                int(np.clip(base[0] + shade, 0, 255)),
                int(np.clip(base[1] + shade, 0, 255)),
                int(np.clip(base[2] + shade, 0, 255)),
                90,
            ),
        )

    noise = np.asarray(img, dtype="float32")
    noise += np.random.RandomState(seed).uniform(-14, 14, noise.shape).astype("float32")
    return Image.fromarray(np.clip(noise, 0, 255).astype("uint8"))


def main():
    os.makedirs(OUT, exist_ok=True)
    count = 0
    for dish, base in DISHES.items():
        for i in range(1, 3):
            name = f"{dish}_{i:03d}.jpg"
            make_image(base, hash((dish, i)) % (2 ** 32), i).save(os.path.join(OUT, name))
            count += 1
    print(f"generated {count} sample images in {OUT}")


if __name__ == "__main__":
    main()
