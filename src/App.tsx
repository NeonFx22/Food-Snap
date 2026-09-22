import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { MatchResults } from './components/MatchResults';
import { FeatureVisualizer } from './components/FeatureVisualizer';
import { RecipeExplorer } from './components/RecipeExplorer';
import { FavoritesList } from './components/FavoritesList';
import { DashboardStats } from './components/DashboardStats';
import { OnboardingGuide } from './components/OnboardingGuide';
import { GlobalRecipeSearcher } from './components/GlobalRecipeSearcher';
import { NearbyRestaurantFinder } from './components/NearbyRestaurantFinder';
import { LoadingPage } from './components/LoadingPage';
import { DatasetExplorer } from './components/DatasetExplorer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { DjangoBackendModal } from './components/DjangoBackendModal';
import { useAuth } from './context/AuthContext';
import { syncFavoriteToCloud, fetchUserFavoritesFromCloud, saveScanToCloud } from './services/userService';
import { matchFoodImage, getAllRecipes } from './utils/mlEngine';
import { FeatureVector, MatchResult, Recipe, UploadHistoryItem } from './types';
import { AlertCircle, X, ArrowLeft, Camera, Sparkles } from 'lucide-react';

export default function App() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [queryFeatures, setQueryFeatures] = useState<FeatureVector | null>(null);
  const [inferenceMs, setInferenceMs] = useState<number>(18.4);
  const [recipeCatalogCount, setRecipeCatalogCount] = useState<number>(() => getAllRecipes().length);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDjangoModalOpen, setIsDjangoModalOpen] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [globalSearchInitialQuery, setGlobalSearchInitialQuery] = useState<string>('');
  const [restaurantInitialFood, setRestaurantInitialFood] = useState<string>('');

  // Local storage persisted state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('foodsnap_favorites');
      return saved ? JSON.parse(saved) : ['jollof-rice', 'suya'];
    } catch {
      return ['jollof-rice', 'suya'];
    }
  });

  const [historyItems, setHistoryItems] = useState<UploadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('foodsnap_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('foodsnap_favorites', JSON.stringify(favoriteIds));
    } catch (e) {
      console.error('Failed to persist favorites:', e);
    }
  }, [favoriteIds]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('foodsnap_history', JSON.stringify(historyItems));
    } catch (e) {
      console.error('Failed to persist history:', e);
    }
  }, [historyItems]);

  // Cloud favorites sync on user login
  useEffect(() => {
    if (user?.uid) {
      fetchUserFavoritesFromCloud(user.uid).then((cloudIds) => {
        if (cloudIds && cloudIds.length > 0) {
          setFavoriteIds((prev) => Array.from(new Set([...prev, ...cloudIds])));
        }
      }).catch((err) => console.warn('Cloud fav sync warning:', err));
    }
  }, [user?.uid]);

  const runImageRecognition = async (imgSrc: string) => {
    setIsLoading(true);
    setScanError(null);
    try {
      const [result] = await Promise.all([
        matchFoodImage(imgSrc),
        new Promise((resolve) => setTimeout(resolve, 600))
      ]);
      setMatches(result.matches);
      setQueryFeatures(result.featureBreakdown);
      setInferenceMs(result.inferenceMs);

      // Add to history if there is a top match
      if (result.matches.length > 0) {
        const top = result.matches[0];
        const newHistoryItem: UploadHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          imagePreview: imgSrc,
          topMatchName: top.recipe.name,
          confidence: top.confidence,
          inferenceMs: result.inferenceMs,
          recipeId: top.recipe.id
        };
        setHistoryItems((prev) => [newHistoryItem, ...prev.slice(0, 49)]);

        // Sync scan to cloud if user is authenticated
        if (user?.uid) {
          saveScanToCloud(user.uid, newHistoryItem).catch((e) => console.warn('Scan cloud sync notice:', e));
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to analyze the selected image. Please try another photo.';
      console.warn('Image recognition notice:', message);
      setScanError('Unable to analyze image format. Please select another food photo or try one of the preset dishes below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = (imgSrc: string) => {
    setSelectedImage(imgSrc);
    setActiveTab('results');
    runImageRecognition(imgSrc);
  };

  const toggleFavorite = (recipeId: string) => {
    setFavoriteIds((prev) => {
      const willBeFav = !prev.includes(recipeId);
      const next = willBeFav ? [...prev, recipeId] : prev.filter((id) => id !== recipeId);
      if (user?.uid) {
        syncFavoriteToCloud(user.uid, recipeId, willBeFav).catch((e) => console.warn('Fav cloud sync notice:', e));
      }
      return next;
    });
  };

  const isFavorite = (recipeId: string) => favoriteIds.includes(recipeId);

  const handleOpenRestaurantsForDish = (dishName: string) => {
    setRestaurantInitialFood(dishName);
    setActiveTab('restaurants');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favoriteIds.length}
        historyCount={historyItems.length}
        recipesCount={recipeCatalogCount}
        hasResults={matches.length > 0}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenDjango={() => setIsDjangoModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {scanError && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{scanError}</span>
            </div>
            <button
              onClick={() => setScanError(null)}
              className="p-1 rounded hover:bg-amber-900/50 text-amber-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Homepage: Scanner & Image Upload only - No datasets on homepage */}
        {activeTab === 'scanner' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <ImageUploader
              onImageSelected={handleImageSelected}
              isLoading={isLoading}
              selectedImage={selectedImage}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenGlobalSearch={() => setActiveTab('global')}
              onOpenDatasets={() => setActiveTab('datasets')}
              onOpenPipeline={() => setActiveTab('loading')}
            />
          </div>
        )}

        {/* Dedicated Results Page */}
        {activeTab === 'results' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-400 text-xs font-semibold border border-stone-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Scan Another Dish</span>
                </button>
                <span className="text-xs text-stone-400 hidden md:inline">
                  {isLoading ? 'Processing visual features & deep matching...' : `Analysis complete (${matches.length} candidates)`}
                </span>
              </div>

              {selectedImage && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-stone-400">Uploaded Image:</span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-500/40 bg-stone-800 flex-shrink-0 shadow-inner">
                    <img src={selectedImage} alt="Analyzed food" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <LoadingPage
                imageSrc={selectedImage}
                onComplete={() => setIsLoading(false)}
              />
            ) : matches.length > 0 ? (
              <MatchResults
                matches={matches}
                inferenceMs={inferenceMs}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                onInspectFeatures={() => setActiveTab('visualizer')}
                onOpenGlobalSearch={(dishName) => {
                  setGlobalSearchInitialQuery(dishName);
                  setActiveTab('global');
                }}
                onOpenNearbyRestaurants={handleOpenRestaurantsForDish}
                onSelectRecipe={(recipe: Recipe) => {
                  setSelectedImage(recipe.referenceImages[0]);
                  runImageRecognition(recipe.referenceImages[0]);
                }}
              />
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 mx-auto flex items-center justify-center text-amber-400">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Food Photo Analyzed Yet</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Upload a dish photograph or capture an image using your camera to view instant recognition results and authentic recipes.
                </p>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Go to Dish Recognition Scanner</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="animate-in fade-in duration-300">
            <DatasetExplorer
              onSelectSampleForScan={(sampleImg) => {
                handleImageSelected(sampleImg);
              }}
              onSelectDishRecipe={(dishName) => {
                setGlobalSearchInitialQuery(dishName);
                setActiveTab('global');
              }}
            />
          </div>
        )}

        {activeTab === 'loading' && (
          <div className="animate-in fade-in duration-300">
            <LoadingPage
              imageSrc={selectedImage}
              isStandalone={true}
              onComplete={() => setActiveTab('scanner')}
            />
          </div>
        )}

        {activeTab === 'global' && (
          <div className="animate-in fade-in duration-300">
            <GlobalRecipeSearcher
              initialQuery={globalSearchInitialQuery}
              onSelectRecipeForScan={(recipe: Recipe) => {
                if (recipe.referenceImages && recipe.referenceImages[0]) {
                  setSelectedImage(recipe.referenceImages[0]);
                  runImageRecognition(recipe.referenceImages[0]);
                  setActiveTab('scanner');
                }
              }}
              onOpenNearbyRestaurants={handleOpenRestaurantsForDish}
              onRecipeAddedToCatalog={() => {
                setRecipeCatalogCount(getAllRecipes().length);
              }}
            />
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="animate-in fade-in duration-300">
            <NearbyRestaurantFinder
              initialFoodQuery={restaurantInitialFood}
              onSelectRecipeToCook={(dishName: string) => {
                setGlobalSearchInitialQuery(dishName);
                setActiveTab('global');
              }}
            />
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="animate-in fade-in duration-300">
            <RecipeExplorer
              onSelectRecipe={(recipe: Recipe) => {
                setSelectedImage(recipe.referenceImages[0]);
                runImageRecognition(recipe.referenceImages[0]);
                setActiveTab('scanner');
              }}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="animate-in fade-in duration-300">
            <FeatureVisualizer
              queryFeatures={queryFeatures}
              matchedSampleName={matches[0]?.sourceSample}
              onSelectImage={handleImageSelected}
              onSelectRecipe={(recipe: Recipe) => {
                setSelectedImage(recipe.referenceImages[0]);
                runImageRecognition(recipe.referenceImages[0]);
                setActiveTab('scanner');
              }}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="animate-in fade-in duration-300">
            <FavoritesList
              favoriteIds={favoriteIds}
              historyItems={historyItems}
              onToggleFavorite={toggleFavorite}
              onClearHistory={() => setHistoryItems([])}
              onSelectRecipe={(recipe: Recipe) => {
                setSelectedImage(recipe.referenceImages[0]);
                runImageRecognition(recipe.referenceImages[0]);
                setActiveTab('scanner');
              }}
              onSelectImage={handleImageSelected}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="animate-in fade-in duration-300">
            <DashboardStats 
              historyItems={historyItems} 
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectRecipe={(recipe: Recipe) => {
                setSelectedImage(recipe.referenceImages[0]);
                runImageRecognition(recipe.referenceImages[0]);
                setActiveTab('scanner');
              }}
              onSelectImage={handleImageSelected}
            />
          </div>
        )}
      </main>

      {/* Interactive Onboarding / User Guide Modal */}
      <OnboardingGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigate={(tab: ActiveTab) => {
          setActiveTab(tab);
          setIsGuideOpen(false);
        }}
        onSelectSample={(sampleUrl: string) => {
          handleImageSelected(sampleUrl);
          setIsGuideOpen(false);
        }}
      />

      {/* Authentication Modal (Sign In / Register / Demo) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        favoritesCount={favoriteIds.length}
        scansCount={historyItems.length}
        onViewFavorites={() => setActiveTab('saved')}
        onViewScans={() => setActiveTab('stats')}
      />

      {/* Django REST Framework Backend Integration Modal */}
      <DjangoBackendModal
        isOpen={isDjangoModalOpen}
        onClose={() => setIsDjangoModalOpen(false)}
      />

      <footer className="border-t border-stone-800 bg-stone-900 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-300 font-serif text-sm">FoodSnap</span>
            <span>—</span>
            <span>Intelligent Food Image Recognition &amp; Recipe System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Cosine Distance Matching</span>
            <span>•</span>
            <span>80-Dimensional Spatial HSV Vector Extractor</span>
            <span>•</span>
            <span>Worldwide Restaurant Locator</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
