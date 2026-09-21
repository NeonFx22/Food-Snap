import React, { useState } from 'react';
import { Recipe, UploadHistoryItem } from '../types';
import { getAllRecipes } from '../utils/mlEngine';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  Heart, 
  History, 
  Trash2, 
  Camera, 
  Clock, 
  Utensils, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

interface FavoritesListProps {
  favoriteIds: string[];
  historyItems: UploadHistoryItem[];
  onToggleFavorite: (recipeId: string) => void;
  onClearHistory: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onSelectImage: (src: string) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favoriteIds,
  historyItems,
  onToggleFavorite,
  onClearHistory,
  onSelectRecipe,
  onSelectImage
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'history'>('favorites');
  const allRecipes = getAllRecipes();

  const favoriteRecipes = allRecipes.filter(r => favoriteIds.includes(r.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-stone-200">
      {/* Top Banner with Sub-tabs */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
            <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            Personal Culinary Vault
          </div>
          <h1 className="text-3xl font-bold font-serif text-white tracking-tight">
            Saved Recipes &amp; Scan History
          </h1>
          <p className="text-stone-400 text-sm max-w-xl">
            Access your bookmarked traditional recipes and review historical image recognition inferences with confidence metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'favorites'
                ? 'bg-amber-500 text-stone-950 shadow font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeSubTab === 'favorites' ? 'fill-stone-950' : ''}`} />
            <span>Saved Favorites ({favoriteRecipes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-stone-950 shadow font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Scan History ({historyItems.length})</span>
          </button>
        </div>
      </div>

      {/* Subtab Content: Favorites */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-6">
          {favoriteRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favoriteRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all shadow-md group flex flex-col"
                >
                  <div className="w-full h-44 bg-stone-950 relative overflow-hidden">
                    <ImageWithFallback
                      src={recipe.referenceImages?.[0]}
                      alt={recipe.name}
                      foodName={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => onToggleFavorite(recipe.id)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-red-500/90 text-white backdrop-blur-md shadow hover:bg-red-600 transition-colors"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                    </button>
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md border border-stone-700 text-[10px] font-mono text-amber-300">
                      {recipe.category}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] text-stone-400 mb-0.5">{recipe.origin}</div>
                      <h3 className="font-bold text-base text-white font-serif line-clamp-1">{recipe.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {recipe.cooking_time || '40 mins'}
                        </span>
                        <span className="text-stone-500">•</span>
                        <span>{recipe.calories || '450 kcal'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectRecipe(recipe)}
                      className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan Recipe</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-900 border border-stone-800 rounded-2xl p-8 space-y-3">
              <Heart className="w-12 h-12 text-stone-600 mx-auto stroke-1" />
              <h3 className="text-lg font-bold text-white">No Saved Recipes Yet</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Explore our catalog of authentic dishes or identify meals using the scanner to bookmark your favorites here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Subtab Content: Scan History */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-mono">
              Displaying {historyItems.length} recent inferences
            </span>
            {historyItems.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {historyItems.length > 0 ? (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-700 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 flex-shrink-0 relative">
                      <ImageWithFallback
                        src={item.imagePreview}
                        alt={item.topMatchName}
                        foodName={item.topMatchName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white font-serif text-base">{item.topMatchName}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                          {item.confidence}% Match
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                        <span>{item.timestamp}</span>
                        <span>•</span>
                        <span className="font-mono text-stone-500">Latency: {item.inferenceMs} ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onSelectImage(item.imagePreview)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Re-analyze</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-900 border border-stone-800 rounded-2xl p-8 space-y-3">
              <History className="w-12 h-12 text-stone-600 mx-auto stroke-1" />
              <h3 className="text-lg font-bold text-white">No Scan History Yet</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Scan food images with the camera or upload photos to see your classification history recorded here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
