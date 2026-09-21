import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { getAllRecipes } from '../utils/mlEngine';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  Search, 
  Heart, 
  Clock, 
  Flame, 
  Users, 
  Camera, 
  Utensils, 
  Filter, 
  X, 
  ChevronRight, 
  BookOpen 
} from 'lucide-react';

interface RecipeExplorerProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

export const RecipeExplorer: React.FC<RecipeExplorerProps> = ({
  onSelectRecipe,
  onToggleFavorite,
  isFavorite
}) => {
  const allRecipes = useMemo(() => getAllRecipes(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<Recipe | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allRecipes.forEach(r => {
      if (r.category) set.add(r.category);
    });
    return ['all', ...Array.from(set)];
  }, [allRecipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      const matchesSearch = 
        !searchQuery ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (recipe.tags && recipe.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCat = 
        selectedCategory === 'all' || 
        recipe.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [allRecipes, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-stone-200">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Gastronomy Catalog • {allRecipes.length} Authentic Recipes
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
            Culinary Heritage &amp; Recipe Explorer
          </h1>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Browse authentic traditional recipes complete with culinary measurements, cooking step breakdowns, and ground-truth benchmark references.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipes, origins, or ingredients (e.g. jollof, melon seeds, peppers)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-200 placeholder-stone-500 text-sm focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                }`}
              >
                {cat === 'all' ? 'All Dishes' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredRecipes.map((recipe) => {
          const isFav = isFavorite(recipe.id);
          const imgSrc = recipe.referenceImages?.[0];

          return (
            <div
              key={recipe.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all shadow-md group flex flex-col"
            >
              {/* Image Section */}
              <div 
                className="w-full h-48 bg-stone-950 relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedRecipeForModal(recipe)}
              >
                <ImageWithFallback
                  src={imgSrc}
                  alt={recipe.name}
                  foodName={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe.id);
                  }}
                  className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all ${
                    isFav
                      ? 'bg-red-500/90 border-red-400 text-white'
                      : 'bg-stone-950/70 border-stone-700 text-stone-300 hover:text-white'
                  }`}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                </button>

                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-700/80 text-[10px] font-mono text-amber-300">
                  {recipe.category || 'Dish'}
                </div>
              </div>

              {/* Body Section */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span>{recipe.origin}</span>
                    <span className="font-mono text-stone-500">{recipe.calories || '450 kcal'}</span>
                  </div>

                  <h3 
                    onClick={() => setSelectedRecipeForModal(recipe)}
                    className="font-bold text-base text-white hover:text-amber-300 cursor-pointer transition-colors font-serif line-clamp-1"
                  >
                    {recipe.name}
                  </h3>

                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {recipe.cooking_time || '40 mins'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      {recipe.difficulty || 'Medium'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedRecipeForModal(recipe)}
                    className="text-xs text-stone-400 hover:text-amber-400 font-semibold transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onSelectRecipe(recipe)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                    title="Load reference image into recognition pipeline"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Sample</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-16 bg-stone-900/60 rounded-2xl border border-stone-800 p-8">
          <Utensils className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No recipes found</h3>
          <p className="text-xs text-stone-400 mb-4">Try searching with a different ingredient or dish keyword</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipeForModal && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedRecipeForModal(null)}
        >
          <div 
            className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  {selectedRecipeForModal.category} • {selectedRecipeForModal.origin}
                </span>
                <h2 className="text-2xl font-bold font-serif text-white mt-0.5">
                  {selectedRecipeForModal.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecipeForModal(null)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-56 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 relative">
              <ImageWithFallback
                src={selectedRecipeForModal.referenceImages?.[0]}
                alt={selectedRecipeForModal.name}
                foodName={selectedRecipeForModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center bg-stone-950/60 p-3 rounded-xl border border-stone-800">
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-mono">Time</div>
                <div className="text-xs font-bold text-stone-200 mt-0.5">{selectedRecipeForModal.cooking_time || '45 mins'}</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-mono">Calories</div>
                <div className="text-xs font-bold text-stone-200 mt-0.5">{selectedRecipeForModal.calories || '450 kcal'}</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-mono">Servings</div>
                <div className="text-xs font-bold text-stone-200 mt-0.5">{selectedRecipeForModal.servings || '4'}</div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Authentic Ingredients</h4>
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1.5 max-h-48 overflow-y-auto">
                {selectedRecipeForModal.ingredients?.split(',').map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span>{ing.trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Directions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Preparation Instructions</h4>
              <p className="text-xs text-stone-300 leading-relaxed bg-stone-950 p-3.5 rounded-xl border border-stone-800 whitespace-pre-line">
                {selectedRecipeForModal.directions}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800">
              <button
                onClick={() => {
                  onToggleFavorite(selectedRecipeForModal.id);
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite(selectedRecipeForModal.id) ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFavorite(selectedRecipeForModal.id) ? 'Favorited' : 'Add to Favorites'}</span>
              </button>

              <button
                onClick={() => {
                  onSelectRecipe(selectedRecipeForModal);
                  setSelectedRecipeForModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Test in Scanner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
