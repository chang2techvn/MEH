'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  Sparkles, 
  Crown,
  Globe,
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AICharacter } from '@/types/ai-hub.types';
import { useMobile } from '@/hooks/use-mobile';
import { singleChatService } from '@/lib/single-chat-service';

interface WelcomeScreenProps {
  selectedAIs: string[];
  onToggleAI: (aiId: string) => void;
  aiCharacters: AICharacter[];
  darkMode: boolean;
  onStartChat?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  selectedAIs,
  onToggleAI,  
  aiCharacters,
  darkMode,
  onStartChat
}) => {
  // Get featured AI characters (first 6 for display)
  const featuredAIs = aiCharacters.slice(0, 6);
  const isMobile = useMobile();
  
  // Dynamic assistant data
  const [assistantAvatar, setAssistantAvatar] = useState<string>("")
  const [assistantName, setAssistantName] = useState<string>("AI Assistant")
  
  // Load assistant configuration
  useEffect(() => {
    const loadAssistantData = async () => {
      try {
        await singleChatService.initializeConfig()
        const avatar = singleChatService.getAssistantAvatar()
        const name = singleChatService.getAssistantName()
        
        setAssistantAvatar(avatar)
        setAssistantName(name)
      } catch (error) {
        console.error('Error loading assistant data:', error)
      }
    }

    loadAssistantData()
  }, [])
  
  // Optimize animations for mobile performance
  const getOptimizedAnimationProps = () => {
    if (isMobile) {
      return {
        // Simpler animation for mobile
        scale: [1, 1.01, 1],
        rotate: [0, 0.5, -0.5, 0],
        duration: 12, // Slower animation
        sparkleRotation: 40 // Much slower sparkle rotation
      };
    }
    return {
      // Full animation for desktop
      scale: [1, 1.02, 1],
      rotate: [0, 1, -1, 0], 
      duration: 8,
      sparkleRotation: 20
    };
  };

  const animationProps = getOptimizedAnimationProps();
  
  // Quick start suggestions
  const quickStartSuggestions = [
    {
      icon: <MessageCircle className="h-full w-full" />,
      title: "Practice Conversation",
      description: "Start a casual chat with AI celebrities",
      action: "Choose 2-3 AIs"
    },
    {
      icon: <BookOpen className="h-full w-full" />,
      title: "Learn Languages", 
      description: "Get help with English learning",
      action: "Select tutors"
    },
    {
      icon: <Crown className="h-full w-full" />,
      title: "Celebrity Interview",
      description: "Interview famous personalities",
      action: "Pick celebrities"
    }
  ];

  return (
    <div className="flex items-center justify-center h-full w-full min-h-[350px] sm:min-h-[400px]">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Hero Section - Compact */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <motion.div
              animate={{ 
                scale: animationProps.scale,
                rotate: animationProps.rotate
              }}
              transition={{ 
                duration: animationProps.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative inline-block mb-3 sm:mb-4 md:mb-6"
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                <Image
                  src={assistantAvatar || "https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif"}
                  alt={`${assistantName} AI Avatar`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
                {/* Conditional animation - only show pulse on larger screens */}
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 ${isMobile ? '' : 'animate-pulse'}`}></div>
                {/* Optimized sparkle rotation */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: animationProps.sparkleRotation, 
                    repeat: Infinity, 
                    ease: "linear"
                  }}
                  className="absolute inset-0"
                >
                  <Sparkles className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 md:top-2 md:right-2 h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'} opacity-70`} />
                  <Sparkles className={`absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 md:bottom-2 md:left-2 h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-3 md:w-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'} opacity-50`} />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 md:mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
            >
              Welcome to AI Hub
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-xs sm:text-sm md:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto leading-relaxed px-1 sm:px-2`}
            >
              Chat with {assistantName} from gemini or chat with AI celebrities and famous personalities. You can chat now or select characters below to start your conversation.
            </motion.p>
          </div>

          {/* Featured AI Characters - More Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 sm:mb-6"
          >
            <h3 className={`text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Choose Your AI Characters
            </h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
              {featuredAIs.map((ai, index) => (
                <motion.div
                  key={ai.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  onClick={() => onToggleAI(ai.id)}
                  className={`p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedAIs.includes(ai.id)
                      ? (darkMode ? 'bg-blue-900/30 border-2 border-blue-600' : 'bg-blue-50 border-2 border-blue-300')
                      : (darkMode ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70' : 'bg-white/50 border border-gray-200 hover:bg-white/80')
                  }`}
                >
                  <div className="relative mb-1 sm:mb-1.5 md:mb-2">
                    <Image
                      src={ai.avatar || '/placeholder-avatar.png'}
                      alt={ai.name}
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover mx-auto border-2 border-white dark:border-gray-700 shadow-sm"
                    />
                    {selectedAIs.includes(ai.id) && (
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Zap className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <h4 className={`font-medium text-xs sm:text-sm text-center mb-0.5 sm:mb-1 line-clamp-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {ai.name}
                  </h4>
                  <p className={`text-xs text-center line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {ai.role}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Start Tips - Simplified */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-4 sm:mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 max-w-2xl mx-auto">
              {quickStartSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`p-2 sm:p-3 rounded-md sm:rounded-lg border text-center transition-all duration-200 hover:scale-105 cursor-pointer ${
                    darkMode 
                      ? 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50' 
                      : 'bg-white/30 border-gray-200 hover:bg-white/60'
                  }`}
                  onClick={onStartChat}
                >
                  <div className={`inline-flex p-1 sm:p-1.5 rounded-md sm:rounded-lg mb-1 sm:mb-2 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <div className="h-3 w-3 sm:h-4 sm:w-4">
                      {suggestion.icon}
                    </div>
                  </div>
                  <h4 className={`font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {suggestion.title}
                  </h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {suggestion.action}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
