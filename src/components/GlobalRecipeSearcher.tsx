import React, { useState, useEffect } from 'react';
import { GlobalRecipe, Recipe } from '../types';
import { researchDishGlobally, CURATED_GLOBAL_RECIPES } from '../services/globalRecipeService';
import { saveCustomRecipe } from '../utils/mlEngine';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Clock, 
  MapPin, 
  Camera, 
  PlusCircle, 
  ChefHat, 
  Check, 
  Utensils, 
  Flame, 
  AlertCircle 
} from 'lucide-react';

interface GlobalRecipeSearcherProps {
  initialQuery?: string;
  onSelectRecipeForScan: (recipe: Recipe) => void;
  onOpenNearbyRestaurants?: (dishName: string) => void;
  onRecipeAddedToCatalog?: () => void;
}

const POPULAR_SUGGESTIONS = [
  'West African Jollof Rice',
  'Authentic Nigerian Egusi Soup',
  'Street-Style Beef Suya',
  'Tonkotsu Ramen',
  'Birria Tacos',
  'Chicken Tikka Masala',
  'Spanish Paella',
  'Italian Carbonara'
];

export const GlobalRecipeSearcher: React.FC<GlobalRecipeSearcherProps> = ({
  initialQuery = '',
  onSelectRecipeForScan,
  onOpenNearbyRestaurants,
  onRecipeAddedToCatalog
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recipeResult, setRecipeResult] = useState<GlobalRecipe | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performSearch = async (searchDish: string) => {
    const clean = searchDish.trim();
    if (!clean) return;

    setIsLoading(true);
    setErrorMsg(null);
    setAddedSuccess(false);

    try {
      const res = await researchDishGlobally(clean, selectedCuisine);
      if (res) {
        setRecipeResult(res);
      } else {
        setErrorMsg(`Could not retrieve recipe for "${clean}". Please check spelling.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error researching global recipe');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial query if passed
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    } else {
      // Default to first curated recipe
      setRecipeResult(CURATED_GLOBAL_RECIPES[0]);
    }
  }, [initialQuery]);

  const handleAddToCatalog = async () => {
    if (!recipeResult) return;

    const adaptedRecipe: Recipe = {
      id: recipeResult.id,
      name: recipeResult.name,
      category: recipeResult.category || 'Global Cuisine',
      origin: recipeResult.origin || recipeResult.cuisine,
      cooking_time: recipeResult.cookTime || '40 mins',
      servings: recipeResult.servings || '4 servings',
      difficulty: recipeResult.difficulty || 'Medium',
      calories: recipeResult.calories || '450 kcal',
      ingredients: recipeResult.ingredientsList.map(i => `${i.amount} ${i.item} ${i.notes ? `(${i.notes})` : ''}`).join(', '),
      directions: recipeResult.directions.join('\n'),
      tags: [recipeResult.cuisine, ...(recipeResult.dietaryTags || [])],
      referenceImages: [recipeResult.imageUrl],
      isCustom: true
    };

    await saveCustomRecipe(adaptedRecipe, recipeResult.imageUrl);
    setAddedSuccess(true);
    if (onRecipeAddedToCatalog) {
      onRecipeAddedToCatalog();
    }
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleScanThisRecipe = () => {
    if (!recipeResult) return;
    const adaptedRecipe: Recipe = {
      id: recipeResult.id,
      name: recipeResult.name,
      category: recipeResult.category,
      origin: recipeResult.origin,
      cooking_time: recipeResult.cookTime,
      servings: recipeResult.servings,
      difficulty: recipeResult.difficulty,
      calories: recipeResult.calories,
      ingredients: recipeResult.ingredientsList.map(i => `${i.amount} ${i.item}`).join(', '),
      directions: recipeResult.directions.join('\n'),
      tags: [recipeResult.cuisine],
      referenceImages: [recipeResult.imageUrl]
    };
    onSelectRecipeForScan(adaptedRecipe);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-stone-200">
      {/* Search Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            Gastronomy Intelligence Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
            Worldwide Culinary Recipe Research
          </h1>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Search any dish from any cuisine worldwide. Our culinary system synthesizes verified traditional ingredients, preparation methods, and nutritional profiles.
          </p>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            performSearch(query);
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search any dish in the world (e.g. Suya, Ramen, Tagine, Biryani, Pho)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-200 placeholder-stone-500 text-sm focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Researching...' : 'Search Recipe'}</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500">Popular:</span>
          {POPULAR_SUGGESTIONS.map((dish) => (
            <button
              key={dish}
              onClick={() => {
                setQuery(dish);
                performSearch(dish);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors"
            >
              {dish}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recipe Dossier Card */}
      {recipeResult && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Hero Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 border-b border-stone-800">
            <div className="lg:col-span-4 space-y-4">
              <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 relative shadow-inner">
                <ImageWithFallback
                  src={recipeResult.imageUrl}
                  alt={recipeResult.name}
                  foodName={recipeResult.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-700 text-xs font-mono text-amber-300">
                  {recipeResult.cuisine}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {onOpenNearbyRestaurants && (
                  <button
                    onClick={() => onOpenNearbyRestaurants(recipeResult.name)}
                    className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Find Restaurants Serving This Dish</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleScanThisRecipe}
                    className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scan in Scanner</span>
                  </button>

                  <button
                    onClick={handleAddToCatalog}
                    className="py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Added!</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Add to Catalog</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recipe Content Column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-stone-400 mb-1">
                  <span>{recipeResult.category}</span>
                  <span>•</span>
                  <span>{recipeResult.origin}</span>
                </div>
                <h2 className="text-3xl font-bold font-serif text-white">
                  {recipeResult.name}
                </h2>
                <p className="text-stone-300 text-sm leading-relaxed mt-2">
                  {recipeResult.description}
                </p>
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase font-mono">Prep Time</div>
                  <div className="text-sm font-bold text-white mt-0.5">{recipeResult.prepTime}</div>
                </div>
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase font-mono">Cook Time</div>
                  <div className="text-sm font-bold text-white mt-0.5">{recipeResult.cookTime}</div>
                </div>
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase font-mono">Servings</div>
                  <div className="text-sm font-bold text-white mt-0.5">{recipeResult.servings}</div>
                </div>
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase font-mono">Difficulty</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">{recipeResult.difficulty}</div>
                </div>
              </div>

              {/* Flavor Profile & Dietary Tags */}
              <div className="flex flex-wrap gap-2">
                {recipeResult.flavorProfile?.map((flavor, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-stone-800 text-xs font-medium text-stone-300">
                    {flavor}
                  </span>
                ))}
                {recipeResult.dietaryTags?.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-medium border border-amber-500/20">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Nutrition breakdown */}
              {recipeResult.nutrition && (
                <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 flex items-center justify-around text-center text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px] font-mono">PROTEIN</span>
                    <span className="font-bold text-stone-200">{recipeResult.nutrition.protein}</span>
                  </div>
                  <div className="h-6 w-px bg-stone-800" />
                  <div>
                    <span className="text-stone-500 block text-[10px] font-mono">CARBS</span>
                    <span className="font-bold text-stone-200">{recipeResult.nutrition.carbs}</span>
                  </div>
                  <div className="h-6 w-px bg-stone-800" />
                  <div>
                    <span className="text-stone-500 block text-[10px] font-mono">FAT</span>
                    <span className="font-bold text-stone-200">{recipeResult.nutrition.fat}</span>
                  </div>
                  {recipeResult.nutrition.fiber && (
                    <>
                      <div className="h-6 w-px bg-stone-800" />
                      <div>
                        <span className="text-stone-500 block text-[10px] font-mono">FIBER</span>
                        <span className="font-bold text-stone-200">{recipeResult.nutrition.fiber}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ingredients & Step-by-Step Directions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Ingredients Column */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Authentic Ingredients</span>
              </h3>
              <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 space-y-2.5">
                {recipeResult.ingredientsList?.map((ing, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 text-xs border-b border-stone-800/60 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-stone-200">{ing.item}</span>
                      {ing.notes && <p className="text-[11px] text-stone-500">{ing.notes}</p>}
                    </div>
                    <span className="font-mono text-amber-400/90 font-medium whitespace-nowrap">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Directions Column */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span>Preparation &amp; Cooking Steps</span>
              </h3>
              <div className="space-y-3">
                {recipeResult.directions?.map((dir, i) => (
                  <div key={i} className="bg-stone-950 rounded-xl p-4 border border-stone-800 flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {dir}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chef Tips */}
              {recipeResult.chefTips && recipeResult.chefTips.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2 text-xs text-amber-200">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gastronomy Chef Secrets
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-amber-200/90">
                    {recipeResult.chefTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
