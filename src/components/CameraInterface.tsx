import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  RefreshCw, 
  X, 
  Zap, 
  Clock, 
  Grid, 
  Circle, 
  Crosshair, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Sparkles,
  Sliders,
  Maximize2
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { SAMPLE_PRESET_IMAGES } from '../data/foodsnapData';

interface CameraInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureImage: (imageDataUrl: string) => void;
}

type FramingGuide = 'circle' | 'grid' | 'crosshair' | 'none';
type TimerDuration = 0 | 3 | 5;

export const CameraInterface: React.FC<CameraInterfaceProps> = ({
  isOpen,
  onClose,
  onCaptureImage
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [framingGuide, setFramingGuide] = useState<FramingGuide>('circle');
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isExposureBoosted, setIsExposureBoosted] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [useSimulatedCam, setUseSimulatedCam] = useState<boolean>(false);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && !useSimulatedCam) {
      startCameraStream();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isOpen, facingMode, useSimulatedCam]);

  const startCameraStream = async () => {
    stopCameraStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam API is not supported in this browser environment. You can use the simulated dish camera or upload a photo.');
      setUseSimulatedCam(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Video play warning:', err);
        });
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setCameraError(`Camera permission unavailable (${errMsg}). Using high-fidelity food camera simulation.`);
      setUseSimulatedCam(true);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const executeSnapshot = () => {
    // Shutter flash animation
    setIsFlashActive(true);
    soundEffects.playShutterClick();
    setTimeout(() => setIsFlashActive(false), 150);

    if (useSimulatedCam) {
      const sample = SAMPLE_PRESET_IMAGES[selectedSampleIndex];
      setCapturedPreview(sample.url);
      return;
    }

    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (isExposureBoosted) {
          ctx.filter = 'brightness(1.15) contrast(1.08) saturate(1.1)';
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedPreview(dataUrl);
      }
    } catch (err) {
      console.error('Snapshot failed:', err);
      // Fallback
      const sample = SAMPLE_PRESET_IMAGES[0];
      setCapturedPreview(sample.url);
    }
  };

  const handleShutterClick = () => {
    if (timerDuration === 0) {
      executeSnapshot();
      return;
    }

    // Countdown logic
    setCountdown(timerDuration);
    soundEffects.playBeep(880, 0.05);

    let current = timerDuration;
    timerIntervalRef.current = window.setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        soundEffects.playBeep(880, 0.05);
      } else {
        clearInterval(timerIntervalRef.current!);
        timerIntervalRef.current = null;
        setCountdown(null);
        executeSnapshot();
      }
    }, 1000);
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    if (!useSimulatedCam) {
      startCameraStream();
    }
  };

  const handleConfirmCapture = () => {
    if (capturedPreview) {
      onCaptureImage(capturedPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      id="camera-interface-modal"
    >
      <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Shutter flash overlay */}
        {isFlashActive && (
          <div className="absolute inset-0 z-50 bg-white pointer-events-none transition-opacity duration-150" />
        )}

        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900/90 border-b border-stone-800 text-stone-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>FoodSnap Live Viewfinder</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {useSimulatedCam ? 'Simulated Feed' : 'HD Lens'}
                </span>
              </h3>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Center dish inside the target reticle for highest cosine similarity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Simulation toggle */}
            <button
              onClick={() => {
                setUseSimulatedCam((prev) => !prev);
                setCapturedPreview(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                useSimulatedCam 
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500/50' 
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
            >
              {useSimulatedCam ? 'Use Real Lens' : 'Test Preset Cam'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              title="Close Camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Main Stage */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[360px] sm:min-h-[440px]">
          {capturedPreview ? (
            /* Review captured photo */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <img
                src={capturedPreview}
                alt="Captured Dish"
                className="max-h-[50vh] sm:max-h-[60vh] object-contain rounded-2xl border border-stone-800 shadow-2xl"
              />
              <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur border border-stone-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Photo Captured</span>
              </div>
            </div>
          ) : useSimulatedCam ? (
            /* Simulated Live Food Cam */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={SAMPLE_PRESET_IMAGES[selectedSampleIndex].url}
                alt="Simulated live stream"
                className={`w-full h-full object-cover transition-all ${
                  isExposureBoosted ? 'brightness-110 contrast-105' : ''
                }`}
              />
              
              {/* Sample Dish Selector Pills */}
              <div className="absolute top-4 inset-x-0 flex items-center justify-center gap-1.5 px-4 overflow-x-auto py-1 z-20">
                {SAMPLE_PRESET_IMAGES.map((sample, idx) => (
                  <button
                    key={sample.recipeId}
                    onClick={() => setSelectedSampleIndex(idx)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap backdrop-blur border transition-all ${
                      selectedSampleIndex === idx
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                        : 'bg-stone-900/70 text-stone-300 border-stone-700 hover:bg-stone-800/80'
                    }`}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Real Video Stream */
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-all ${
                isExposureBoosted ? 'brightness-115 contrast-105 saturate-110' : ''
              }`}
            />
          )}

          {/* Camera Error banner */}
          {cameraError && !capturedPreview && (
            <div className="absolute top-4 inset-x-4 max-w-lg mx-auto bg-amber-950/80 backdrop-blur border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-center gap-2 z-20">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="flex-1">{cameraError}</span>
            </div>
          )}

          {/* Framing Guides Overlay (only active when live) */}
          {!capturedPreview && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              {/* Dish Circle Reticle */}
              {framingGuide === 'circle' && (
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-amber-400/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center animate-pulse">
                  <div className="w-6 h-6 border-t-2 border-r-2 border-amber-400 absolute top-0 right-0 -mr-1 -mt-1" />
                  <div className="w-6 h-6 border-b-2 border-l-2 border-amber-400 absolute bottom-0 left-0 -ml-1 -mb-1" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                  <span className="absolute -top-7 text-[10px] font-mono tracking-wider uppercase text-amber-300/80 bg-stone-900/80 px-2 py-0.5 rounded">
                    Plating Reticle
                  </span>
                </div>
              )}

              {/* Rule of Thirds Grid */}
              {framingGuide === 'grid' && (
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-amber-400/20 m-6">
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-b border-amber-400/30" />
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-b border-amber-400/30" />
                  <div className="border-r border-amber-400/30" />
                  <div className="border-r border-amber-400/30" />
                  <div />
                </div>
              )}

              {/* Crosshair & Corners */}
              {framingGuide === 'crosshair' && (
                <div className="w-72 h-72 sm:w-96 sm:h-96 relative flex items-center justify-center">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-amber-400 absolute top-0 left-0" />
                  <div className="w-8 h-8 border-t-2 border-r-2 border-amber-400 absolute top-0 right-0" />
                  <div className="w-8 h-8 border-b-2 border-l-2 border-amber-400 absolute bottom-0 left-0" />
                  <div className="w-8 h-8 border-b-2 border-r-2 border-amber-400 absolute bottom-0 right-0" />
                  <div className="w-12 h-0.5 bg-amber-400/50" />
                  <div className="h-12 w-0.5 bg-amber-400/50 absolute" />
                </div>
              )}
            </div>
          )}

          {/* Countdown Number Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-28 h-28 rounded-full bg-amber-500/20 border-4 border-amber-500 text-amber-300 font-bold text-6xl flex items-center justify-center animate-ping">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Viewfinder Control Panel */}
        <div className="bg-stone-900 border-t border-stone-800 px-6 py-4 flex flex-col gap-3">
          {capturedPreview ? (
            /* Review Actions */
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Retake Photo</span>
              </button>

              <button
                onClick={handleConfirmCapture}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Analyze Dish with AI</span>
              </button>
            </div>
          ) : (
            /* Live Camera Controls */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left Utilities */}
              <div className="flex items-center gap-2">
                {/* Framing guide picker */}
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-0.5">
                  <button
                    onClick={() => setFramingGuide('circle')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      framingGuide === 'circle' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Plating Circle Guide"
                  >
                    <Circle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFramingGuide('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      framingGuide === 'grid' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Rule-of-Thirds Grid"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFramingGuide('crosshair')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      framingGuide === 'crosshair' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Food Target Crosshairs"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFramingGuide('none')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                      framingGuide === 'none' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Off
                  </button>
                </div>

                {/* Exposure Booster */}
                <button
                  onClick={() => setIsExposureBoosted((prev) => !prev)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    isExposureBoosted 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                  title="Boost low-light brightness for dining tables"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Boost Light</span>
                </button>

                {/* Timer switcher */}
                <button
                  onClick={() => {
                    const next: TimerDuration = timerDuration === 0 ? 3 : timerDuration === 3 ? 5 : 0;
                    setTimerDuration(next);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    timerDuration > 0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                  title="Countdown Timer for hands-free snapshots"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{timerDuration === 0 ? 'Timer' : `${timerDuration}s`}</span>
                </button>
              </div>

              {/* Center Shutter Button */}
              <div className="flex items-center gap-3">
                <button
                  id="camera-shutter-trigger"
                  onClick={handleShutterClick}
                  disabled={countdown !== null}
                  className="relative group p-1 rounded-full border-4 border-amber-500/40 hover:border-amber-400 transition-all active:scale-95"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-500 group-hover:bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform">
                    <Camera className="w-6 h-6 text-stone-950" />
                  </div>
                </button>
              </div>

              {/* Right Camera Flip */}
              <div className="flex items-center gap-2">
                {!useSimulatedCam && (
                  <button
                    onClick={toggleFacingMode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-medium transition-colors"
                    title="Switch between front and back camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Flip Lens</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
