from django.contrib import admin

from .models import FavoriteRecipe, Prediction, Recipe


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("name", "calories", "cooking_time")
    search_fields = ("name",)


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("top_match", "user", "confidence", "created_at")
    list_filter = ("created_at",)
    search_fields = ("top_match",)


@admin.register(FavoriteRecipe)
class FavoriteRecipeAdmin(admin.ModelAdmin):
    list_display = ("recipe_name", "user", "created_at")
    search_fields = ("recipe_name", "user__username")
