from django.db import models
from django.contrib.auth.models import User

class AfricanDish(models.Model):
    """
    Model representing an authentic West African or international culinary dish.
    """
    CATEGORY_CHOICES = [
        ('Soups & Stews', 'Soups & Stews'),
        ('Rice Dishes', 'Rice Dishes'),
        ('Swallows', 'Swallows'),
        ('Pastries & Snacks', 'Pastries & Snacks'),
        ('Grilled & Smoked', 'Grilled & Smoked'),
        ('Bean Delicacies', 'Bean Delicacies'),
        ('Breakfast & Porridge', 'Breakfast & Porridge'),
        ('Beverages', 'Beverages'),
        ('International Classics', 'International Classics'),
    ]

    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    recipe_id = models.SlugField(max_length=120, unique=True, db_index=True)
    name = models.CharField(max_length=200, db_index=True)
    origin = models.CharField(max_length=150, default='West Africa')
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Soups & Stews')
    difficulty = models.CharField(max_length=50, choices=DIFFICULTY_CHOICES, default='Medium')
    
    # Timing & Servings
    prep_time_mins = models.PositiveIntegerField(default=20)
    cook_time_mins = models.PositiveIntegerField(default=45)
    servings = models.PositiveIntegerField(default=4)
    
    # Nutritional breakdown per serving
    calories = models.PositiveIntegerField(default=450)
    protein_g = models.FloatField(default=22.0)
    carbs_g = models.FloatField(default=45.0)
    fat_g = models.FloatField(default=16.0)
    fiber_g = models.FloatField(default=5.0)
    
    # Media & Visual Recognition
    image_url = models.CharField(max_length=500)
    description = models.TextField()
    visual_hallmarks = models.JSONField(default=list, blank=True, help_text="Distinctive visual traits for CV detection")
    
    # Structured Recipe Content
    ingredients = models.JSONField(default=list, help_text="Structured list of ingredients and measures")
    instructions = models.JSONField(default=list, help_text="Step-by-step culinary preparation instructions")
    culinary_tips = models.JSONField(default=list, blank=True, help_text="Chef advice for optimal flavor")
    
    # Metadata
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Culinary Dish'
        verbose_name_plural = 'Culinary Dishes'

    def __str__(self):
        return f"{self.name} ({self.origin})"


class FoodScan(models.Model):
    """
    Log of computer vision and AI food scan inferences performed by users.
    """
    scan_id = models.CharField(max_length=100, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='scans')
    
    # Uploaded image reference or Base64 URI
    image = models.ImageField(upload_to='scans/%Y/%m/', null=True, blank=True)
    image_data = models.TextField(blank=True, help_text="Data URL or preview URL")
    
    # Prediction Results
    predicted_dish = models.ForeignKey(AfricanDish, on_delete=models.SET_NULL, null=True, blank=True, related_name='scans')
    predicted_name = models.CharField(max_length=200)
    confidence = models.FloatField(default=0.0, help_text="Prediction confidence percentage (0-100)")
    
    detected_cues = models.JSONField(default=list, blank=True)
    visible_ingredients = models.JSONField(default=list, blank=True)
    alternative_candidates = models.JSONField(default=list, blank=True)
    
    detection_engine = models.CharField(
        max_length=50,
        default='hybrid_vision',
        choices=[
            ('hybrid_vision', 'Hybrid Color-Texture ML Engine'),
            ('gemini_vision', 'Gemini Multimodal Vision API'),
            ('manual_match', 'Manual Recipe Selection')
        ]
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Food Scan Inference'
        verbose_name_plural = 'Food Scan Inferences'

    def __str__(self):
        return f"Scan {self.scan_id}: {self.predicted_name} ({self.confidence:.1f}%)"


class FavoriteRecipe(models.Model):
    """
    User bookmarked and saved recipes.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='foodsnap_favorites')
    dish = models.ForeignKey(AfricanDish, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'dish')
        ordering = ['-created_at']
        verbose_name = 'Favorite Recipe'
        verbose_name_plural = 'Favorite Recipes'

    def __str__(self):
        return f"{self.user.username} -> {self.dish.name}"


class UserProfile(models.Model):
    """
    Extended user profile for culinary skill, dietary restrictions, and regional taste.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='foodsnap_profile')
    displayName = models.CharField(max_length=150, blank=True)
    dietary_preferences = models.JSONField(default=list, blank=True)
    skill_level = models.CharField(max_length=50, default='Home Chef')
    bio = models.TextField(blank=True)
    avatar_url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile for {self.user.username} ({self.displayName or self.user.username})"
