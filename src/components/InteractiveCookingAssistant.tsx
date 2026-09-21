import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Flame, 
  Lightbulb, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Utensils 
} from 'lucide-react';
import { Recipe, CookingStep } from '../types';
import { playChimeSound, scaleIngredientsText } from '../utils/mlEngine';

interface InteractiveCookingAssistantProps {
  recipe: Recipe;
  servingsMultiplier?: number;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'prep' | 'cook' | 'timer' | string;
}

export const InteractiveCookingAssistant: React.FC<InteractiveCookingAssistantProps> = ({
  recipe,
  servingsMultiplier = 1,
  isOpen,
  onClose,
  initialMode = 'prep'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mode, setMode] = useState<string>(initialMode);

  // Derive steps from recipe.steps or parse from recipe.directions
  const steps: CookingStep[] = React.useMemo(() => {
    if (recipe.steps && recipe.steps.length > 0) {
      return recipe.steps;
    }

    // Split directions into sequential steps
    const rawLines = recipe.directions
      ? recipe.directions.split(/(?:\r?\n)+|\.\s+(?=[A-Z0-9])/).map(s => s.trim()).filter(Boolean)
      : ['Prepare ingredients.', 'Cook dish according to recipe.', 'Garnish and serve.'];

    return rawLines.map((line, idx) => {
      // Estimate duration from text or default to 5 mins
      const minMatch = line.match(/(\d+)\s*(?:minutes|mins|min)/i);
      const minutes = minMatch ? parseInt(minMatch[1], 10) : 5;
      const durationSeconds = minutes * 60;

      let action: CookingStep['actionType'] = 'prep';
      if (/boil|simmer|steam/i.test(line)) action = 'boil';
      else if (/fry|sear|sauté/i.test(line)) action = 'fry';
      else if (/bake|roast/i.test(line)) action = 'bake';
      else if (/grill/i.test(line)) action = 'grill';
      else if (/blend|puree/i.test(line)) action = 'blend';

      return {
        stepNumber: idx + 1,
        title: `Step ${idx + 1}`,
        instruction: line.replace(/^\d+[\.\)]\s*/, ''),
        durationSeconds,
        formattedDuration: `${minutes} min${minutes > 1 ? 's' : ''}`,
        actionType: action,
        flameLevel: action === 'fry' ? 'Medium-High' : action === 'boil' ? 'Medium Heat' : 'Off / Prep',
        tip: idx === 0 ? 'Ensure all ingredients are at room temperature and cleanly chopped.' : undefined
      };
    });
  }, [recipe]);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Set timer when step changes
  useEffect(() => {
    if (currentStep) {
      setTimerSeconds(currentStep.durationSeconds || 300);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, currentStep]);

  // Countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (isAudioEnabled) {
              playChimeSound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, isAudioEnabled]);

  if (!isOpen) return null;

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const formatTimerDisplay = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-6 text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                Interactive Guided Cooking
              </span>
              <span className="text-xs text-stone-400">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white mt-1">
              {recipe.name}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Serving scale: {servingsMultiplier}x ({recipe.servings || '4 servings'})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              title={isAudioEnabled ? 'Mute chimes' : 'Enable chimes'}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-stone-400">
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete</span>
            <span>{steps.length - (currentStepIndex + 1)} steps remaining</span>
          </div>
        </div>

        {/* Main Step Body */}
        <div className="bg-stone-950/60 rounded-xl p-5 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-mono">
                {currentStepIndex + 1}
              </span>
              {currentStep.title}
            </h3>

            {currentStep.flameLevel && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 text-xs font-medium border border-red-500/20">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                {currentStep.flameLevel}
              </span>
            )}
          </div>

          <p className="text-base text-stone-200 leading-relaxed font-normal">
            {currentStep.instruction}
          </p>

          {currentStep.tip && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span><strong>Chef Tip:</strong> {currentStep.tip}</span>
            </div>
          )}

          {/* Integrated Step Timer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-stone-800/80">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-mono text-2xl font-bold text-white tracking-wider">
                  {formatTimerDisplay(timerSeconds)}
                </div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                  {currentStep.formattedDuration || 'Step Timer'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                  isTimerRunning 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'Pause Timer' : 'Start Timer'}</span>
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(currentStep.durationSeconds || 300);
                }}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scaled Ingredients Accordion */}
        <div className="bg-stone-950/40 rounded-xl p-4 border border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              Ingredients Needed ({servingsMultiplier}x scaled)
            </h4>
          </div>
          <div className="text-xs text-stone-400 leading-relaxed max-h-36 overflow-y-auto pr-2 space-y-1">
            {recipe.ingredients
              ? scaleIngredientsText(recipe.ingredients, servingsMultiplier)
                  .filter(Boolean)
                  .map((ing: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 mt-1.5 flex-shrink-0" />
                      <span>{ing.replace(/^[-•*]\s*/, '')}</span>
                    </div>
                  ))
              : <div>See recipe details for full ingredients.</div>
            }
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800">
          <button
            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          <button
            onClick={() => toggleStepCompleted(currentStepIndex)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              completedSteps.includes(currentStepIndex)
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedSteps.includes(currentStepIndex) ? 'Completed' : 'Mark Step Done'}</span>
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={() => {
                if (!completedSteps.includes(currentStepIndex)) {
                  toggleStepCompleted(currentStepIndex);
                }
                setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1));
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
            >
              Dish Complete!
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
