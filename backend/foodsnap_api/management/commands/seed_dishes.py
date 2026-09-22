from django.core.management.base import BaseCommand
from foodsnap_api.models import AfricanDish

SEED_DISHES = [
    {
        'recipe_id': 'ogbono-soup',
        'name': 'Ogbono Soup',
        'origin': 'Nigeria / West Africa',
        'category': 'Soups & Stews',
        'difficulty': 'Medium',
        'prep_time_mins': 20,
        'cook_time_mins': 40,
        'servings': 6,
        'calories': 480,
        'protein_g': 28.0,
        'carbs_g': 18.0,
        'fat_g': 34.0,
        'fiber_g': 7.0,
        'image_url': '/dataset/images/ogbono-soup.jpg',
        'description': 'Celebrated Nigerian draw soup prepared by dissolving milled ogbono seeds (Irvingia gabonensis) in rich palm oil and simmering with braised meats, stockfish, and leafy greens.',
        'visual_hallmarks': [
            'Viscous mucilaginous draw consistency from wild mango seeds',
            'Rich red-orange palm oil soup base with shredded ugu leaves or bitterleaf',
            'Assorted braised beef, smoked catfish, stockfish, and ground crayfish'
        ],
        'ingredients': [
            {'name': 'Milled Ogbono Seeds', 'amount': '1.5 cups', 'optional': False},
            {'name': 'Pure Red Palm Oil', 'amount': '1/2 cup', 'optional': False},
            {'name': 'Assorted Meats (Beef, Shaki)', 'amount': '750g', 'optional': False},
            {'name': 'Smoked Catfish & Stockfish', 'amount': '250g', 'optional': False},
            {'name': 'Shredded Ugu or Spinach Leaves', 'amount': '2 cups', 'optional': False},
            {'name': 'Ground Crayfish', 'amount': '3 tbsp', 'optional': False},
            {'name': 'Scotch Bonnet Peppers (blended)', 'amount': '2 peppers', 'optional': False},
        ],
        'instructions': [
            'Season and braise the assorted meats and stockfish in a pot until tender, reserving the rich meat broth.',
            'In a dry pan or bowl, dissolve the milled ogbono powder in warm palm oil until a smooth paste forms.',
            'Pour the dissolved ogbono mixture into the simmering meat stock over medium-low heat, stirring constantly as it draws and thickens.',
            'Add ground crayfish, blended scotch bonnets, and smoked catfish. Simmer for 15 minutes to fully cook out the seeds.',
            'Stir in the shredded ugu leaves or spinach, cook for 3 more minutes, and remove from heat.',
            'Serve piping hot alongside freshly pounded yam, eba, or fufu.'
        ],
        'culinary_tips': [
            'Always dissolve the ogbono powder in palm oil off the flame first to avoid lumps.',
            'Do not cover the pot during the initial simmer to maintain the draw elasticity.'
        ],
        'is_featured': True
    },
    {
        'recipe_id': 'egusi-soup',
        'name': 'Egusi Soup',
        'origin': 'Nigeria / Ghana',
        'category': 'Soups & Stews',
        'difficulty': 'Medium',
        'prep_time_mins': 25,
        'cook_time_mins': 45,
        'servings': 6,
        'calories': 520,
        'protein_g': 32.0,
        'carbs_g': 16.0,
        'fat_g': 38.0,
        'fiber_g': 8.0,
        'image_url': '/dataset/images/egusi-soup.jpg',
        'description': 'A beloved West African soup made from protein-rich ground melon seeds, cooked into fluffy curds in palm oil with bitterleaf or spinach, dried fish, and tender beef.',
        'visual_hallmarks': [
            'Distinctive golden-yellow granular melon seed curds',
            'Vibrant dark green spinach or bitterleaf vegetables',
            'Aromatic palm oil base with shredded dried fish'
        ],
        'ingredients': [
            {'name': 'Ground Egusi (Melon Seeds)', 'amount': '2 cups', 'optional': False},
            {'name': 'Palm Oil', 'amount': '1/2 cup', 'optional': False},
            {'name': 'Braised Beef & Tripe', 'amount': '600g', 'optional': False},
            {'name': 'Dried Fish & Stockfish', 'amount': '200g', 'optional': False},
            {'name': 'Fresh Spinach or Bitterleaf', 'amount': '3 cups', 'optional': False},
            {'name': 'Locust Beans (Iru)', 'amount': '2 tbsp', 'optional': False},
        ],
        'instructions': [
            'Boil meats and stockfish with onions, seasoning cubes, and salt until succulent.',
            'Mix ground egusi with lukewarm water or onion puree to create a thick paste.',
            'Heat palm oil in a wide saucepan, add chopped onions, and scoop small lumps of egusi paste into the hot oil.',
            'Fry gently for 10 minutes without stirring aggressively so distinct tender curds form.',
            'Pour in the hot meat broth and iru, simmer for 20 minutes until the oil separates.',
            'Fold in the fresh greens and smoked catfish, simmer for 4 minutes and serve.'
        ],
        'culinary_tips': ['Frying the egusi paste into little lumpy curds creates the classic authentic texture.'],
        'is_featured': True
    },
    {
        'recipe_id': 'jollof-rice',
        'name': 'Nigerian Jollof Rice',
        'origin': 'West Africa',
        'category': 'Rice Dishes',
        'difficulty': 'Medium',
        'prep_time_mins': 20,
        'cook_time_mins': 50,
        'servings': 8,
        'calories': 410,
        'protein_g': 10.0,
        'carbs_g': 72.0,
        'fat_g': 9.0,
        'fiber_g': 4.0,
        'image_url': '/dataset/images/jollof-rice.jpg',
        'description': 'The iconic crown jewel of West African celebrations: parboiled long-grain rice slow-cooked in a reduced puree of roasted bell peppers, tomatoes, onions, thyme, and rich stock.',
        'visual_hallmarks': [
            'Vibrant reddish-orange long-grain rice grains',
            'Rich seasoned tomato and red bell pepper reduction glaze',
            'Caramelized smoky bottom-pot layer'
        ],
        'ingredients': [
            {'name': 'Long-Grain Parboiled Rice', 'amount': '4 cups', 'optional': False},
            {'name': 'Red Bell Peppers (Tatashe)', 'amount': '5 whole', 'optional': False},
            {'name': 'Plum Tomatoes', 'amount': '6 whole', 'optional': False},
            {'name': 'Scotch Bonnet Peppers', 'amount': '3 whole', 'optional': False},
            {'name': 'Onions', 'amount': '3 large', 'optional': False},
            {'name': 'Concentrated Beef or Chicken Broth', 'amount': '3 cups', 'optional': False},
            {'name': 'Dried Thyme, Curry, Bay Leaves', 'amount': '1 tbsp each', 'optional': False},
            {'name': 'Butter', 'amount': '2 tbsp', 'optional': True},
        ],
        'instructions': [
            'Blend bell peppers, tomatoes, scotch bonnets, and 2 onions into a smooth puree and boil down until thick.',
            'In a heavy-bottomed pot, heat vegetable oil, slice remaining onion, and fry until fragrant.',
            'Add tomato paste and fry for 5 minutes, then add the boiled pepper puree and fry until oil floats.',
            'Season with curry, thyme, bay leaves, garlic, ginger, and bouillon.',
            'Pour in the flavorful stock, bring to a rolling boil, and adjust salt.',
            'Wash parboiled rice thoroughly and add to the pot. Liquid should just level with the rice.',
            'Cover with foil and tight-fitting lid to steam on low heat for 35 minutes.',
            'Turn up heat for the final 5 minutes to create the signature party-jollof smoky bottom crust.'
        ],
        'culinary_tips': ['Use aluminum foil under the lid—the steam cooks the rice evenly without making it soggy.'],
        'is_featured': True
    },
    {
        'recipe_id': 'suya',
        'name': 'Suya Skewers',
        'origin': 'Northern Nigeria / Sahel',
        'category': 'Grilled & Smoked',
        'difficulty': 'Easy',
        'prep_time_mins': 30,
        'cook_time_mins': 15,
        'servings': 4,
        'calories': 380,
        'protein_g': 42.0,
        'carbs_g': 8.0,
        'fat_g': 20.0,
        'fiber_g': 2.5,
        'image_url': '/dataset/images/suya.jpg',
        'description': 'Thin strips of spiced beef coated in aromatic Yaji (kuli-kuli peanut press cake, ginger, chili, and garlic), threaded onto skewers and flame-grilled over open coals.',
        'visual_hallmarks': [
            'Thin sliced skewered beef with flame-charred caramelized edges',
            'Generous coating of coarse reddish-brown Yaji peanut spice mix',
            'Garnished with raw sliced red onions, tomatoes, and cabbage'
        ],
        'ingredients': [
            {'name': 'Beef Sirloin or Flank', 'amount': '600g (thinly sliced)', 'optional': False},
            {'name': 'Yaji Suya Spice (Kuli-kuli powder)', 'amount': '1/2 cup', 'optional': False},
            {'name': 'Ground Ginger & Garlic', 'amount': '1 tbsp each', 'optional': False},
            {'name': 'Ground Cayenne Pepper', 'amount': '1 tsp', 'optional': False},
            {'name': 'Vegetable Oil', 'amount': '3 tbsp', 'optional': False},
            {'name': 'Red Onion & Cabbage', 'amount': 'For serving', 'optional': False},
        ],
        'instructions': [
            'Slice beef against the grain into wafer-thin wide ribbons.',
            'Thread beef ribbons onto pre-soaked bamboo skewers in an accordion pattern.',
            'Brush skewers generously with oil, then press into a plate of Yaji spice until thoroughly coated.',
            'Rest for 20 minutes to allow the spices to penetrate.',
            'Grill over medium-high heat on charcoal or broiler for 4-5 minutes per side until charred and cooked through.',
            'Sprinkle with extra Yaji and serve hot wrapped in newsprint or foil with fresh sliced onions.'
        ],
        'culinary_tips': ['Freezing the beef for 30 minutes makes slicing wafer-thin strips much easier.'],
        'is_featured': True
    },
    {
        'recipe_id': 'pounded-yam',
        'name': 'Pounded Yam',
        'origin': 'Nigeria / West Africa',
        'category': 'Swallows',
        'difficulty': 'Medium',
        'prep_time_mins': 15,
        'cook_time_mins': 30,
        'servings': 4,
        'calories': 340,
        'protein_g': 3.5,
        'carbs_g': 80.0,
        'fat_g': 0.5,
        'fiber_g': 6.0,
        'image_url': '/dataset/images/pounded-yam.jpg',
        'description': 'The king of West African swallows: tubers of sweet African white yam boiled until soft, then pounded vigorously in a wooden mortar or food processor into an elastic, silky alabaster mound.',
        'visual_hallmarks': [
            'Silky alabaster white swallow mound',
            'Pliable elastic texture',
            'Molded sphere serving presentation'
        ],
        'ingredients': [
            {'name': 'African White Yam (Dioscorea rotundata)', 'amount': '1 medium tuber', 'optional': False},
            {'name': 'Water', 'amount': 'Enough to submerge yam', 'optional': False},
        ],
        'instructions': [
            'Peel the yam, cut into rounds, and wash with cold water.',
            'Place yam chunks in a pot, add water, and boil vigorously until a fork pierces through with zero resistance.',
            'Transfer hot yam into a mortar or heavy-duty food processor.',
            'Pound while hot until lump-free, silky, stretchy, and elastic.',
            'Shape into smooth round portions and serve immediately with piping hot soup.'
        ],
        'culinary_tips': ['Pound while the yam chunks are steaming hot to ensure a velvety smooth texture.'],
        'is_featured': True
    },
    {
        'recipe_id': 'moin-moin',
        'name': 'Moin Moin',
        'origin': 'Nigeria',
        'category': 'Bean Delicacies',
        'difficulty': 'Medium',
        'prep_time_mins': 30,
        'cook_time_mins': 50,
        'servings': 6,
        'calories': 290,
        'protein_g': 18.0,
        'carbs_g': 32.0,
        'fat_g': 10.0,
        'fiber_g': 9.0,
        'image_url': '/dataset/images/moi-moi.jpg',
        'description': 'Nutritious steamed bean pudding crafted from pureed peeled honey beans, red bell peppers, onions, and scotch bonnet, studded with boiled egg slices and flaked fish.',
        'visual_hallmarks': [
            'Steamed golden-orange bean pudding loaf',
            'Smooth silky texture',
            'Hard-boiled egg or fish slice inclusion'
        ],
        'ingredients': [
            {'name': 'Peeled Black-Eyed Peas or Honey Beans', 'amount': '2 cups', 'optional': False},
            {'name': 'Red Bell Peppers (Tatashe)', 'amount': '3 whole', 'optional': False},
            {'name': 'Scotch Bonnet', 'amount': '2 whole', 'optional': False},
            {'name': 'Vegetable Oil', 'amount': '1/2 cup', 'optional': False},
            {'name': 'Boiled Eggs / Flaked Fish', 'amount': '3 eggs', 'optional': True},
        ],
        'instructions': [
            'Soak beans and remove skin completely.',
            'Blend peeled beans with bell peppers, scotch bonnets, onions, and warm water to a smooth batter.',
            'Whisk the batter thoroughly for 5 minutes to incorporate air for a light texture.',
            'Fold in oil, ground crayfish, seasoning, and salt.',
            'Scoop batter into banana leaf wraps or heatproof ramekins, topping with egg slices.',
            'Steam in a covered pot on a steamer rack for 45-50 minutes until firm.'
        ],
        'culinary_tips': ['Whisking the bean batter vigorously incorporates air, giving the pudding a fluffy souffle-like texture.'],
        'is_featured': True
    }
]

class Command(BaseCommand):
    help = 'Seeds initial authentic African dishes into the database'

    def handle(self, *args, **options):
        self.stdout.write("Starting FoodSnap culinary database seed...")
        created_count = 0
        updated_count = 0

        for data in SEED_DISHES:
            recipe_id = data['recipe_id']
            dish, created = AfricanDish.objects.update_or_create(
                recipe_id=recipe_id,
                defaults=data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created dish: {dish.name}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"Updated dish: {dish.name}"))

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded database! ({created_count} created, {updated_count} updated, {AfricanDish.objects.count()} total)"
        ))
