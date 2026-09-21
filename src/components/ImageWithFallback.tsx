import React, { useState, useEffect } from 'react';
import { getVerifiedFoodImage } from '../utils/foodImageHelper';
import { Utensils } from 'lucide-react';

export interface ImageWithFallbackProps {
  src?: string | null;
  alt?: string;
  foodName?: string;
  category?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  loading?: 'lazy' | 'eager';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Food Image',
  foodName = '',
  category = '',
  className = 'w-full h-full object-cover',
  onClick,
  loading = 'lazy'
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    return src || getVerifiedFoodImage(foodName || alt, category);
  });
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setHasError(false);
    } else {
      setCurrentSrc(getVerifiedFoodImage(foodName || alt, category));
      setHasError(false);
    }
  }, [src, foodName, alt, category]);

  const handleError = () => {
    const verifiedFallback = getVerifiedFoodImage(foodName || alt, category);
    if (currentSrc !== verifiedFallback) {
      setCurrentSrc(verifiedFallback);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div 
        className={`bg-stone-800 flex flex-col items-center justify-center p-3 text-stone-500 select-none ${className}`}
        title={alt}
      >
        <Utensils className="w-6 h-6 text-amber-500/60 mb-1" />
        <span className="text-[10px] text-stone-400 font-medium text-center line-clamp-1">
          {foodName || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onClick={onClick}
      loading={loading}
      referrerPolicy="no-referrer"
    />
  );
};
