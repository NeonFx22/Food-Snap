from django.contrib import admin
from .models import AfricanDish, FoodScan, FavoriteRecipe, UserProfile

@admin.register(AfricanDish)
class AfricanDishAdmin(admin.ModelAdmin):
    list_display = ('name', 'recipe_id', 'origin', 'category', 'difficulty', 'calories', 'prep_time_mins', 'cook_time_mins', 'is_featured')
    list_filter = ('category', 'origin', 'difficulty', 'is_featured')
    search_fields = ('name', 'description', 'recipe_id', 'origin')
    prepopulated_fields = {'recipe_id': ('name',)}


@admin.register(FoodScan)
class FoodScanAdmin(admin.ModelAdmin):
    list_display = ('scan_id', 'predicted_name', 'confidence', 'detection_engine', 'timestamp', 'user')
    list_filter = ('detection_engine', 'timestamp')
    search_fields = ('scan_id', 'predicted_name')
    readonly_fields = ('timestamp',)


@admin.register(FavoriteRecipe)
class FavoriteRecipeAdmin(admin.ModelAdmin):
    list_display = ('user', 'dish', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'dish__name')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'displayName', 'skill_level', 'created_at')
    search_fields = ('user__username', 'displayName', 'bio')
