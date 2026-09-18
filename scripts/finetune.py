"""
Fine-tune a DenseNet201 classifier on your own food dataset.

This trains a custom model that recognizes YOUR dishes, replacing the
off-the-shelf ImageNet feature matching used by the web app.

Requires a TensorFlow-supported Python (3.12 or older). The easiest place
to run this is Google Colab (https://colab.research.google.com) so you
don't need to install CUDA locally. After training, put the saved
`food_classifier.keras` next to this file and point the app at it (see
README "Custom model").

Dataset layout:
    dataset/train/<dish_name>/img1.jpg
    dataset/train/<dish_name>/img2.jpg
    dataset/validation/<dish_name>/img1.jpg
    ...
For a small dataset use ImageDataGenerator augmentation to avoid overfitting.

Usage:
    python scripts/finetune.py --data dataset --epochs 20
"""

import argparse
import os

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import DenseNet201
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE = (224, 224)
BATCH_SIZE = 32


def build_model(num_classes: int):
    base = DenseNet201(
        weights="imagenet",
        include_top=False,
        pooling="avg",
        input_shape=(*IMG_SIZE, 3),
    )
    base.trainable = False

    inputs = keras.Input(shape=(*IMG_SIZE, 3))
    x = keras.applications.densenet.preprocess_input(inputs)
    x = base(x, training=False)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    return keras.Model(inputs, outputs), base


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="dataset", help="root with train/ and validation/ folders")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--out", default="scripts/food_classifier.keras")
    args = parser.parse_args()

    train_dir = os.path.join(args.data, "train")
    val_dir = os.path.join(args.data, "validation")
    if not (os.path.isdir(train_dir) and os.path.isdir(val_dir)):
        raise SystemExit(
            f"Expected {train_dir} and {val_dir} to exist. "
            "Each must contain one folder per dish."
        )

    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
    )
    val_datagen = ImageDataGenerator(rescale=1.0 / 255)

    train_gen = train_datagen.flow_from_directory(
        train_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, shuffle=True
    )
    val_gen = val_datagen.flow_from_directory(
        val_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, shuffle=False
    )

    model, base = build_model(train_gen.num_classes)
    model.compile(
        optimizer=keras.optimizers.Adam(1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    callbacks = [
        ModelCheckpoint(args.out, save_best_only=True),
        EarlyStopping(patience=5, restore_best_weights=True),
        ReduceLROnPlateau(factor=0.5, patience=3),
    ]

    print(f"Training {train_gen.num_classes} classes for {args.epochs} epochs...")
    model.fit(train_gen, epochs=args.epochs, validation_data=val_gen, callbacks=callbacks)

    # Unfreeze the last block for a final fine-tuning pass.
    base.trainable = True
    for layer in base.layers[:-30]:
        layer.trainable = False
    model.compile(
        optimizer=keras.optimizers.Adam(1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    print("Fine-tuning top layers...")
    model.fit(train_gen, epochs=5, validation_data=val_gen, callbacks=callbacks)

    val_loss, val_acc = model.evaluate(val_gen)
    print(f"Final validation accuracy: {val_acc:.3f} ({val_acc * 100:.1f}%)")
    print(f"Model saved to {args.out}")

    # Dump class labels so the app can map predictions -> recipe names.
    with open(os.path.splitext(args.out)[0] + "_labels.txt", "w") as f:
        f.write("\n".join(sorted(train_gen.class_indices, key=train_gen.class_indices.get)))
    print("Class labels written next to the model.")


if __name__ == "__main__":
    main()
