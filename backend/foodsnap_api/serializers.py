from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AfricanDish, FoodScan, FavoriteRecipe, UserProfile

class AfricanDishSerializer(serializers.ModelSerializer):
    """
    Serializer for culinary dishes with complete nutritional and cooking details.
    """
    class Meta:
        model = AfricanDish
        fields = [
            'id',
            'recipe_id',
            'name',
            'origin',
            'category',
            'difficulty',
            'prep_time_mins',
            'cook_time_mins',
            'servings',
            'calories',
            'protein_g',
            'carbs_g',
            'fat_g',
            'fiber_g',
            'image_url',
            'description',
            'visual_hallmarks',
            'ingredients',
            'instructions',
            'culinary_tips',
            'is_featured',
            'created_at',
            'updated_at',
        ]


class FoodScanSerializer(serializers.ModelSerializer):
    """
    Serializer for historical and new food scans.
    """
    predicted_dish_details = AfricanDishSerializer(source='predicted_dish', read_only=True)

    class Meta:
        model = FoodScan
        fields = [
            'id',
            'scan_id',
            'predicted_dish',
            'predicted_dish_details',
            'predicted_name',
            'confidence',
            'detected_cues',
            'visible_ingredients',
            'alternative_candidates',
            'detection_engine',
            'image_data',
            'timestamp',
        ]


class FoodScanUploadSerializer(serializers.Serializer):
    """
    Serializer for accepting a food photo via Base64 or direct file upload.
    """
    image_base64 = serializers.CharField(required=False, allow_blank=True)
    image_file = serializers.ImageField(required=False)
    scan_id = serializers.CharField(required=False, allow_blank=True)
    dish_hint = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('image_base64') and not data.get('image_file'):
            raise serializers.ValidationError("Either 'image_base64' or 'image_file' must be provided.")
        return data


class FavoriteRecipeSerializer(serializers.ModelSerializer):
    dish = AfricanDishSerializer(read_only=True)
    dish_id = serializers.PrimaryKeyRelatedField(
        queryset=AfricanDish.objects.all(), source='dish', write_only=True
    )

    class Meta:
        model = FavoriteRecipe
        fields = ['id', 'dish', 'dish_id', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'username',
            'email',
            'displayName',
            'dietary_preferences',
            'skill_level',
            'bio',
            'avatar_url',
            'created_at',
        ]


class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)
    displayName = serializers.CharField(required=False, default='')
    dietary_preferences = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
