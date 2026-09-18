from django.urls import path

from . import views

urlpatterns = [
    # Web Views
    path("", views.home_page, name="home"),
    path("nearby/", views.nearby_places_view, name="nearby"),
    path("recipes/", views.recipes_explorer_view, name="recipes"),
    path("cook/<str:recipe_name>/", views.cooking_assistant_view, name="cook"),
    path("ai-verifier/", views.ai_verifier_view, name="ai_verifier"),
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("dashboard/", views.dashboard_view, name="dashboard"),
    path("favorites/", views.favorites_view, name="favorites"),
    path("favorite/<str:recipe_name>/", views.favorite_toggle, name="favorite_toggle"),

    # REST API Endpoints (Parity with Full-Stack System)
    path("api/geocode", views.api_geocode, name="api_geocode"),
    path("api/places/nearby", views.api_nearby_places, name="api_nearby_places_post"),
    path("api/places/search/", views.api_nearby_places, name="api_nearby_places_get"),
    path("api/ai/verify-image", views.api_verify_image, name="api_verify_image"),
    path("api/ai/search-food-image", views.api_search_food_image, name="api_search_food_image"),
    path("api/dataset-images", views.api_dataset_images, name="api_dataset_images"),
    path("api/analyze-food", views.api_analyze_food, name="api_analyze_food"),
    path("api/recipes/global-search", views.api_global_recipe_search, name="api_global_recipe_search"),
    path("api/ai/generate-variation", views.api_generate_recipe_variation, name="api_generate_recipe_variation"),
    path("api/retrain", views.api_retrain_model, name="api_retrain_model"),
]


