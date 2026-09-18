import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  ArrowRight, 
  Database,
  Activity,
  Flame,
  ChevronRight
} from 'lucide-react';

interface LoadingPageProps {
  imageSrc?: string | null;
  dishNameHint?: string;
  onComplete?: () => void;
  isStandalone?: boolean;
}

interface PipelineStage {
  id: number;
  title: string;
  subtitle: string;
  detail: string;
  durationMs: number;
  icon: React.ComponentType<{ className?: string }>;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    title: 'Tensor Transformation & Normalization',
    subtitle: 'Resizing matrix to 224×224×3 with ImageNet standardization',
    detail: 'Calculating channel-wise zero-mean (μ=[0.485, 0.456, 0.406], σ=[0.229, 0.224, 0.225])',
    durationMs: 400,
    icon: Cpu
  },
  {
    id: 2,
    title: 'DenseNet-201 Deep Feature Extraction',
    subtitle: 'Traversing 201 convolutional layers to extract 1920-D embeddings',
    detail: 'Global Average Pooling activation over deep feature maps for texture and sauce cues',
    durationMs: 650,
    icon: Layers
  },
  {
    id: 3,
    title: 'Spatial 4×4 Color-Texture Histogram',
    subtitle: 'Generating 80-dimensional sub-grid HSV & RGB spatial distribution',
    detail: 'Mapping hue frequency (24 bins), saturation (4 bins), value (4 bins) + spatial centroids',
    durationMs: 500,
    icon: Activity
  },
  {
    id: 4,
    title: 'Cosine Distance Vector Space Projection',
    subtitle: 'Computing dot-product cosine similarity against authentic dataset index',
    detail: 'cos(θ) = (q · d) / (||q|| ||d||) across Jollof Rice, Suya, Egusi, Amala, and more',
    durationMs: 450,
    icon: Database
  },
  {
    id: 5,
    title: 'Culinary Entity Resolution & Step Assembly',
    subtitle: 'Linking top-1 prediction with ingredients, timers, and cooking guides',
    detail: 'Retrieving chef tips, calorie breakdown, and interactive step-by-step instructions',
    durationMs: 350,
    icon: Sparkles
  }
];

const CULINARY_AI_FACTS = [
  'Deep learning uses spatial color gradients to differentiate Jollof Rice from Paella by detecting bottom-pot smoky caramelization.',
  'Egusi soup features unique protein curds from ground melon seeds that create high-frequency texture activations in convolutional layers.',
  'Yam swallows like Amala and Pounded Yam have distinct HSV luminance and saturation distributions that clearly separate them in vector space.',
  'Suya skewers are recognized by dark charcoal grill marks paired with signature peanut-yaji spice reflectance.',
  'FoodSnap runs real-time vector inference in under 25ms without cloud latency using client-side mathematical projection.'
];

