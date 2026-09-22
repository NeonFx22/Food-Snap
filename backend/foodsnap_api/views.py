import base64
import uuid
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import AfricanDish, FoodScan, FavoriteRecipe, UserProfile
from .serializers import (
    AfricanDishSerializer,
    FoodScanSerializer,
    FoodScanUploadSerializer,
    FavoriteRecipeSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)
from .ml_engine import classify_food_image

class HealthCheckView(APIView):
    """
    Health check and system status endpoint.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        dish_count = AfricanDish.objects.count()
        scan_count = FoodScan.objects.count()
        return Response({
            'status': 'healthy',
            'framework': 'Django REST Framework',
            'version': '1.0.0',
            'stats': {
                'indexed_dishes': dish_count,
                'total_scans': scan_count,
            },
            'database': 'SQLite / PostgreSQL Ready'
        })

    def head(self, request):
        return Response(status=status.HTTP_200_OK)


class AfricanDishViewSet(viewsets.ModelViewSet):
    """
    ViewSet for browsing, searching, and managing culinary dishes.
    """
    queryset = AfricanDish.objects.all()
    serializer_class = AfricanDishSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'origin', 'category', 'ingredients']
    ordering_fields = ['name', 'calories', 'prep_time_mins', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__iexact=category)
        origin = self.request.query_params.get('origin')
        if origin:
            qs = qs.filter(origin__icontains=origin)
        recipe_id = self.request.query_params.get('recipe_id')
        if recipe_id:
            qs = qs.filter(recipe_id__iexact=recipe_id)
        return qs

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Returns all distinct dish categories."""
        cats = AfricanDish.objects.values_list('category', flat=True).distinct()
        return Response({'categories': sorted(list(cats))})

    @action(detail=True, methods=['get'])
    def nutrition(self, request, pk=None):
        """Detailed nutritional breakdown for a specific dish."""
        dish = self.get_object()
        return Response({
            'dish': dish.name,
            'servings': dish.servings,
            'perServing': {
                'calories': dish.calories,
                'protein_g': dish.protein_g,
                'carbs_g': dish.carbs_g,
                'fat_g': dish.fat_g,
                'fiber_g': dish.fiber_g,
            },
            'macroRatio': {
                'proteinPct': round((dish.protein_g * 4 / dish.calories) * 100, 1) if dish.calories else 0,
                'carbsPct': round((dish.carbs_g * 4 / dish.calories) * 100, 1) if dish.calories else 0,
                'fatPct': round((dish.fat_g * 9 / dish.calories) * 100, 1) if dish.calories else 0,
            }
        })


