import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, RefreshCw, X, AlertCircle, Sparkles, Zap, ArrowRight, HelpCircle, Globe, BookmarkCheck, Database, Cpu, Utensils, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { CameraInterface } from './CameraInterface';

interface ImageUploaderProps {
  onImageSelected: (imageSrc: string) => void;
  isLoading: boolean;
  selectedImage: string | null;
  onOpenGuide?: () => void;
  onOpenGlobalSearch?: () => void;
  onOpenDatasets?: () => void;
  onOpenPipeline?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
  selectedImage,
  onOpenGuide,
  onOpenGlobalSearch,
  onOpenDatasets,
  onOpenPipeline
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream when unmounting or switching off
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageSelected(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload a photo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      onImageSelected(dataUrl);
    }
  };

  return (
    <div className="w-full space-y-6" id="image-uploader-section">
      {/* Friendly Recognition Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Instant AI Culinary Recognition</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                Multimodal Vision
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Upload any dish photo or capture in real time. The neural vision engine identifies the authentic dish, breaks down visual features, and opens detailed recipes and cooking steps.
            </p>
          </div>
        </div>

        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-stone-700 transition-colors flex-shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>How It Works Guide</span>
          </button>
        )}
      </div>

      {/* Main Upload Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <span>Upload Food Photograph</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Select an image from your device or snap a fresh photo with your camera.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-open-camera-studio"
              onClick={() => setIsCameraModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/10 transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Camera Interface</span>
            </button>

            {onOpenDatasets && (
              <button
                onClick={onOpenDatasets}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
                title="Explore Culinary Datasets on dedicated page"
              >
                <Database className="w-4 h-4 text-amber-400" />
                <span>Culinary Datasets</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Camera View */}
        {isCameraActive && (
          <div className="mt-5 relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[380px] flex items-center justify-center border border-amber-500/40 shadow-inner">
            {cameraError ? (
              <div className="p-6 text-center text-red-300">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm">{cameraError}</p>
                <button
                  onClick={stopCamera}
                  className="mt-3 px-4 py-1.5 bg-stone-800 text-white rounded-lg text-xs"
                >
                  Return to File Upload
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-amber-400/40 rounded-2xl pointer-events-none m-6"></div>
                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                  <button
                    id="btn-capture-photo"
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Dish Photo</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Drag & Drop Zone */}
        {!isCameraActive && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-5 border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-150 ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : selectedImage
                ? 'border-stone-700 bg-stone-950/60 hover:border-amber-500/50'
                : 'border-stone-700 bg-stone-950/40 hover:border-stone-600 hover:bg-stone-950/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedImage ? (
              <div className="flex flex-col items-center">
                <div className="relative group max-w-[280px] rounded-xl overflow-hidden shadow-lg border border-stone-700">
                  <ImageWithFallback
                    src={selectedImage}
                    alt="Selected Food"
                    foodName="Selected Food"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold p-4 text-center">
                    Click to upload a different dish photograph
                  </div>
                </div>
                <p className="mt-3.5 text-xs text-amber-400 font-medium flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Analyzing dish & preparing results page...' : 'Image loaded — click to choose another photo'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-100">
                  Drag and drop your food photo here, or click to browse
                </h3>
                <p className="text-xs text-stone-400 mt-1.5 max-w-md">
                  Upload photos of authentic dishes (Ogbono Soup, Jollof Rice, Egusi Soup, Suya, Amala, and more). Supported formats: JPEG, PNG, WebP.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="inline-flex items-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow">
                    Choose Image File
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCameraModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Use Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights Bar */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-400">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-200 block">Fine-Grained Classification</span>
              <span>Differentiates viscous draw soups like Ogbono from dry pastries, curds, and stews.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-200 block">Automatic Results Loading</span>
              <span>Upload redirects to a dedicated results page with cooking directions and timings.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-200 block">Complete Culinary Intelligence</span>
              <span>Nutritional profiles, ingredients checklist, and nearby dining recommendations.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-featured Camera Interface Modal */}
      <CameraInterface
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureImage={(capturedDataUrl) => {
          setIsCameraModalOpen(false);
          onImageSelected(capturedDataUrl);
        }}
      />
    </div>
  );
};
