from django.conf import settings
from django.db import models


class Recipe(models.Model):
    name = models.CharField(max_length=255, unique=True)
    calories = models.CharField(max_length=100)
    cooking_time = models.CharField(max_length=100)
    ingredients = models.TextField()
    directions = models.TextField()

    def __str__(self):
        return self.name


class Prediction(models.Model):
    """Keeps a log of uploads and their predicted matches. Linked to the user when they are logged in."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="predictions",
    )
    image = models.ImageField(upload_to="uploads/")
    top_match = models.CharField(max_length=255, blank=True)
    confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    inference_ms = models.FloatField(default=0.0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.top_match or 'unmatched'} @ {self.created_at:%Y-%m-%d %H:%M}"


class FavoriteRecipe(models.Model):
    """A recipe a user saved from a matched result."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_recipes",
    )
    recipe_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "recipe_name"], name="unique_user_recipe")
        ]

    def __str__(self):
        return f"{self.user.username} -> {self.recipe_name}"
