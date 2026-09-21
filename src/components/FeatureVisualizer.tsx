import React, { useState } from 'react';
import { FeatureVector, Recipe } from '../types';
import { getAllRecipes, getAllEncodings, breakdownVector } from '../utils/mlEngine';
import { Activity, Layers, Palette, Eye, Cpu, Compass, Sparkles, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface FeatureVisualizerProps {
  queryFeatures: FeatureVector | null;
  matchedSampleName?: string;
  onSelectImage: (src: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const FeatureVisualizer: React.FC<FeatureVisualizerProps> = ({
  queryFeatures,
  matchedSampleName,
  onSelectImage,
  onSelectRecipe
}) => {
  const recipes = getAllRecipes();
  const encodings = getAllEncodings();

  // If no queryFeatures provided yet, pick the first dataset encoding as reference
  const [selectedEncodingIndex, setSelectedEncodingIndex] = useState<number>(0);
  const activeFeatures: FeatureVector = queryFeatures || breakdownVector(encodings[selectedEncodingIndex]?.vector || new Array(80).fill(0.01));

  // 24 Hue bins colors for visualization
  const hueColors = Array.from({ length: 24 }).map((_, i) => {
    const deg = Math.round((i / 24) * 360);
    return `hsl(${deg}, 85%, 50%)`;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-stone-200">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            Computer Vision Architecture • 80-D Spatial HSV Vector
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
            Spatial Color &amp; Feature Vector Visualizer
          </h1>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Inspect the multi-channel feature descriptor extracted by FoodSnap’s in-browser computer vision pipeline. 
            The system partitions food imagery into a 4×4 spatial zone grid (48 spatial color channels) combined with a 32-bin HSV color histogram to achieve illumination-invariant dish classification.
          </p>
          {matchedSampleName && (
            <div className="inline-flex items-center gap-2 text-xs font-mono bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Query Matched With: <strong className="text-amber-300">{matchedSampleName}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Spatial Grid & HSV Histograms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spatial 4x4 Grid Representation */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-white text-base">4×4 Spatial Color Grid</h3>
                <p className="text-xs text-stone-400">16 discrete spatial cells (RGB coordinates)</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-300">
              48 dimensions
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 bg-stone-950 p-4 rounded-xl border border-stone-800 aspect-square max-w-sm mx-auto shadow-inner">
              {activeFeatures.spatialGrid.map((rgb, index) => {
                const r = Math.min(255, Math.max(0, Math.round(rgb[0] * 255)));
                const g = Math.min(255, Math.max(0, Math.round(rgb[1] * 255)));
                const b = Math.min(255, Math.max(0, Math.round(rgb[2] * 255)));
                const colorStr = `rgb(${r}, ${g}, ${b})`;

                return (
                  <div
                    key={index}
                    className="group relative rounded-lg border border-white/10 flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
                    style={{ backgroundColor: colorStr }}
                    title={`Cell ${index + 1}: R=${r}, G=${g}, B=${b}`}
                  >
                    <span className="text-[10px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      #{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-stone-400 text-center leading-relaxed">
              Spatial zoning captures the layout geometry of the dish (e.g. jollof rice centered base, garnish perimeter, stew pools).
            </p>
          </div>
        </div>

        {/* Right Column: HSV Histograms (Hue, Saturation, Value) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-white text-base">Color Space Histograms (HSV)</h3>
                <p className="text-xs text-stone-400">Hue (24 bins) • Saturation (4 bins) • Value (4 bins)</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-300">
              32 dimensions
            </span>
          </div>

          {/* Hue Distribution (24 bins) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Hue Channel Distribution (0° – 360°)
              </span>
              <span className="font-mono text-stone-500 text-[11px]">24 Bins</span>
            </div>
            <div className="grid grid-cols-24 gap-1 h-28 bg-stone-950 p-2.5 rounded-xl border border-stone-800 items-end">
              {activeFeatures.hsvHistogram.hue.map((val, idx) => {
                const maxVal = Math.max(...activeFeatures.hsvHistogram.hue, 0.001);
                const heightPct = Math.min(100, Math.max(8, (val / maxVal) * 100));
                return (
                  <div
                    key={idx}
                    className="rounded-t transition-all duration-300 group relative"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: hueColors[idx]
                    }}
                    title={`Hue Bin ${idx} (${Math.round((idx / 24) * 360)}°): ${(val * 100).toFixed(1)}%`}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-stone-900 text-white text-[9px] font-mono px-1 rounded shadow-lg border border-stone-700 pointer-events-none z-10 whitespace-nowrap">
                      {(val * 100).toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-stone-500 font-mono px-1">
              <span>0° (Reds)</span>
              <span>60° (Yellows)</span>
              <span>120° (Greens)</span>
              <span>240° (Blues)</span>
              <span>360°</span>
            </div>
          </div>

          {/* Saturation & Value Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Saturation */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-stone-300">
                <span>Saturation Bins (0–100%)</span>
                <span className="text-[11px] font-mono text-stone-500">4 Bins</span>
              </div>
              <div className="grid grid-cols-4 gap-2 h-16 items-end">
                {activeFeatures.hsvHistogram.saturation.map((val, idx) => {
                  const maxVal = Math.max(...activeFeatures.hsvHistogram.saturation, 0.001);
                  const heightPct = Math.min(100, Math.max(12, (val / maxVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full rounded-t bg-amber-500/80 transition-all"
                        style={{ height: `${heightPct}%` }}
                        title={`Sat Bin ${idx + 1}: ${(val * 100).toFixed(1)}%`}
                      />
                      <span className="text-[10px] font-mono text-stone-500">B{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Value (Brightness) */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-stone-300">
                <span>Value / Luminance Bins</span>
                <span className="text-[11px] font-mono text-stone-500">4 Bins</span>
              </div>
              <div className="grid grid-cols-4 gap-2 h-16 items-end">
                {activeFeatures.hsvHistogram.value.map((val, idx) => {
                  const maxVal = Math.max(...activeFeatures.hsvHistogram.value, 0.001);
                  const heightPct = Math.min(100, Math.max(12, (val / maxVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full rounded-t bg-stone-400 transition-all"
                        style={{ height: `${heightPct}%` }}
                        title={`Val Bin ${idx + 1}: ${(val * 100).toFixed(1)}%`}
                      />
                      <span className="text-[10px] font-mono text-stone-500">B{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Reference Comparison & Sample Chooser */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg">Compare with Reference Dataset Classes</h3>
            <p className="text-xs text-stone-400">Click any dish below to inspect its ground-truth feature fingerprint</p>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {recipes.length} Verified Food Classes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {recipes.slice(0, 12).map((recipe, idx) => (
            <button
              key={recipe.id}
              onClick={() => {
                setSelectedEncodingIndex(idx % encodings.length);
                if (recipe.referenceImages?.[0]) {
                  onSelectImage(recipe.referenceImages[0]);
                }
              }}
              className={`text-left p-2.5 rounded-xl border transition-all flex flex-col items-center text-center group ${
                selectedEncodingIndex === (idx % encodings.length)
                  ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-stone-950/60 hover:bg-stone-800 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-800 mb-2 relative">
                <ImageWithFallback
                  src={recipe.referenceImages?.[0]}
                  alt={recipe.name}
                  foodName={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-xs font-semibold text-stone-200 line-clamp-1">
                {recipe.name}
              </span>
              <span className="text-[10px] text-stone-500 capitalize">
                {recipe.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
