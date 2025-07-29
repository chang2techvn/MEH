import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VocabularyModal } from './VocabularyModal';
import { GoalModal } from './GoalModal';
import { GoalProgressModal } from './GoalProgressModal';
import { GoalsListModal } from './GoalsListModal';
import { useLearningGoals, useVocabulary, useStudyStreaks, LearningGoal } from '@/hooks/use-learning-goals';
import { Skeleton } from '@/components/ui/skeleton';

interface LearningStatsSidebarProps {
  darkMode: boolean;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
}

export const LearningStatsSidebar: React.FC<LearningStatsSidebarProps> = ({ 
  darkMode, 
  collapsed, 
  onCollapseToggle 
}) => {
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isGoalsListModalOpen, setIsGoalsListModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  
  // Use real database hooks
  const { goals, loading: goalsLoading, createGoal, updateGoalProgress } = useLearningGoals();
  const { recentVocabulary, loading: vocabLoading } = useVocabulary();
  const { streaks, loading: streaksLoading } = useStudyStreaks();

  const handleProgressUpdate = async (goalId: string, progressData: any) => {
    await updateGoalProgress(goalId, progressData);
    setIsProgressModalOpen(false);
    setSelectedGoal(null);
  };

  const handleGoalClick = (goal: LearningGoal) => {
    if (goal.current < goal.target) {
      setSelectedGoal(goal);
      setIsProgressModalOpen(true);
    }
  };

  const handleSaveGoal = async (newGoalData: any) => {
    await createGoal(newGoalData);
    setIsGoalModalOpen(false);
    // Goals sẽ được tự động cập nhật thông qua hook
  };

  const handleCreateNewGoal = () => {
    // Không tắt GoalsListModal, chỉ mở GoalModal
    setIsGoalModalOpen(true);
  };

  const handleGoalClickFromList = (goal: LearningGoal) => {
    setIsGoalsListModalOpen(false);
    if (goal.current < goal.target) {
      setSelectedGoal(goal);
      setIsProgressModalOpen(true);
    }
  };

  const getCategoryIcon = () => 'fa-book';

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  return (
    <div className="relative h-full">
      <style jsx>{`
        .smooth-container {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .translate3d-0 {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
      `}</style>
      {/* Sidebar Container */}
      <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'w-0' : 'w-80'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${collapsed ? '' : 'border-l'} flex flex-col h-full overflow-hidden`}
        style={{ minHeight: '100vh' }}
      >
        {/* Header */}
        <div className={`px-4 py-4 h-16 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-center`}>
          {!collapsed && (
            <>
              <h2 className="font-semibold text-lg flex-1  bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">Learning Statistics</h2>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-orange-400' : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'}`}
              >
                <i className="fas fa-sync-alt text-sm"></i>
              </Button>
            </>
          )}
        </div>
        
        {!collapsed && (
          <div className={`flex-1 overflow-y-auto scrollbar-auto-hide smooth-container`}
            style={{
              contain: 'layout style',
              willChange: 'scroll-position'
            }}
          >
          <div className="p-3 pb-6">

            
            {/* Recent Vocabulary Section */}
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700' : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100'} mb-3 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm flex items-center">
                  <i className="fas fa-book-open mr-2 text-orange-500"></i>
                  Recent Vocabulary
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 rounded-lg text-xs transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-orange-400' : 'hover:bg-orange-100 text-gray-500 hover:text-orange-600'}`}
                >
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
              <div className={`max-h-64 overflow-y-auto pr-1 scrollbar-auto-hide smooth-container`}
                style={{
                  contain: 'layout style paint',
                  willChange: 'scroll-position'
                }}
              >
                {vocabLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : recentVocabulary.length === 0 ? (
                  <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <i className="fas fa-book-open text-xl mb-2 opacity-50"></i>
                    <p className="text-xs">No vocabulary entries yet</p>
                    <p className="text-xs mt-1 opacity-75">Start learning to see your progress!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentVocabulary.map((word) => (
                      <div 
                        key={word.id} 
                        className={`p-2.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex items-center justify-between shadow-sm transition-colors duration-150 transform translate3d-0`}
                        style={{
                          contain: 'layout style paint',
                          backfaceVisibility: 'hidden'
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{word.term}</div>
                          {word.pronunciation && (
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono mb-0.5`}>
                              [{word.pronunciation}]
                            </div>
                          )}
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>{word.meaning}</div>
                        </div>
                        <div className="ml-2 flex flex-col items-end gap-0.5">
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs px-1.5 py-0.5">
                            {word.usage_count}x
                          </Badge>
                          <button 
                            className={`text-xs ${darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-600'} transition-colors duration-150 p-0.5`}
                            title="Phát âm"
                          >
                            <i className="fas fa-volume-up"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                className={`w-full mt-2 text-xs rounded-xl transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700 hover:text-orange-400' : 'hover:bg-orange-100 hover:text-orange-600'}`}
                onClick={() => setIsVocabularyModalOpen(true)}
              >
                <i className="fas fa-eye mr-2"></i>
                View All Vocabulary
              </Button>
            </div>

            
            {/* Goals Section */}
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700' : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100'} mb-3 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm flex items-center">
                  <i className="fas fa-flag mr-2 text-amber-500"></i>
                  Learning Goals
                  <Badge className="ml-2 bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5">
                    {goals.filter(g => g.current >= g.target).length}/{goals.length}
                  </Badge>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGoalModalOpen(true)}
                  className={`h-6 w-6 rounded-lg text-xs transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' : 'hover:bg-amber-100 text-gray-500 hover:text-amber-600'}`}
                >
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-auto-hide smooth-container pb-3"
                style={{
                  contain: 'layout style paint',
                  willChange: 'scroll-position'
                }}
              >
                {goalsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className={`p-2.5 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1">
                            <Skeleton className="w-4 h-4 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-3 w-3/4 mb-1" />
                              <Skeleton className="h-2 w-1/2 mb-1" />
                              <Skeleton className="h-1 w-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : goals.length === 0 ? (
                  <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <i className="fas fa-flag text-xl mb-2 opacity-50"></i>
                    <p className="text-xs">No learning goals yet</p>
                    <p className="text-xs mt-1 opacity-75">Create your first goal to get started!</p>
                  </div>
                ) : (
                  goals.map((goal) => {
                    const isCompleted = goal.current >= goal.target;
                    
                    return (
                      <div 
                        key={goal.id}
                        className={`p-2.5 rounded-lg border transition-colors duration-150 cursor-pointer transform translate3d-0 ${
                          isCompleted 
                            ? `${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} opacity-90`
                            : `${darkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`
                        }`}
                        onClick={() => handleGoalClick(goal)}
                        style={{
                          contain: 'layout style paint',
                          backfaceVisibility: 'hidden'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1">
                            {/* Status Icon */}
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors duration-150 ${
                              isCompleted 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : `${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                            }`}>
                              {isCompleted && <i className="fas fa-check text-xs"></i>}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-xs flex items-center ${isCompleted ? 'line-through opacity-75' : ''}`}>
                                {goal.title}
                                {isCompleted && (
                                  <Badge className="ml-1 bg-green-100 text-green-800 text-xs px-1 py-0">
                                    Done
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                                  <i className="fas fa-book text-white text-xs"></i>
                                </div>
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {goal.current}/{goal.target} {goal.unit}
                                </span>
                                <i className={`fas fa-flag text-xs ${getPriorityColor(goal.priority)}`}></i>
                              </div>
                              <div className={`w-full h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full mt-1.5`}>
                                <div 
                                  className={`h-full rounded-full transition-all duration-200 ${
                                    isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                  }`}
                                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <Button 
                variant="ghost" 
                className={`w-full mt-2 text-xs rounded-xl transition-colors duration-150 group ${darkMode ? 'hover:bg-gray-700 hover:text-amber-400' : 'hover:bg-amber-100 hover:text-amber-700'}`}
                onClick={() => setIsGoalsListModalOpen(true)}
              >
                <i className="fas fa-eye mr-2 transition-transform duration-150"></i>
                View All Goals
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Footer */}
        {!collapsed && (
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white !rounded-button whitespace-nowrap cursor-pointer shadow-md transition-all duration-300"
            >
              <i className="fas fa-chart-line mr-2"></i>
              Xem báo cáo chi tiết
            </Button>
          </div>
        )}
      </div>

      {/* Toggle Button - Fixed at center */}
      {onCollapseToggle && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-[5] hidden xl:block pointer-events-none transition-all duration-300 ${collapsed ? '-left-8' : '-left-3'}`}>
          <div className="pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onCollapseToggle}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-lg transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-800/90 border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'bg-white/90 border-gray-300 hover:bg-gray-50 text-gray-600'
                    } backdrop-blur-sm hover:border-orange-400 hover:text-orange-500`}
                  >
                    <i className={`fas fa-chevron-${collapsed ? 'left' : 'right'} text-xs transition-transform duration-300`}></i>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Modals */}
      <VocabularyModal
        isOpen={isVocabularyModalOpen}
        onClose={() => setIsVocabularyModalOpen(false)}
        darkMode={darkMode}
      />

      <GoalsListModal
        isOpen={isGoalsListModalOpen}
        onClose={() => setIsGoalsListModalOpen(false)}
        darkMode={darkMode}
        goals={goals}
        onCreateNew={handleCreateNewGoal}
        onGoalClick={handleGoalClickFromList}
      />

      {/* GoalModal should render after GoalsListModal to appear on top */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        darkMode={darkMode}
        onSave={handleSaveGoal}
      />

      {selectedGoal && (
        <GoalProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedGoal(null);
          }}
          goal={selectedGoal}
          darkMode={darkMode}
          onProgress={handleProgressUpdate}
        />
      )}
    </div>
  );
};
