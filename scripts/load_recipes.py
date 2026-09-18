import json
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "foodsnap.settings")
django.setup()

from main.models import Recipe

def run():
    recipes_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'main', 'static', 'main', 'recipes.json')
    if not os.path.exists(recipes_path):
        print(f"File not found: {recipes_path}")
        return

    with open(recipes_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        Recipe.objects.update_or_create(
            name=item['name'],
            defaults={
                'calories': item.get('calories', ''),
                'cooking_time': item.get('cooking_time', ''),
                'ingredients': item.get('ingredients', ''),
                'directions': item.get('directions', '')
            }
        )
    print("Recipes loaded successfully!")

if __name__ == '__main__':
    run()
