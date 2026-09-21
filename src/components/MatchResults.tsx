import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  ChefHat, 
  Globe, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Share2, 
  Layers, 
  ArrowRight,
  Gauge,
  Check,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Download,
  Copy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  UtensilsCrossed,
  Bell,
  X,
  MapPin
} from 'lucide-react';
import { MatchResult, Recipe, GlobalRecipe } from '../types';
import { playChimeSound, scaleIngredientsText } from '../utils/mlEngine';
import { researchDishGlobally } from '../services/globalRecipeService';
import { ImageWithFallback } from './ImageWithFallback';
import { InteractiveCookingAssistant } from './InteractiveCookingAssistant';

interface MatchResultsProps {
  matches: MatchResult[];
  inferenceMs: number;
  onToggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  onInspectFeatures: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenGlobalSearch?: (query: string) => void;
  onOpenNearbyRestaurants?: (dishName: string) => void;
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  matches,
  inferenceMs,
  onToggleFavorite,
  isFavorite,
  onInspectFeatures,
  onSelectRecipe,
  onOpenGlobalSearch,
  onOpenNearbyRestaurants
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [quickPreviewRecipe, setQuickPreviewRecipe] = useState<Recipe | null>(null);
  const [quickServingMultiplier, setQuickServingMultiplier] = useState(1);

  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [groceryCopied, setGroceryCopied] = useState(false);

  // Interactive Cooking Mode & Stepper
  const [cookingRecipeModal, setCookingRecipeModal] = useState<Recipe | null>(null);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Servings Scaler (Default 1x, allows 0.5x, 1x, 1.5x, 2x, 3x, etc.)
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  // Global Recipe Research Modal State
  const [globalResearchModal, setGlobalResearchModal] = useState<GlobalRecipe | null>(null);
  const [isLoadingGlobalResearch, setIsLoadingGlobalResearch] = useState(false);

  // Interactive Kitchen Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  // Reset selected candidate view when the primary match changes
  useEffect(() => {
    setSelectedRecipeId(null);
    setActiveStepIndex(0);
  }, [matches[0]?.recipe.id]);

  if (!matches || matches.length === 0) return null;

  const topMatch = matches[0];
  const activeMatch = (selectedRecipeId ? matches.find((m) => m.recipe.id === selectedRecipeId) : null) || topMatch;
  const currentRecipe = activeMatch.recipe;
  const isViewingCandidate = activeMatch.recipe.id !== topMatch.recipe.id;
  const candidateRank = matches.findIndex((m) => m.recipe.id === activeMatch.recipe.id) + 1;
  const similarMatches = matches.slice(1, 5);

  // Break directions into distinct structured steps
  const stepsList = currentRecipe.directions
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  // Scale ingredients based on multiplier
  const scaledIngredients = scaleIngredientsText(currentRecipe.ingredients, servingsMultiplier);

  // Kitchen Timer Interval Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimerFinished(true);
            playChimeSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const setTimerPreset = (minutes: number) => {
    const secs = minutes * 60;
    setInitialTimerSeconds(secs);
    setTimerSeconds(secs);
    setIsTimerRunning(true);
    setTimerFinished(false);
  };

