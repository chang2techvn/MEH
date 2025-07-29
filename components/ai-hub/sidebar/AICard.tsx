import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { AICharacter } from '@/types/ai-hub.types';

interface AICardProps {
  ai: AICharacter;
  isSelected: boolean;
  onToggle: (aiId: string) => void;
  darkMode: boolean;
}

// Optimized Avatar Component with next/image
const OptimizedAIAvatar = ({ 
  src, 
  alt, 
  size = 32, 
  className = "",
  fallbackText,
  isSelected = false,
  darkMode = false,
  ...props 
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText: string;
  isSelected?: boolean;
  darkMode?: boolean;
  [key: string]: any;
}) => {
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div 
        className={`relative overflow-hidden rounded-full flex items-center justify-center animate-pulse ${
          isSelected 
            ? 'border-blue-400 shadow-lg shadow-blue-400/30' 
            : (darkMode ? 'border-gray-500' : 'border-gray-300')
        } border-2 bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <span 
          className={`font-semibold select-none ${
            isSelected 
              ? 'text-blue-800' 
              : 'text-gray-700'
          }`} 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative overflow-hidden rounded-full flex items-center justify-center ${
        isSelected 
          ? 'border-blue-400 shadow-lg shadow-blue-400/30' 
          : (darkMode ? 'border-gray-500' : 'border-gray-300')
      } border-2 transition-colors duration-150 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          width={size * 2}
          height={size * 2}
          quality={90}
          className="object-cover rounded-full"
          style={{ 
            width: size, 
            height: size,
            imageRendering: 'crisp-edges'
          }}
          onError={() => setImageError(true)}
          sizes={`${size}px`}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span 
          className={`font-semibold select-none ${
            isSelected 
              ? 'text-blue-800' 
              : 'text-gray-700'
          }`} 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      )}
    </div>
  );
};

export const AICard: React.FC<AICardProps> = ({ ai, isSelected, onToggle, darkMode }) => {
  return (
    <div
      className={`relative group p-2.5 rounded-xl cursor-pointer transition-all duration-150 ease-out will-change-auto min-h-[72px] shadow-sm flex items-start border ${
        isSelected 
          ? (darkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200') 
          : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700 border-transparent' : 'bg-white hover:bg-gray-50 border-transparent')
      }`}
      style={{
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)',
      }}
      onClick={() => onToggle(ai.id)}
    >
      <div className="relative flex-shrink-0">
        <OptimizedAIAvatar
          src={ai.avatar}
          alt={ai.name}
          size={28}
          fallbackText={ai.name.substring(0, 2)}
          isSelected={isSelected}
          darkMode={darkMode}
        />
        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
          ai.online ? 'bg-blue-500' : 'bg-gray-400'
        }`}></div>
      </div>
      <div className="ml-2.5 flex-1 min-w-0 overflow-hidden">
        <div className="flex items-start justify-between min-w-0 mb-1">
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-xs line-clamp-1 mb-0.5 transition-colors duration-150">{ai.name}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium truncate`}>{ai.role}</p>
          </div>
        </div>
        <div className="mb-1">
          <Badge variant="outline" className={`text-xs font-medium px-1.5 py-0.5 h-auto inline-block max-w-full ${
            isSelected 
              ? (darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-500/50' : 'bg-blue-100 text-blue-700 border-blue-300')
              : (darkMode ? 'bg-gray-600 text-gray-300 border-gray-500' : 'bg-gray-100 text-gray-600 border-gray-300')
          }`} title={ai.field}>
            <span className="block truncate">{ai.field}</span>
          </Badge>
        </div>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2 leading-tight`}>{ai.description}</p>
      </div>
      
      {/* Active indicator - viền trái giống chat history */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full transition-opacity duration-150 ${
        isSelected ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
};
