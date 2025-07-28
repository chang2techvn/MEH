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
      } border-2 transition-all duration-300 group-hover:scale-105 ${className}`}
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
          className="object-cover rounded-full transition-all duration-300"
          style={{ 
            width: size, 
            height: size,
            imageRendering: 'crisp-edges' // Ensures sharp rendering
          }}
          onError={() => setImageError(true)}
          sizes={`${size}px`}
          // Add loading optimization
          loading="lazy"
          // Prevent drag
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
      className={`group p-2 rounded-lg cursor-pointer transition-all duration-300 ${
        isSelected 
          ? (darkMode ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg shadow-blue-200/50') 
          : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md')
      } transform hover:scale-[1.01] hover:-translate-y-0.5 flex items-start`}
      onClick={() => onToggle(ai.id)}
    >
      <div className="relative flex-shrink-0">
        <OptimizedAIAvatar
          src={ai.avatar}
          alt={ai.name}
          size={32}
          fallbackText={ai.name.substring(0, 2)}
          isSelected={isSelected}
          darkMode={darkMode}
        />
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
          ai.online ? 'bg-blue-500' : 'bg-gray-400'
        } transition-all duration-300`}></div>
      </div>
      <div className="ml-2 flex-1 min-w-0 overflow-hidden">
        <div className="flex items-start justify-between min-w-0">
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-xs line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">{ai.name}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium truncate mt-0.5`}>{ai.role}</p>
            <div className="mt-1">
              <Badge variant="outline" className={`text-xs font-medium px-1.5 py-0.5 h-auto inline-block max-w-full ${
                isSelected 
                  ? (darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-500/50' : 'bg-blue-100 text-blue-700 border-blue-300')
                  : (darkMode ? 'bg-gray-600 text-gray-300 border-gray-500' : 'bg-gray-100 text-gray-600 border-gray-300')
              } transition-all duration-200`} title={ai.field}>
                <span className="block truncate">{ai.field}</span>
              </Badge>
            </div>
          </div>
          {isSelected && (
            <div className="flex items-center justify-center w-3.5 h-3.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm flex-shrink-0 ml-1">
              <i className="fas fa-check text-white text-xs"></i>
            </div>
          )}
        </div>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-3 leading-relaxed mt-1`}>{ai.description}</p>
      </div>
    </div>
  );
};
