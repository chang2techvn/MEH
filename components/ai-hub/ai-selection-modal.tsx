"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Search, Sparkles } from "lucide-react"
import { useAIAssistants } from "@/hooks/use-ai-assistants"
import { AICharacter } from "@/types/ai-hub.types"

// Optimized Avatar Component for AI Selection with next/image
const OptimizedAIAvatar = ({ 
  src, 
  alt, 
  size = 40, 
  className = "",
  fallbackText,
  online = false,
  ...props 
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText: string;
  online?: boolean;
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
        className={`relative overflow-hidden rounded-full flex items-center justify-center animate-pulse bg-orange-100 border-2 border-white shadow-md ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <span 
          className="text-orange-800 font-medium select-none" 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <div 
        className={`relative overflow-hidden rounded-full flex items-center justify-center bg-orange-100 border-2 border-white shadow-md ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            width={size * 2} // 2x resolution for retina displays
            height={size * 2}
            quality={90}
            priority={false} // Not critical for modal loading
            className="object-cover rounded-full transition-all duration-300"
            style={{ 
              width: size, 
              height: size,
              imageRendering: 'crisp-edges'
            }}
            onError={() => setImageError(true)}
            sizes={`${size}px`}
            loading="lazy" // Lazy load for better performance
            draggable={false}
          />
        ) : (
          <span 
            className="text-orange-800 font-medium select-none" 
            style={{ fontSize: size * 0.4 }}
          >
            {fallbackText}
          </span>
        )}
      </div>
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
      )}
    </div>
  );
};

interface AISelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAI?: (ai: AICharacter) => void // Single select callback (deprecated)
  onToggleAI?: (aiId: string) => void // Toggle AI selection
  onStartChat?: (selectedAIIds: string[]) => void // Multi-select callback
  selectedAIs?: string[]
}

export function AISelectionModal({ 
  isOpen, 
  onClose, 
  onSelectAI,
  onToggleAI,
  onStartChat, 
  selectedAIs = [] 
}: AISelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Load real AI assistants from Supabase
  const { aiAssistants, loading, error } = useAIAssistants()

  const categories = [
    { id: "all", name: "All" },
    { id: "Giáo dục", name: "Education" },
    { id: "Y tế", name: "Healthcare" },
    { id: "Kinh doanh", name: "Business" },
    { id: "Công nghệ", name: "Technology" },
    { id: "Ẩm thực", name: "Food & Culinary" },
    { id: "Du lịch", name: "Travel" },
    { id: "Thể thao", name: "Sports" },
    { id: "Nghệ thuật", name: "Arts" },
  ]

  const filteredAIs = aiAssistants.filter(ai => {
    const matchesSearch = ai.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ai.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ai.field.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || ai.field === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectAI = (ai: AICharacter) => {
    
    // Check if we're trying to select and already at max limit (10)
    if (!selectedAIs.includes(ai.id) && selectedAIs.length >= 10) {
      return
    }
    
    // Prioritize multi-select toggle over single select
    if (onToggleAI) {
      onToggleAI(ai.id)
    } else if (onSelectAI) {
      // Only call single select callback if toggle is not available
      onSelectAI(ai)
    }
  }

  const handleStartChat = () => {
    if (onStartChat && selectedAIs.length > 0) {
      onStartChat(selectedAIs)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm mx-4 h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/20 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Select AI
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 pb-2">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap text-xs h-7 px-2 flex-shrink-0"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* AI List */}
          <div className="flex-1 overflow-y-auto px-4">
            {loading ? (
              <div className="space-y-3 py-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  Could not load AI list
                </div>
              </div>
            ) : filteredAIs.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  No matching AI found
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <AnimatePresence>
                  {filteredAIs.map((ai) => {
                    const isSelected = selectedAIs.includes(ai.id)
                    const isMaxReached = selectedAIs.length >= 10 && !isSelected
                    return (
                      <motion.div
                        key={ai.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleSelectAI(ai)}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-200 dark:ring-orange-800 cursor-pointer'
                            : isMaxReached
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-orange-500 border-orange-500' 
                              : isMaxReached
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>

                        <div className="relative flex-shrink-0">
                          <OptimizedAIAvatar
                            src={ai.avatar}
                            alt={ai.name}
                            size={40}
                            fallbackText={ai.name.charAt(0)}
                            online={ai.online}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {ai.name}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className="text-[10px] px-1 py-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 truncate max-w-16"
                            >
                              {ai.field.length > 6 ? ai.field.substring(0, 6) + '...' : ai.field}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {ai.role}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            {selectedAIs.length >= 10 && (
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-2 text-center">
                Maximum of 10 AI assistants reached
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {selectedAIs.length}/10 AI selected
              </div>
              <Button
                onClick={handleStartChat}
                disabled={selectedAIs.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 h-8"
              >
                Start Chat ({selectedAIs.length})
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
