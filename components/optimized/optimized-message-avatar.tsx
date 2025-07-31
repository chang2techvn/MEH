import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Optimized Avatar Component for Messages with next/image
export const OptimizedMessageAvatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = "",
  fallbackText,
  darkMode = false,
  ...props 
}: {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | number;
  className?: string;
  fallbackText: string;
  darkMode?: boolean;
  [key: string]: any;
}) => {
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Convert size to pixel value
  const sizeInPx = typeof size === 'number' ? size : (size === 'sm' ? 32 : 48);
  
  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div 
        className={`relative overflow-hidden rounded-full flex items-center justify-center animate-pulse bg-orange-100 border-2 ${darkMode ? 'border-gray-700' : 'border-white'} shadow-md ${className}`}
        style={{ width: sizeInPx, height: sizeInPx }}
        {...props}
      >
        <span 
          className="text-orange-800 font-medium select-none" 
          style={{ fontSize: sizeInPx * 0.4 }}
        >
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-full flex items-center justify-center ${darkMode ? 'border-gray-700' : 'border-white'} border-2 shadow-md bg-orange-100 ${className}`}
      style={{ width: sizeInPx, height: sizeInPx }}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          width={sizeInPx}
          height={sizeInPx}
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
          priority={false}
          sizes={`${sizeInPx}px`}
          style={{
            objectFit: 'cover',
            borderRadius: '50%'
          }}
        />
      ) : (
        <span 
          className="text-orange-800 font-medium select-none" 
          style={{ fontSize: sizeInPx * 0.4 }}
        >
          {fallbackText}
        </span>
      )}
    </div>
  );
};
