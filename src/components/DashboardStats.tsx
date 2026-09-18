import React, { useState } from 'react';
import { DATASET_ENCODINGS, RECIPES_DATA } from '../data/foodsnapData';
import { BenchmarkResult, UploadHistoryItem, Recipe } from '../types';
import { ActiveTab } from './Navbar';
import { 
  runDatasetBenchmark, 
  getAllEncodings, 
  getAllRecipes, 
  playChimeSound,
  scaleIngredientsText
} from '../utils/mlEngine';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  Server, 
  Cpu, 
  Database, 
  Zap, 
  CheckCircle, 
  Terminal, 
  FileCode2, 
  BarChart2, 
  Play, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Sparkles,
  Camera,
  BookOpen,
  Layers,
  BookmarkCheck,
  ArrowRight,
  ChefHat,
  Clock,
  Flame,
  X,
  Eye
} from 'lucide-react';

interface DashboardStatsProps {
  historyItems: UploadHistoryItem[];
  onNavigate?: (tab: ActiveTab) => void;
  onSelectRecipe?: (recipe: Recipe) => void;
  onSelectImage?: (imgSrc: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  historyItems, 
  onNavigate,
  onSelectRecipe,
  onSelectImage
}) => {
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [inspectModalRecipe, setInspectModalRecipe] = useState<Recipe | null>(null);

  const allEncodings = getAllEncodings();
  const allRecipes = getAllRecipes();

  const totalScans = historyItems.length;
  const avgLatency =
    totalScans > 0
      ? Math.round(
          (historyItems.reduce((acc, curr) => acc + curr.inferenceMs, 0) / totalScans) * 10
        ) / 10
      : 18.2;

  const datasetStats = [
    { label: 'Total Recipe Classes', value: `${allRecipes.length} Dishes`, icon: Database, targetTab: 'recipes' as ActiveTab, desc: 'Click to open Recipe Catalog' },
    { label: 'Reference Vector Embeddings', value: `${allEncodings.length} Samples`, icon: Cpu, targetTab: 'visualizer' as ActiveTab, desc: 'Click to view 80-D vector plots' },
    { label: 'Feature Dimensionality', value: '80 Dimensions', icon: Zap, targetTab: 'visualizer' as ActiveTab, desc: '48 Spatial RGB + 32 HSV Bins' },
    { label: 'Average Query Latency', value: `${avgLatency} ms`, icon: BarChart2, targetTab: 'saved' as ActiveTab, desc: 'Sub-millisecond cosine search' }
  ];

  const handleRunBenchmark = () => {
    setIsRunningBenchmark(true);
    setTimeout(() => {
      const res = runDatasetBenchmark();
      setBenchmarkResult(res);
      setIsRunningBenchmark(false);
      playChimeSound();
    }, 600);
  };

  const handleExportBenchmark = () => {
    if (!benchmarkResult) return;
    const blob = new Blob([JSON.stringify(benchmarkResult, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodsnap_benchmark_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenDish = (recipeName: string) => {
    const found = allRecipes.find((r) => r.name.toLowerCase() === recipeName.toLowerCase() || r.id === recipeName);
    if (found) {
      setInspectModalRecipe(found);
    } else if (onNavigate) {
      onNavigate('recipes');
    }
  };

  const handleScanDish = (recipe: Recipe) => {
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    } else if (recipe.referenceImages[0] && onSelectImage) {
      onSelectImage(recipe.referenceImages[0]);
    } else if (onNavigate) {
      onNavigate('scanner');
    }
  };

  return (
    <div className="w-full space-y-6" id="dashboard-stats-section">
      {/* Top metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {datasetStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate(stat.targetTab)}
              className="bg-stone-900 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium group-hover:text-stone-300 transition-colors">{stat.label}</div>
                  <div className="text-xl font-extrabold text-white font-mono mt-0.5 group-hover:text-amber-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{stat.desc}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Quick Launch Action Ribbon */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-stone-300">Quick Navigation:</span>
          <span>Switch directly between modules</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate('scanner')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Dish Scanner</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('recipes')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Recipes ({allRecipes.length})</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('visualizer')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>80-D Vectors</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('saved')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>History & Saved</span>
          </button>
        </div>
      </div>

      {/* Reference Recipe Showcase & Quick Actions inside Dashboard */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <span>Reference Dishes in Classification Model</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Click any dish below to view its full recipe, nutrition, or test it in the camera recognizer.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('recipes')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold border border-stone-700 transition-colors self-start sm:self-auto"
          >
            <span>View All {allRecipes.length} Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {allRecipes.slice(0, 8).map((recipe, idx) => (
            <div
              key={`${recipe.id}-${idx}`}
              className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={recipe.referenceImages[0]}
                  alt={recipe.name}
                  className="w-12 h-12 rounded-lg object-cover bg-stone-800 flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-stone-200 group-hover:text-amber-400 transition-colors truncate">
                    {recipe.name}
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                    {recipe.calories} • {recipe.cooking_time}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-800/60 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setInspectModalRecipe(recipe)}
                  className="py-1.5 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>Recipe</span>
                </button>

                <button
                  onClick={() => handleScanDish(recipe)}
                  className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all border border-amber-500/30"
                >
                  <Camera className="w-3 h-3" />
                  <span>Scan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Benchmark Suite Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Model Evaluation & Accuracy Benchmark</h3>
              <p className="text-xs text-stone-400">
                Evaluates leave-one-out cosine nearest-neighbor classification across all {allEncodings.length} sample vectors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {benchmarkResult && (
              <button
                onClick={handleExportBenchmark}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            )}

            <button
              onClick={handleRunBenchmark}
              disabled={isRunningBenchmark}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              {isRunningBenchmark ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Vectors...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Live Benchmark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benchmark Results Display */}
        {benchmarkResult ? (
          <div className="space-y-4 animate-in fade-in">
            {/* 3 Summary score boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                <div className="text-xs text-stone-400 font-medium">Top-1 Accuracy</div>
                <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
                  {benchmarkResult.top1Accuracy}%
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Exact first-choice match</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                <div className="text-xs text-stone-400 font-medium">Top-3 Recall</div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                  {benchmarkResult.top3Accuracy}%
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Correct dish in top 3 results</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                <div className="text-xs text-stone-400 font-medium">Mean Evaluation Latency</div>
                <div className="text-3xl font-extrabold text-sky-400 font-mono mt-1">
                  {benchmarkResult.avgLatencyMs} ms
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Per-vector cosine distance query</div>
              </div>
            </div>

            {/* Test samples breakdown table */}
            <div className="rounded-xl border border-stone-800 overflow-hidden">
              <div className="bg-stone-950 px-4 py-2.5 border-b border-stone-800 flex items-center justify-between text-xs font-bold text-stone-300">
                <span>Evaluated Reference Sample (Click row to inspect)</span>
                <span>Prediction & Action</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-800/60 bg-stone-900/50 text-xs">
                {benchmarkResult.itemResults?.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleOpenDish(item.expectedName)}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-stone-800/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      {item.isTop1Match ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : item.isTop3Match ? (
                        <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-stone-200 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          <span>{item.expectedName}</span>
                          <span className="text-[10px] text-stone-500 font-normal">({item.filename})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium text-stone-300">
                          {item.predictedName}
                        </div>
                        <div className="font-mono text-[10px] text-amber-400">
                          {item.confidence}% ({item.latencyMs}ms)
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-300 font-bold text-[10px] transition-colors">
                        View Recipe
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-stone-950/60 border border-stone-800/80 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto" />
            <div className="text-sm font-bold text-stone-200">No Benchmark Executed Yet</div>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Click &quot;Run Live Benchmark&quot; above to calculate real-time Top-1 accuracy, Top-3 recall, and cosine distance latency across all {allEncodings.length} dataset vectors.
            </p>
          </div>
        )}
      </div>

      {/* Deep Model & Backend Architecture details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Encoders Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Dual-Encoder Architecture</h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-stone-300">
            <div 
              onClick={() => onNavigate && onNavigate('visualizer')}
              className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between font-bold text-stone-200">
                <span>In-Browser: 4×4 Spatial RGB + HSV Histogram</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px]">
                  80 Dims (Active)
                </span>
              </div>
              <p className="text-stone-400 mt-1">
                Computes 16 spatial grid cell color means (48 dims) and 32-bin HSV color spectrum distributions for sub-millisecond execution in browser. Click to inspect live 80-D plots.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800">
              <div className="flex items-center justify-between font-bold text-stone-200">
                <span>DenseNet201 Deep Feature Map (PyTorch/TF Reference)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                  1920 Dims
                </span>
              </div>
              <p className="text-stone-400 mt-1">
                Utilizes deep convolutional ImageNet feature maps with global average pooling for high-level semantic food classification.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Engineering Spec */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">80-Dimensional Feature Breakdown</h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('visualizer')}
              className="text-[11px] font-semibold text-amber-400 hover:underline"
            >
              Open Visualizer →
            </button>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div 
              onClick={() => onNavigate && onNavigate('visualizer')}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2 text-stone-300 group-hover:text-amber-400">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                <span>Spatial 4×4 RGB Grid</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">48 Dimensions</span>
            </div>

            <div 
              onClick={() => onNavigate && onNavigate('visualizer')}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2 text-stone-300 group-hover:text-emerald-400">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span>Hue Spectrum (15° bins)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">24 Dimensions</span>
            </div>

            <div 
              onClick={() => onNavigate && onNavigate('visualizer')}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-sky-500/50 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2 text-stone-300 group-hover:text-sky-400">
                <FileCode2 className="w-4 h-4 text-sky-400" />
                <span>Saturation Bins</span>
              </div>
              <span className="text-[10px] text-sky-400 font-bold">4 Dimensions</span>
            </div>

            <div 
              onClick={() => onNavigate && onNavigate('visualizer')}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-purple-500/50 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2 text-stone-300 group-hover:text-purple-400">
                <FileCode2 className="w-4 h-4 text-purple-400" />
                <span>Value/Brightness Bins</span>
              </div>
              <span className="text-[10px] text-purple-400 font-bold">4 Dimensions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Recipe Quick-Inspect Modal */}
      {inspectModalRecipe && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setInspectModalRecipe(null)}
        >
          <div 
            className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-700 relative flex-shrink-0">
                  <ImageWithFallback
                    src={inspectModalRecipe.referenceImages[0]}
                    alt={inspectModalRecipe.name}
                    foodName={inspectModalRecipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-serif">{inspectModalRecipe.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      {inspectModalRecipe.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      {inspectModalRecipe.calories}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {inspectModalRecipe.cooking_time}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectModalRecipe(null)}
                className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white border border-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-300">
              <div>
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                  Ingredients:
                </h4>
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                  {inspectModalRecipe.ingredients}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                  Cooking Directions:
                </h4>
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 max-h-48 overflow-y-auto">
                  {inspectModalRecipe.directions}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => {
                  const r = inspectModalRecipe;
                  setInspectModalRecipe(null);
                  if (onNavigate) onNavigate('recipes');
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
              >
                Open in Full Catalog
              </button>

              <button
                onClick={() => {
                  const r = inspectModalRecipe;
                  setInspectModalRecipe(null);
                  handleScanDish(r);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
              >
                <Camera className="w-4 h-4" />
                <span>Test & Match in Scanner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
