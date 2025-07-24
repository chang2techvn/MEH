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

interface LearningStatsSidebarProps {
  darkMode: boolean;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
}

interface Goal {
  id: string;
  title: string;
  category: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

// Learning stats data
const learningStats = {
  vocabulary: 75,
  grammar: 68,
  speaking: 82,
  listening: 71
};

// Recent vocabulary data
const recentVocabulary = [
  { term: "Conference", meaning: "hội nghị", pronunciation: "ˈkɒnfərəns", count: 4 },
  { term: "Presentation", meaning: "bài thuyết trình", pronunciation: "ˌprezənˈteɪʃən", count: 3 },
  { term: "Achievement", meaning: "thành tựu", pronunciation: "əˈtʃiːvmənt", count: 2 },
  { term: "Opportunity", meaning: "cơ hội", pronunciation: "ˌɒpəˈtjuːnɪti", count: 5 },
  { term: "Development", meaning: "phát triển", pronunciation: "dɪˈveləpmənt", count: 7 }
];

export const LearningStatsSidebar: React.FC<LearningStatsSidebarProps> = ({ 
  darkMode, 
  collapsed, 
  onCollapseToggle 
}) => {
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Học 10 từ vựng mới mỗi ngày',
      category: 'vocabulary',
      target: 10,
      current: 8,
      unit: 'từ',
      deadline: '2025-06-30',
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Luyện nói 30 phút mỗi ngày',
      category: 'speaking',
      target: 30,
      current: 30,
      unit: 'phút',
      deadline: '2025-06-30',
      priority: 'medium',
      completed: true
    },
    {
      id: '3',
      title: 'Hoàn thành 5 bài tập ngữ pháp',
      category: 'grammar',
      target: 5,
      current: 2,
      unit: 'bài',
      deadline: '2025-06-25',
      priority: 'medium',
      completed: false
    }
  ]);

  const handleSaveGoal = (newGoalData: Omit<Goal, 'id' | 'current' | 'completed'>) => {
    const newGoal: Goal = {
      ...newGoalData,
      id: Date.now().toString(),
      current: 0,
      completed: false
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const toggleGoalCompletion = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: !goal.completed, current: goal.completed ? 0 : goal.target }
        : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getCategoryIcon = (category: Goal['category']) => {
    const icons = {
      vocabulary: 'fa-book',
      grammar: 'fa-language',
      speaking: 'fa-microphone',
      listening: 'fa-headphones',
      reading: 'fa-book-open',
      writing: 'fa-pen'
    };
    return icons[category] || 'fa-book';
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[priority];
  };

  return (
    <div className="relative h-full">
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
          <div className={`flex-1 overflow-y-auto scrollbar-auto-hide`}>
          <div className="p-4 pb-8">

            
            {/* Recent Vocabulary Section */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700' : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100'} mb-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base flex items-center">
                  <i className="fas fa-book-open mr-2 text-orange-500"></i>
                  Recent Vocabulary
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 rounded-lg text-xs transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-orange-400' : 'hover:bg-orange-100 text-gray-500 hover:text-orange-600'}`}
                >
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
              <div className={`max-h-64 overflow-y-auto pr-2 scrollbar-auto-hide`}>
                <div className="space-y-3">
                  {recentVocabulary.map((word, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex items-center justify-between shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">{word.term}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono mb-1`}>
                          [{word.pronunciation}]
                        </div>
                        <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>{word.meaning}</div>
                      </div>
                      <div className="ml-3 flex flex-col items-end gap-1">
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs">
                          {word.count}x
                        </Badge>
                        <button 
                          className={`text-xs ${darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-600'} transition-colors duration-200`}
                          title="Phát âm"
                        >
                          <i className="fas fa-volume-up"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                variant="ghost" 
                className={`w-full mt-3 text-sm rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 hover:text-orange-400' : 'hover:bg-orange-100 hover:text-orange-600'} transform hover:scale-[1.02]`}
                onClick={() => setIsVocabularyModalOpen(true)}
              >
                <i className="fas fa-eye mr-2"></i>
                View All Vocabulary
              </Button>
            </div>

            
            {/* Goals Section */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700' : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100'} mb-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base flex items-center">
                  <i className="fas fa-flag mr-2 text-amber-500"></i>
                  Learning Goals
                  <Badge className="ml-2 bg-amber-100 text-amber-800 text-xs">
                    {goals.filter(g => g.completed).length}/{goals.length}
                  </Badge>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGoalModalOpen(true)}
                  className={`h-7 w-7 rounded-lg text-xs transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' : 'hover:bg-amber-100 text-gray-500 hover:text-amber-600'}`}
                >
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-auto-hide">
                {goals.map((goal) => (
                  <div 
                    key={goal.id}
                    className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      goal.completed 
                        ? `${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} opacity-75`
                        : `${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <button 
                          onClick={() => toggleGoalCompletion(goal.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200 hover:scale-110 ${
                            goal.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : `${darkMode ? 'border-gray-500 hover:border-green-400' : 'border-gray-300 hover:border-green-500'}`
                          }`}
                        >
                          {goal.completed && <i className="fas fa-check text-xs"></i>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${goal.completed ? 'line-through opacity-75' : ''}`}>
                            {goal.title}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${getCategoryIcon(goal.category) === 'fa-book' ? 'from-blue-500 to-indigo-500' : getCategoryIcon(goal.category) === 'fa-language' ? 'from-blue-500 to-indigo-500' : getCategoryIcon(goal.category) === 'fa-microphone' ? 'from-orange-500 to-red-500' : 'from-purple-500 to-pink-500'} flex items-center justify-center`}>
                              <i className={`fas ${getCategoryIcon(goal.category)} text-white text-xs`}></i>
                            </div>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {goal.current}/{goal.target} {goal.unit}
                            </span>
                            <i className={`fas fa-flag text-xs ${getPriorityColor(goal.priority)}`}></i>
                          </div>
                          <div className={`w-full h-1.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full mt-2`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                goal.completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                              }`}
                              style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal(goal.id)}
                        className={`!rounded-button p-2 transition-all duration-200 hover:bg-red-500/10 ${darkMode ? 'text-gray-300 hover:text-red-500' : 'text-gray-600 hover:text-red-600'}`}
                        title="Xóa mục tiêu"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className={`w-full mt-3 text-sm rounded-xl transition-all duration-200 group ${darkMode ? 'hover:bg-gray-700 hover:text-amber-400' : 'hover:bg-amber-100 hover:text-amber-700'} transform hover:scale-[1.02]`}
                onClick={() => setIsGoalModalOpen(true)}
              >
                <i className="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
                Add Goal
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Footer */}
        {!collapsed && (
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white !rounded-button whitespace-nowrap cursor-pointer shadow-md transform hover:scale-105 transition-all duration-300"
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
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-lg transition-all duration-300 hover:scale-110 ${
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

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        darkMode={darkMode}
        onSave={handleSaveGoal}
      />
    </div>
  );
};
