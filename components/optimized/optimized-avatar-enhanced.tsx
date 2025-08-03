'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText: string;
  priority?: boolean;
  [key: string]: any;
}

export const OptimizedAvatarEnhanced = ({ 
  src, 
  alt, 
  size = 48, 
  className = "",
  fallbackText,
  priority = false,
  ...props 
}: OptimizedAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div 
        className={`relative overflow-hidden rounded-full bg-green-100 flex items-center justify-center animate-pulse ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <span className="text-green-800 font-medium" style={{ fontSize: size * 0.4 }}>
          {fallbackText}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative overflow-hidden rounded-full bg-green-100 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          width={size * 2} // 2x resolution for retina displays
          height={size * 2}
          quality={100} // Maximum quality
          priority={priority || size >= 48} // Priority for larger avatars or when specified
          className="object-cover rounded-full transition-all duration-300"
          style={{ 
            width: size, 
            height: size,
            imageRendering: 'crisp-edges' // Ensures sharp rendering
          }}
          onError={() => setImageError(true)}
          sizes={`${size}px`}
          // Add loading optimization
          loading={priority ? 'eager' : 'lazy'}
          // Prevent drag
          draggable={false}
        />
      ) : (
        <span 
          className="text-green-800 font-medium select-none" 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      )}
    </div>
  );
};
