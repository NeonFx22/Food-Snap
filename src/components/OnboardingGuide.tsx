import React, { useState } from 'react';
import { ActiveTab } from './Navbar';
import { 
  X, 
  Camera, 
  Cpu, 
  Clock, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { getVerifiedFoodImage } from '../utils/foodImageHelper';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (sampleUrl: string) => void;
}

const SAMPLE_QUICK_DISHES = [
  { name: 'Jollof Rice', url: getVerifiedFoodImage('jollof rice'), tag: 'Signature Rice' },
  { name: 'Egusi Soup', url: getVerifiedFoodImage('egusi soup'), tag: 'Authentic Soup' },
  { name: 'Beef Suya', url: getVerifiedFoodImage('beef suya'), tag: 'Street Grill' },
  { name: 'Amala & Ewedu', url: getVerifiedFoodImage('amala and ewedu'), tag: 'Swallow Classic' }
];

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectSample
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: <Camera className="w-8 h-8 text-amber-400" />,
      tag: 'Step 1 • Image Recognition',
      title: 'Instant Visual Dish Identification',
      description: 'Upload food photography from your gallery or snap a photo directly using the camera. FoodSnap processes the image locally in your browser with zero latency.',
      actionLabel: 'Next: How It Works'
    },
    {
      icon: <Cpu className="w-8 h-8 text-amber-400" />,
      tag: 'Step 2 • Computer Vision Engine',
      title: '80-Dimensional Spatial HSV Vectors',
      description: 'The image is segmented into a 4×4 spatial color zone grid and an illumination-invariant HSV histogram. Cosine distance matches your photo against authentic culinary encodings in milliseconds.',
      actionLabel: 'Next: Interactive Cooking'
    },
    {
      icon: <Clock className="w-8 h-8 text-amber-400" />,
      tag: 'Step 3 • Culinary Assistant',
      title: 'Step-by-Step Cooking with Live Timers',
      description: 'Access authentic ingredient quantities scaled dynamically to your desired servings, interactive countdown timers, and culinary science cues for each step.',
      actionLabel: 'Next: Restaurant Radar'
    },
    {
      icon: <MapPin className="w-8 h-8 text-amber-400" />,
      tag: 'Step 4 • Local Gastronomy',
      title: 'Find Dishes at Real Nearby Restaurants',
      description: 'Craving the dish immediately? Use the Worldwide Restaurant Radar to locate authentic food spots and restaurants in your city or anywhere globally.',
      actionLabel: 'Start Exploring'
    }
  ];

  const activeSlide = slides[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              FoodSnap Quick Start Guide
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Presentation */}
        <div className="space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            {activeSlide.icon}
          </div>

          <div>
            <span className="text-xs font-mono text-stone-400 uppercase">
              {activeSlide.tag}
            </span>
            <h3 className="text-2xl font-bold font-serif text-white mt-1">
              {activeSlide.title}
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed mt-2">
              {activeSlide.description}
            </p>
          </div>
        </div>

        {/* Sample Dishes Quick Test */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2.5">
          <div className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Try scanning a sample dish right now:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SAMPLE_QUICK_DISHES.map((dish) => (
              <button
                key={dish.name}
                onClick={() => onSelectSample(dish.url)}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 transition-all text-left group"
              >
                <div className="w-full h-16 rounded overflow-hidden mb-1.5 bg-stone-800">
                  <ImageWithFallback
                    src={dish.url}
                    alt={dish.name}
                    foodName={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-xs font-semibold text-stone-200 line-clamp-1">{dish.name}</div>
                <div className="text-[10px] text-amber-400/80 font-mono">{dish.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Dots & Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === i ? 'bg-amber-400 w-6' : 'bg-stone-700 hover:bg-stone-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                onClick={() => setCurrentSlide(prev => prev - 1)}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Back
              </button>
            )}

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>{activeSlide.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('scanner');
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>Launch Food Scanner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