class FoodRecognitionView(APIView):
    """
    Core Image Recognition API: Accepts food images via multipart file or Base64,
    processes with the Python CV & ML Classifier, and returns authentic recipe match.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FoodScanUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image_bytes = None
        mime_type = 'image/jpeg'
        image_preview = ''

        # Handle raw file upload
        if 'image_file' in request.FILES:
            file_obj = request.FILES['image_file']
            image_bytes = file_obj.read()
            mime_type = file_obj.content_type or 'image/jpeg'
            image_preview = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"
        # Handle Base64 string
        elif serializer.validated_data.get('image_base64'):
            b64_str = serializer.validated_data['image_base64']
            if ',' in b64_str:
                header, b64_data = b64_str.split(',', 1)
                if 'image/' in header:
                    mime_type = header.split(';')[0].replace('data:', '')
            else:
                b64_data = b64_str
            try:
                image_bytes = base64.b64decode(b64_data)
                image_preview = serializer.validated_data['image_base64']
            except Exception as e:
                return Response({'error': f'Invalid base64 encoding: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        if not image_bytes:
            return Response({'error': 'No image data received.'}, status=status.HTTP_400_BAD_REQUEST)

        # Run ML Computer Vision inference
        inference = classify_food_image(image_bytes, mime_type=mime_type)
        if not inference.get('success'):
            return Response(inference, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Associate or look up matching recipe in database
        predicted_recipe_id = inference.get('recipeId')
        matching_dish = None
        if predicted_recipe_id:
            matching_dish = AfricanDish.objects.filter(recipe_id__iexact=predicted_recipe_id).first()
        if not matching_dish and inference.get('dishName'):
            matching_dish = AfricanDish.objects.filter(name__icontains=inference['dishName']).first()

        # Log scan to database
        scan_id = serializer.validated_data.get('scan_id') or f"scan_{uuid.uuid4().hex[:10]}"
        user = request.user if request.user.is_authenticated else None

        food_scan = FoodScan.objects.create(
            scan_id=scan_id,
            user=user,
            image_data=image_preview[:500000] if image_preview else '',
            predicted_dish=matching_dish,
            predicted_name=inference.get('dishName', 'Unknown Dish'),
            confidence=inference.get('confidence', 0.0),
            detected_cues=inference.get('detectedVisualCues', []),
            visible_ingredients=inference.get('visibleIngredients', []),
            alternative_candidates=inference.get('alternativeCandidates', []),
            detection_engine=inference.get('engine', 'hybrid_vision')
        )

        response_payload = {
            'success': True,
            'scanId': food_scan.scan_id,
            'dishName': food_scan.predicted_name,
            'recipeId': matching_dish.recipe_id if matching_dish else predicted_recipe_id,
            'confidence': food_scan.confidence,
            'category': matching_dish.category if matching_dish else inference.get('category', 'Soups & Stews'),
            'origin': matching_dish.origin if matching_dish else inference.get('origin', 'West Africa'),
            'detectedVisualCues': food_scan.detected_cues,
            'visibleIngredients': food_scan.visible_ingredients,
            'alternativeCandidates': food_scan.alternative_candidates,
            'culinaryNotes': inference.get('culinaryNotes', ''),
            'engine': food_scan.detection_engine,
            'recipe': AfricanDishSerializer(matching_dish).data if matching_dish else None,
        }

        return Response(response_payload, status=status.HTTP_200_OK)


class FoodScanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for querying scan history.
    """
    queryset = FoodScan.objects.all()
    serializer_class = FoodScanSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            return qs.filter(user=self.request.user)
        return qs[:25]


class FavoriteViewSet(APIView):
    """
    Endpoint for saving and listing bookmarked recipes.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'favorites': []})
        favs = FavoriteRecipe.objects.filter(user=request.user)
        return Response({'favorites': FavoriteRecipeSerializer(favs, many=True).data})

    def post(self, request):
        recipe_id = request.data.get('recipe_id')
        is_favorite = request.data.get('is_favorite', True)
        
        if not recipe_id:
            return Response({'error': 'recipe_id required'}, status=status.HTTP_400_BAD_REQUEST)
            
        dish = get_object_or_404(AfricanDish, recipe_id=recipe_id)
        
        if not request.user.is_authenticated:
            return Response({'success': True, 'anonymous': True, 'recipe_id': recipe_id, 'is_favorite': is_favorite})
            
        if is_favorite:
            FavoriteRecipe.objects.get_or_create(user=request.user, dish=dish)
        else:
            FavoriteRecipe.objects.filter(user=request.user, dish=dish).delete()
            
        return Response({'success': True, 'recipe_id': recipe_id, 'is_favorite': is_favorite})


class AuthRegisterView(APIView):
    """
    User registration endpoint for Django backend.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        data = serializer.validated_data
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        profile = UserProfile.objects.create(
            user=user,
            displayName=data.get('displayName') or data['username'],
            dietary_preferences=data.get('dietary_preferences', [])
        )
        return Response({
            'success': True,
            'message': 'Account created successfully',
            'user': UserProfileSerializer(profile).data
        }, status=status.HTTP_201_CREATED)


class AuthLoginView(APIView):
    """
    User authentication endpoint.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        
        if not username_or_email or not password:
            return Response({'error': 'Credentials required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = None
        if '@' in username_or_email:
            user_obj = User.objects.filter(email__iexact=username_or_email).first()
            if user_obj:
                user = authenticate(request, username=user_obj.username, password=password)
        else:
            user = authenticate(request, username=username_or_email, password=password)
            
        if user is not None:
            login(request, user)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'user': UserProfileSerializer(profile).data
            })
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
