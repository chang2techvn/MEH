import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LearningGoal } from '@/hooks/use-learning-goals';

interface GoalsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  goals: LearningGoal[];
  onCreateNew: () => void;
  onGoalClick: (goal: LearningGoal) => void;
}

export const GoalsListModal: React.FC<GoalsListModalProps> = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  goals,
  onCreateNew,
  onGoalClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'completed' && goal.current >= goal.target) ||
                           (filterStatus === 'active' && goal.current < goal.target);
      
      const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [goals, searchTerm, filterStatus, filterPriority]);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl h-[85vh] transform transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <i className="fas fa-flag text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Learning Goals</h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                  Manage and track your learning objectives
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-4 py-2 font-medium shadow-lg transition-all duration-200"
              >
                <i className="fas fa-plus mr-2"></i>
                Add New Goal
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={`h-9 w-9 rounded-full ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-orange-100 text-gray-500 hover:text-orange-600'
                } transition-all duration-200`}
              >
                <i className="fas fa-times text-lg"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex-shrink-0`}>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <i className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}></i>
                <Input
                  placeholder="Search goals by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 rounded-xl border ${
                    darkMode ? 'bg-gray-800 border-gray-600 focus:border-orange-500' : 'border-gray-300 focus:border-orange-500'
                  } focus:ring-2 focus:ring-orange-500/20 transition-all duration-200`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`min-w-[120px] justify-between rounded-full ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-filter mr-2 text-sm"></i>
                    {filterStatus === 'all' ? 'All Status' : 
                     filterStatus === 'active' ? 'Active' : 'Completed'}
                  </div>
                  <i className="fas fa-chevron-down text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('all')}
                  className={`cursor-pointer ${filterStatus === 'all' ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('active')}
                  className={`cursor-pointer ${filterStatus === 'active' ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('completed')}
                  className={`cursor-pointer ${filterStatus === 'completed' ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className={`min-w-[120px] justify-between rounded-full ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-flag mr-2 text-sm"></i>
                    {filterPriority === 'all' ? 'All Priority' :
                     filterPriority === 'high' ? 'High Priority' :
                     filterPriority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                  </div>
                  <i className="fas fa-chevron-down text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <DropdownMenuItem
                  onClick={() => setFilterPriority('all')}
                  className={`cursor-pointer ${filterPriority === 'all' ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  All Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterPriority('high')}
                  className={`cursor-pointer ${filterPriority === 'high' ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  High Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterPriority('medium')}
                  className={`cursor-pointer ${filterPriority === 'medium' ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterPriority('low')}
                  className={`cursor-pointer ${filterPriority === 'low' ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  Low Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-orange-100 text-orange-800 px-2 py-1 text-xs">
              Total: {goals.length}
            </Badge>
            <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs">
              Completed: {goals.filter(g => g.current >= g.target).length}
            </Badge>
            <Badge className="bg-amber-100 text-amber-800 px-2 py-1 text-xs">
              Active: {goals.filter(g => g.current < g.target).length}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-xs">
              Filtered: {filteredGoals.length}
            </Badge>
          </div>
        </div>

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          {filteredGoals.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <i className="fas fa-search text-3xl mb-3 opacity-50"></i>
              <h3 className="text-lg font-medium mb-2">
                {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
              </h3>
              <p className="text-sm mb-6">
                {goals.length === 0 
                  ? 'Create your first learning goal to get started!' 
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {goals.length === 0 && (
                <Button
                  onClick={onCreateNew}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-6 py-3 font-medium shadow-lg transition-all duration-200"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Your First Goal
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredGoals.map((goal) => {
                const isCompleted = goal.current >= goal.target;
                const progressPercent = Math.min((goal.current / goal.target) * 100, 100);
                
                return (
                  <div 
                    key={goal.id}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isCompleted 
                        ? `${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} opacity-95`
                        : `${darkMode ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`
                    }`}
                    onClick={() => onGoalClick(goal)}
                  >
                    {/* Goal Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : `${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                        }`}>
                          {isCompleted && <i className="fas fa-check text-xs"></i>}
                        </div>
                        <h3 className={`font-semibold text-sm truncate ${isCompleted ? 'line-through opacity-75' : ''}`}>
                          {goal.title}
                        </h3>
                      </div>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800 text-xs ml-2 flex-shrink-0">
                          Done
                        </Badge>
                      )}
                    </div>

                    {/* Goal Description */}
                    {goal.description && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3 line-clamp-2`}>
                        {goal.description}
                      </p>
                    )}

                    {/* Goal Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                          <i className="fas fa-book text-white text-xs"></i>
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getPriorityBadgeColor(goal.priority)}`}>
                          <i className={`fas fa-flag text-xs mr-1 ${getPriorityColor(goal.priority)}`}></i>
                          {goal.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className={`w-full h-1.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden mb-2`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      {Math.round(progressPercent)}% completed
                    </p>

                    {/* Goal Footer */}
                    <div className={`flex items-center justify-between mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Created {new Date(goal.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      {goal.deadline && (
                        <div className={`text-xs ${
                          new Date(goal.deadline) < new Date() && !isCompleted
                            ? 'text-red-500 font-medium'
                            : darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Due {new Date(goal.deadline).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
