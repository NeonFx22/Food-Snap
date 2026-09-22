from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    HealthCheckView,
    AfricanDishViewSet,
    FoodRecognitionView,
    FoodScanViewSet,
    FavoriteViewSet,
    AuthRegisterView,
    AuthLoginView,
)

router = DefaultRouter()
router.register(r'recipes', AfricanDishViewSet, basename='recipe')
router.register(r'scans', FoodScanViewSet, basename='scan')

urlpatterns = [
    # Health & status
    path('health/', HealthCheckView.as_view(), name='api-health'),
    
    # Core Image Recognition
    path('recognize/', FoodRecognitionView.as_view(), name='api-recognize'),
    
    # Bookmarks / Favorites
    path('favorites/', FavoriteViewSet.as_view(), name='api-favorites'),
    
    # Authentication
    path('auth/register/', AuthRegisterView.as_view(), name='api-register'),
    path('auth/login/', AuthLoginView.as_view(), name='api-login'),
    
    # Router views (recipes, scans)
    path('', include(router.urls)),
]
