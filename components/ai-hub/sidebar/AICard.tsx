import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AICharacter } from '@/types/ai-hub.types';

interface AICardProps {
  ai: AICharacter;
  isSelected: boolean;
  onToggle: (aiId: string) => void;
  darkMode: boolean;
}

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
        <Avatar className={`w-8 h-8 border-2 ${
          isSelected 
            ? 'border-blue-400 shadow-lg shadow-blue-400/30' 
            : (darkMode ? 'border-gray-500' : 'border-gray-300')
        } transition-all duration-300 group-hover:scale-105`}>
          <AvatarImage src={ai.avatar} alt={ai.name} className="object-cover" />
          <AvatarFallback className={`text-xs font-semibold ${
            isSelected 
              ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
          }`}>
            {ai.name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
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