  const toggleTimer = () => {
    if (timerSeconds === 0 && initialTimerSeconds > 0) {
      setTimerSeconds(initialTimerSeconds);
    }
    setIsTimerRunning(!isTimerRunning);
    setTimerFinished(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(initialTimerSeconds);
    setTimerFinished(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [`${currentRecipe.id}-${idx}`]: !prev[`${currentRecipe.id}-${idx}`]
    }));
  };

  const handleSpeakCurrentStep = (stepText: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(stepText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSpeakAllDirections = () => {
    const fullText = `${currentRecipe.name}. Cooking time: ${currentRecipe.cooking_time}. Ingredients needed: ${scaledIngredients.join(', ')}. Directions: ${currentRecipe.directions}`;
    handleSpeakCurrentStep(fullText);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `FoodSnap Recognition: I matched ${currentRecipe.name} (${activeMatch.confidence}% confidence) with FoodSnap AI!`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyGroceryList = () => {
    const listText = `🛒 Grocery List for ${currentRecipe.name} (${servingsMultiplier}x Servings):\n` +
      scaledIngredients.map((item, i) => `[ ${checkedIngredients[`${currentRecipe.id}-${i}`] ? 'X' : ' '} ] ${item}`).join('\n');
    navigator.clipboard?.writeText(listText);
    setGroceryCopied(true);
    setTimeout(() => setGroceryCopied(false), 2500);
  };

  const handleDownloadGroceryList = () => {
    const listText = `FOODSNAP GROCERY CHECKLIST\nRecipe: ${currentRecipe.name}\nServings: ${servingsMultiplier}x (${currentRecipe.servings})\nCooking Time: ${currentRecipe.cooking_time}\nCalories: ${currentRecipe.calories}\n\nINGREDIENTS:\n` +
      scaledIngredients.map((item, i) => `[ ${checkedIngredients[`${currentRecipe.id}-${i}`] ? 'X' : ' '} ] ${item}`).join('\n') +
      `\n\nDIRECTIONS:\n${currentRecipe.directions}\n\n-- Generated by FoodSnap Visual Recognition`;
    
    const blob = new Blob([listText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentRecipe.name.toLowerCase().replace(/\s+/g, '_')}_grocery_list.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const timerProgress = initialTimerSeconds > 0 ? (timerSeconds / initialTimerSeconds) * 100 : 0;

  return (
    <div className="w-full space-y-6" id="match-results-section">
      {/* Top match header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Check className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Top Recipe Classification
            </h2>
            <p className="text-xs text-stone-400">
              Inference latency: <span className="font-mono text-amber-400 font-semibold">{inferenceMs} ms</span> (Cosine Distance)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCookingMode(!isCookingMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isCookingMode
                ? 'bg-amber-500 text-stone-950 shadow-amber-500/20'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{isCookingMode ? 'Exit Cooking Mode' : 'Start Cooking Mode'}</span>
          </button>

          <button
            onClick={onInspectFeatures}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Inspect 80-D Vector</span>
          </button>
        </div>
      </div>

      {/* Candidate Selection Indicator Banner */}
      {isViewingCandidate && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 font-bold text-[11px] uppercase tracking-wider">
              Candidate #{candidateRank}
            </span>
            <div>
              <div className="text-xs font-bold text-white">
                Viewing Candidate Recipe: <span className="text-amber-400 font-extrabold">{currentRecipe.name}</span>
              </div>
              <div className="text-[11px] text-stone-400">
                Cosine Similarity: <span className="font-mono text-amber-300 font-semibold">{activeMatch.confidence}%</span> • Ranked #{candidateRank} in classification
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setSelectedRecipeId(null)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
            >
              ← Back to Top Match ({topMatch.recipe.name})
            </button>
            <button
              onClick={() => onSelectRecipe(currentRecipe)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm"
            >
              Scan This Dish
            </button>
          </div>
        </div>
      )}

      {/* Main Top Match Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-md">
        {/* Header bar with confidence & actions */}
        <div className="p-5 sm:p-6 bg-stone-900 border-b border-stone-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            {/* Dish Photo + Title */}
            <div className="flex items-start sm:items-center gap-4">
              {currentRecipe.referenceImages?.[0] && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-800 border border-stone-700 flex-shrink-0 shadow-lg relative">
                  <ImageWithFallback
                    src={currentRecipe.referenceImages[0]}
                    alt={currentRecipe.name}
                    foodName={currentRecipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {currentRecipe.category}
                  </span>
                  <span className="text-stone-600">•</span>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-stone-500" />
                    {currentRecipe.origin}
                  </span>
                  {currentRecipe.isCustom && (
                    <>
                      <span className="text-stone-600">•</span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                        Custom Dish
                      </span>
                    </>
                  )}
                  {isViewingCandidate && (
                    <>
                      <span className="text-stone-600">•</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                        Rank #{candidateRank} Candidate
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif mt-1">
                  {currentRecipe.name}
                </h1>
                
                {/* Direct CTA to launch cooking mode & global research */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <button
                    onClick={() => setCookingRecipeModal(currentRecipe)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-stone-950" />
                    <span>Start Cooking</span>
                  </button>
                  {onOpenNearbyRestaurants && (
                    <button
                      onClick={() => onOpenNearbyRestaurants(currentRecipe.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors shadow-sm"
                      title="Find restaurants nearby serving this food"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nearby Restaurants</span>
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      setIsLoadingGlobalResearch(true);
                      try {
                        const res = await researchDishGlobally(currentRecipe.name);
                        setGlobalResearchModal(res);
                      } catch (e) {
                        console.error('Failed to research dish:', e);
                      } finally {
                        setIsLoadingGlobalResearch(false);
                      }
                    }}
                    disabled={isLoadingGlobalResearch}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors shadow-sm"
                    title="Research authentic ingredients, measurements, and global variations"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isLoadingGlobalResearch ? 'Researching...' : 'Global Dish Research'}</span>
                  </button>
                  <button
                    onClick={() => setIsCookingMode(!isCookingMode)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isCookingMode ? 'Hide Inline Steps' : 'Quick Steps'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Confidence Score Pill */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <div className="text-right">
                <div className="text-xs text-stone-400 font-medium">Confidence</div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {activeMatch.confidence}%
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-800">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-950/60 border border-stone-800">
              <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Calories</div>
                <div className="text-xs font-bold text-stone-200">{currentRecipe.calories}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-950/60 border border-stone-800">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Cook Time</div>
                <div className="text-xs font-bold text-stone-200">{currentRecipe.cooking_time}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-950/60 border border-stone-800">
              <ChefHat className="w-4 h-4 text-stone-300 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Servings</div>
                <div className="text-xs font-bold text-stone-200">{currentRecipe.servings}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-950/60 border border-stone-800">
              <Gauge className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Difficulty</div>
                <div className="text-xs font-bold text-stone-200">{currentRecipe.difficulty}</div>
              </div>
            </div>
          </div>

          {/* AI Vision Insights (if verified by multimodal model) */}
          {(activeMatch.detectedVisualCues || activeMatch.culinaryNotes || activeMatch.isAiVerified) && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-stone-900 to-amber-500/5 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Gemini Multimodal AI Vision Analysis
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  {activeMatch.confidence}% AI Confidence
                </span>
              </div>

              {activeMatch.culinaryNotes && (
                <p className="text-xs text-stone-300 leading-relaxed italic">
                  "{activeMatch.culinaryNotes}"
                </p>
              )}

              {activeMatch.detectedVisualCues && activeMatch.detectedVisualCues.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-400">Detected Visual Cues:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatch.detectedVisualCues.map((cue, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700/80 text-[11px] text-amber-200/90 font-medium"
                      >
                        ✓ {cue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeMatch.visibleIngredients && activeMatch.visibleIngredients.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-400">Identified Ingredients:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatch.visibleIngredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[11px] text-stone-300"
                      >
                        • {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Step-by-Step Cooking Mode Banner if active */}
        {isCookingMode && (
          <div className="p-5 sm:p-6 bg-stone-950 border-b border-stone-800 space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {activeStepIndex + 1}/{stepsList.length}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interactive Cooking Mode: Step {activeStepIndex + 1}
                  </h3>
                  <p className="text-xs text-stone-400">Follow the directions step-by-step with voice and timers</p>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 disabled:pointer-events-none text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  disabled={activeStepIndex === stepsList.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(stepsList.length - 1, prev + 1))}
                  className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold disabled:pointer-events-none text-xs flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Step Big Card */}
            <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 relative">
              <div className="text-xs font-mono text-amber-400 mb-2 font-bold uppercase">
                Step {activeStepIndex + 1} of {stepsList.length}
              </div>
              <p className="text-base sm:text-lg font-medium text-stone-100 leading-relaxed">
                {stepsList[activeStepIndex] || currentRecipe.directions}
              </p>

              <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => handleSpeakCurrentStep(stepsList[activeStepIndex] || currentRecipe.directions)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Read This Step'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {stepsList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === activeStepIndex
                          ? 'bg-amber-400 w-6'
                          : idx < activeStepIndex
                          ? 'bg-emerald-500'
                          : 'bg-stone-700'
                      }`}
                      title={`Jump to step ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Kitchen Timer Bar */}
        <div className="px-5 py-4 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              timerFinished 
                ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse'
                : isTimerRunning 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-stone-800 text-stone-400'
            }`}>
              <Bell className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">Kitchen Timer</span>
                {timerFinished && (
                  <span className="px-2 py-0.2 rounded bg-red-500 text-white font-bold text-[10px] animate-bounce">
                    Time is up!
                  </span>
                )}
              </div>
              <div className="font-mono text-xl font-extrabold text-amber-400 mt-0.5">
                {formatTimer(timerSeconds)}
              </div>
            </div>
          </div>

          {/* Preset buttons & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-500 hidden sm:inline">Presets:</span>
            {[1, 5, 10, 15, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setTimerPreset(mins)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-mono font-medium border border-stone-700/80 transition-colors"
              >
                {mins}m
              </button>
            ))}

            <div className="h-4 w-px bg-stone-800 mx-1"></div>

            {timerSeconds > 0 && (
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-amber-500 text-stone-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
              </button>
            )}

            {(timerSeconds > 0 || initialTimerSeconds > 0) && (
              <button
                onClick={resetTimer}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Recipe Content Section */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ingredients column with Servings Scaler & Grocery Export */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2">
                <span>Ingredients</span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-normal">
                  {scaledIngredients.length} items
                </span>
              </h3>

              {/* Servings Scaler (- / +) */}
              <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase font-semibold mr-1">Scale:</span>
                <button
                  onClick={() => setServingsMultiplier((prev) => Math.max(0.5, prev - 0.5))}
                  className="p-0.5 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                  title="Decrease servings"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono text-xs font-bold text-amber-400 px-1">
                  {servingsMultiplier}x
                </span>
                <button
                  onClick={() => setServingsMultiplier((prev) => Math.min(5, prev + 0.5))}
                  className="p-0.5 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
                  title="Increase servings"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Grocery Checklist Actions */}
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span>Click items to check off</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGroceryList}
                  className="flex items-center gap-1 text-[11px] hover:text-amber-400 transition-colors"
                  title="Copy grocery list"
                >
                  <Copy className="w-3 h-3" />
                  <span>{groceryCopied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadGroceryList}
                  className="flex items-center gap-1 text-[11px] hover:text-amber-400 transition-colors"
                  title="Download .txt checklist"
                >
                  <Download className="w-3 h-3" />
                  <span>Save .txt</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 bg-stone-950/50 p-3 rounded-lg border border-stone-800 max-h-[340px] overflow-y-auto">
              {scaledIngredients.map((ingredient, idx) => {
                const isChecked = !!checkedIngredients[`${currentRecipe.id}-${idx}`];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-start gap-2.5 p-2 rounded text-xs cursor-pointer select-none transition-colors ${
                      isChecked
                        ? 'bg-stone-900/40 text-stone-500 line-through'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-200 font-medium'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-amber-600 text-white font-bold'
                          : 'border border-stone-600 bg-stone-800'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span>{ingredient}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Directions column */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">Preparation & Directions</h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeakAllDirections}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    isSpeaking
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(currentRecipe.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isFavorite(currentRecipe.id)
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-stone-800 text-stone-400 hover:text-white border-stone-700'
                  }`}
                  title="Bookmark Recipe"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white border border-stone-700 transition-colors"
                  title="Copy details"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {copied && (
              <div className="p-2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs text-center font-medium">
                Summary copied to clipboard!
              </div>
            )}

            <div className="bg-stone-950/70 p-4 rounded-lg border border-stone-800 text-xs sm:text-sm leading-relaxed text-stone-300 space-y-3">
              <p>{currentRecipe.directions}</p>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {currentRecipe.tags.map((tag, tIdx) => (
                <span
                  key={`${tag}-${tIdx}`}
                  className="text-[10px] px-2.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative candidates / Similar dishes */}
      {similarMatches.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Candidate Matches (Top 2-5)</h3>
              <p className="text-xs text-stone-400">Click any candidate to inspect its recipe details and metrics above</p>
            </div>
            {selectedRecipeId && (
              <button
                onClick={() => setSelectedRecipeId(null)}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Reset to AI Top Pick ({topMatch.recipe.name})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {similarMatches.map((item, idx) => {
              const isCardActive = activeMatch.recipe.id === item.recipe.id;
              return (
                <div
                  key={`${item.recipe.id}-${idx}`}
                  onClick={() => setSelectedRecipeId(item.recipe.id)}
                  className={`group p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isCardActive
                      ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-stone-950/70 hover:bg-stone-800/80 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    {item.recipe.referenceImages?.[0] && (
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-stone-800 mb-2.5 relative border border-stone-800">
                        <ImageWithFallback
                          src={item.recipe.referenceImages[0]}
                          alt={item.recipe.name}
                          foodName={item.recipe.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-stone-950/85 backdrop-blur-sm border border-stone-700 text-[10px] font-mono font-bold text-amber-400">
                          {item.confidence}%
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-stone-400">#{idx + 2} Candidate</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {item.confidence}%
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                      {item.recipe.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                      <span>{item.recipe.calories}</span>
                      <span>•</span>
                      <span>{item.recipe.cooking_time}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-800/80 space-y-2">
                    <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecipeId(item.recipe.id);
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <span>{isCardActive ? 'Viewing Above' : 'View Recipe'}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickPreviewRecipe(item.recipe);
                          setQuickServingMultiplier(1);
                        }}
                        className="text-[10px] text-stone-400 hover:text-stone-200 px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 border border-stone-700/60"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Automated Cooking Assistant Modal */}
      <InteractiveCookingAssistant
        recipe={currentRecipe}
        servingsMultiplier={servingsMultiplier}
        isOpen={isCookingMode}
        onClose={() => setIsCookingMode(false)}
      />

      {/* Quick Preview Modal for Candidate Dishes */}
      {quickPreviewRecipe && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setQuickPreviewRecipe(null)}
        >
          <div 
            className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-5 animate-in zoom-in-95 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-stone-800">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {quickPreviewRecipe.category} • {quickPreviewRecipe.origin}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-serif mt-0.5">
                  {quickPreviewRecipe.name}
                </h3>
              </div>
              <button
                onClick={() => setQuickPreviewRecipe(null)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <div className="text-stone-400 text-[10px]">Calories</div>
                <div className="font-bold text-stone-200 mt-0.5">{quickPreviewRecipe.calories}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <div className="text-stone-400 text-[10px]">Cook Time</div>
                <div className="font-bold text-stone-200 mt-0.5">{quickPreviewRecipe.cooking_time}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <div className="text-stone-400 text-[10px]">Servings</div>
                <div className="font-bold text-stone-200 mt-0.5">{quickPreviewRecipe.servings}</div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-200 uppercase">
                <span>Ingredients</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={quickServingMultiplier <= 0.5}
                    onClick={() => setQuickServingMultiplier((p) => Math.max(0.5, p - 0.5))}
                    className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="font-mono text-amber-400">{quickServingMultiplier}x</span>
                  <button
                    onClick={() => setQuickServingMultiplier((p) => Math.min(5, p + 0.5))}
                    className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1 max-h-40 overflow-y-auto">
                {scaleIngredientsText(quickPreviewRecipe.ingredients, quickServingMultiplier).map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Directions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-200 uppercase">Directions</div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs sm:text-sm text-stone-300 leading-relaxed">
                {quickPreviewRecipe.directions}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800 flex-wrap">
              <button
                onClick={() => {
                  const r = quickPreviewRecipe;
                  setQuickPreviewRecipe(null);
                  setCookingRecipeModal(r);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Cook Step-by-Step</span>
              </button>
              <button
                onClick={() => {
                  setSelectedRecipeId(quickPreviewRecipe.id);
                  setQuickPreviewRecipe(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all"
              >
                Set as Active Top Recipe
              </button>
              <button
                onClick={() => {
                  onSelectRecipe(quickPreviewRecipe);
                  setQuickPreviewRecipe(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all"
              >
                Scan Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Automated Cooking Assistant Suite */}
      {cookingRecipeModal && (
        <InteractiveCookingAssistant
          recipe={cookingRecipeModal}
          servingsMultiplier={servingsMultiplier}
          isOpen={!!cookingRecipeModal}
          onClose={() => setCookingRecipeModal(null)}
          initialMode="prep"
        />
      )}

      {/* Deep Global Recipe Research Dossier Modal */}
      {globalResearchModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setGlobalResearchModal(null)}
        >
          <div
            className="bg-stone-900 border border-stone-700/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-5 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {globalResearchModal.cuisine}
                    </span>
                    <span className="text-xs text-stone-400">{globalResearchModal.origin}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif mt-0.5">
                    {globalResearchModal.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setGlobalResearchModal(null)}
                className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description & Flavor profile */}
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {globalResearchModal.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {globalResearchModal.flavorProfile.map((flavor, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-stone-950 text-stone-300 border border-stone-800 text-[11px]"
                >
                  ✦ {flavor}
                </span>
              ))}
              {globalResearchModal.dietaryTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Full Ingredients Breakdown */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                <span>Exact Ingredients & Measurements ({globalResearchModal.ingredientsList.length})</span>
                <button
                  onClick={() => {
                    const text = globalResearchModal.ingredientsList
                      .map((i) => `• ${i.amount ? `${i.amount} ` : ''}${i.item}${i.notes ? ` (${i.notes})` : ''}`)
                      .join('\n');
                    navigator.clipboard.writeText(`🛒 ${globalResearchModal.name} Ingredients:\n\n${text}`);
                    setGroceryCopied(true);
                    setTimeout(() => setGroceryCopied(false), 2000);
                  }}
                  className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{groceryCopied ? 'Copied' : 'Copy List'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {globalResearchModal.ingredientsList.map((ing, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-stone-900 border border-stone-800/80 text-xs">
                    <span className="font-semibold text-amber-400 font-mono mr-1.5">{ing.amount}</span>
                    <span className="text-stone-200">{ing.item}</span>
                    {ing.notes && <div className="text-[10px] text-stone-500">{ing.notes}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Chef Tips */}
            {globalResearchModal.chefTips && globalResearchModal.chefTips.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs text-amber-200">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Chef Culinary Secrets</span>
                </div>
                <p>{globalResearchModal.chefTips[0]}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {onOpenGlobalSearch && (
                  <button
                    onClick={() => {
                      const name = globalResearchModal.name;
                      setGlobalResearchModal(null);
                      onOpenGlobalSearch(name);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Explore in Global Database</span>
                  </button>
                )}

                {onOpenNearbyRestaurants && (
                  <button
                    onClick={() => {
                      const name = globalResearchModal.name;
                      setGlobalResearchModal(null);
                      onOpenNearbyRestaurants(name);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Find Nearby Restaurants</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setGlobalResearchModal(null);
                  setCookingRecipeModal(currentRecipe);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 ml-auto"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Start Step-by-Step Cooking</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