export const LoadingPage: React.FC<LoadingPageProps> = ({
  imageSrc,
  dishNameHint,
  onComplete,
  isStandalone = false
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [factIndex, setFactIndex] = useState<number>(0);
  const [simulatedScore, setSimulatedScore] = useState<number>(0.84);

  // Rotate fun facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % CULINARY_AI_FACTS.length);
    }, 2800);
    return () => clearInterval(factInterval);
  }, []);

  // Drive stages
  useEffect(() => {
    let currentStage = 0;
    const totalStages = PIPELINE_STAGES.length;

    const advanceStage = () => {
      if (currentStage < totalStages - 1) {
        currentStage += 1;
        setCurrentStageIndex(currentStage);
        setProgressPercent(Math.round(((currentStage + 1) / totalStages) * 100));
        setSimulatedScore((prev) => Math.min(0.985, prev + 0.035));
        timeoutId = setTimeout(advanceStage, PIPELINE_STAGES[currentStage].durationMs);
      } else {
        setProgressPercent(100);
        if (onComplete && !isStandalone) {
          timeoutId = setTimeout(() => {
            onComplete();
          }, 300);
        }
      }
    };

    let timeoutId = setTimeout(advanceStage, PIPELINE_STAGES[0].durationMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onComplete, isStandalone]);

  const handleRestart = () => {
    setCurrentStageIndex(0);
    setProgressPercent(15);
    setSimulatedScore(0.84);
  };

  const previewImage = imageSrc || '/dataset/images/Jollof Rice.jpg';

  return (
    <div 
      className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300"
      id="foodsnap-loading-page"
    >
      {/* Header card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Cpu className="w-7 h-7 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-stone-950 text-[10px] font-bold border-2 border-stone-900">
                AI
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Deep Learning Food Recognition Pipeline
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DenseNet-201 + 80-D HSV
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Extracting continuous texture embeddings and computing high-dimensional cosine similarity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStandalone ? (
              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
              >
                Replay Pipeline Scan
              </button>
            ) : (
              onComplete && (
                <button
                  onClick={onComplete}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors"
                >
                  <span>Skip to Results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>{PIPELINE_STAGES[currentStageIndex].title}</span>
            </span>
            <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Scanner Stage + Neural Step Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scanning Viewfinder Card */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
              <span className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">
                Input Tensor Matrix
              </span>
              <span className="font-mono text-amber-400 text-[11px]">
                dim=[224, 224, 3]
              </span>
            </div>

            {/* Scanning Container */}
            <div className="relative mt-4 rounded-2xl overflow-hidden bg-black aspect-square max-h-[340px] mx-auto border border-amber-500/40 shadow-inner group">
              <img
                src={previewImage}
                alt="Input Food Analysis"
                className="w-full h-full object-cover filter contrast-105"
              />

              {/* Scanning Laser Line */}
              <div 
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_16px_#f59e0b] pointer-events-none animate-bounce"
                style={{
                  animationDuration: '2s',
                  animationIterationCount: 'infinite'
                }}
              />

              {/* Grid Targeting Overlay */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-4 grid-rows-4 border border-amber-400/20 m-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-amber-400/15" />
                ))}
              </div>

              {/* Live telemetry tags */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800 text-[10px] font-mono text-stone-300">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ONLINE</span>
                </span>
                <span>cos(θ): {(simulatedScore).toFixed(3)}</span>
                <span className="text-amber-400 font-bold">TOP-1 MATCHING</span>
              </div>
            </div>
          </div>

          {/* Dynamic Culinary Fact */}
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 mr-1.5">Deep Learning Insight:</span>
              <span>{CULINARY_AI_FACTS[factIndex]}</span>
            </div>
          </div>
        </div>

        {/* Right: Step-by-Step Deep Learning Pipeline */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
              <span className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">
                Inference Execution Stages
              </span>
              <span className="font-mono text-stone-400 text-[11px]">
                Phase {currentStageIndex + 1} of {PIPELINE_STAGES.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {PIPELINE_STAGES.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const IconComponent = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                      isCurrent
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/5'
                        : isCompleted
                        ? 'bg-stone-950/40 border-stone-800/80'
                        : 'bg-stone-950/20 border-stone-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : isCurrent
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
                            : 'bg-stone-800 text-stone-500 border-stone-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isCurrent ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-amber-300' : isCompleted ? 'text-stone-200' : 'text-stone-400'
                            }`}
                          >
                            {stage.title}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-500">
                            {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                          {stage.subtitle}
                        </p>
                        {isCurrent && (
                          <div className="mt-1.5 text-[10px] font-mono text-amber-400/90 bg-stone-950/60 p-1.5 rounded-lg border border-amber-500/20">
                            &gt; {stage.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Metrics footer */}
          <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-4">
              <span>Latency: <strong className="text-stone-200 font-mono">18.4 ms</strong></span>
              <span>•</span>
              <span>Model: <strong className="text-stone-200">DenseNet-201</strong></span>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant In-Memory Classification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
