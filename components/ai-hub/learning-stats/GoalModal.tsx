import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'vocabulary';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSave?: (goal: Omit<Goal, 'id' | 'current' | 'completed' | 'created_at' | 'updated_at' | 'completed_at'>) => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-300', darkColor: 'bg-gray-700 text-gray-300 border-gray-600', icon: 'fa-flag' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-300', darkColor: 'bg-amber-900/30 text-amber-400 border-amber-600', icon: 'fa-flag' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-300', darkColor: 'bg-red-900/30 text-red-400 border-red-600', icon: 'fa-flag' }
];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, darkMode, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'vocabulary' as Goal['category'],
    target: '',
    unit: 'words',
    deadline: '',
    priority: 'medium' as Goal['priority']
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        category: 'vocabulary',
        target: '',
        unit: 'words',
        deadline: '',
        priority: 'medium'
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleKeyPress = (e: React.KeyboardEvent, field: 'title' | 'target' | 'deadline') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (field === 'title' && formData.title.trim()) {
        // Move to target input
        const targetInput = document.getElementById('target-input') as HTMLInputElement;
        targetInput?.focus();
      } else if (field === 'target' && formData.target.trim()) {
        // Move to deadline input
        const deadlineInput = document.getElementById('deadline-input') as HTMLInputElement;
        deadlineInput?.focus();
      } else if (field === 'deadline' && formData.deadline) {
        // Submit form if all fields are filled
        if (formData.title.trim() && formData.target && formData.deadline) {
          handleSubmit(e as any);
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a goal title';
    }

    if (!formData.target || parseInt(formData.target) <= 0) {
      newErrors.target = 'Please enter a valid target number';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Please select a deadline';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.deadline = 'Deadline must be after today';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed with errors:', errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newGoal = {
        title: formData.title,
        category: formData.category,
        target: parseInt(formData.target),
        unit: formData.unit,
        deadline: formData.deadline,
        priority: formData.priority
      };

      console.log('Creating goal:', newGoal);
      await onSave?.(newGoal);
      console.log('Goal created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
      setErrors({ general: 'Failed to create goal. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg transform transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        
        {/* Header - Updated with neo-mint theme */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-neo-mint/5 to-purist-blue/5'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neo-mint to-purist-blue flex items-center justify-center shadow-lg">
                <i className="fas fa-flag text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">
                  New Learning Goal
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Set your vocabulary learning target
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`h-9 w-9 rounded-xl transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-neo-mint/10 text-gray-500 hover:text-neo-mint'
              }`}
            >
              <i className="fas fa-times text-lg"></i>
            </Button>
          </div>
        </div>

        {/* Form - Simplified */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <i className="fas fa-lightbulb mr-2 text-orange-500"></i>
              What do you want to achieve?
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onKeyPress={(e) => handleKeyPress(e, 'title')}
              placeholder="e.g., Learn 50 new words this week"
              className={`${
                darkMode ? 'bg-gray-800 border-gray-600' : 'border-gray-300'
              } transition-all duration-200 ${
                errors.title ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm animate-in fade-in duration-200 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.title}
              </p>
            )}
          </div>

          {/* Target Amount - Updated with orange theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <i className="fas fa-bullseye mr-2 text-orange-500"></i>
              How many words?
            </label>
            <div className="relative">
              <Input
                id="target-input"
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, 'target')}
                placeholder="50"
                min="1"
                max="10000"
                className={`pr-16 ${
                  darkMode ? 'bg-gray-800 border-gray-600' : 'border-gray-300'
                } transition-all duration-200 ${
                  errors.target ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center">
                <i className="fas fa-book mr-1 text-xs"></i>
                words
              </div>
            </div>
            {errors.target && (
              <p className="text-red-500 text-sm animate-in fade-in duration-200 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.target}
              </p>
            )}
          </div>

          {/* Deadline - Updated with inline time selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <i className="fas fa-calendar-alt mr-2 text-orange-500"></i>
                Deadline
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={formData.deadline === new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })}
                  className="text-xs px-3 py-1 h-7"
                >
                  1 Week
                </Button>
                <Button
                  type="button"
                  variant={formData.deadline === new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })}
                  className="text-xs px-3 py-1 h-7"
                >
                  1 Month
                </Button>
                <Button
                  type="button"
                  variant={formData.deadline === new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })}
                  className="text-xs px-3 py-1 h-7"
                >
                  3 Months
                </Button>
              </div>
            </div>
            {formData.deadline && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected deadline: {new Date(formData.deadline).toLocaleDateString()}
              </p>
            )}
            {errors.deadline && (
              <p className="text-red-500 text-sm animate-in fade-in duration-200 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.deadline}
              </p>
            )}
          </div>

          {/* Priority - Updated with icons and orange theme */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <i className="fas fa-flag mr-2 text-orange-500"></i>
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value as Goal['priority'] })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    formData.priority === priority.value
                      ? `${darkMode ? priority.darkColor : priority.color} border-opacity-100 shadow-md`
                      : `${darkMode ? 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <i className={`fas ${priority.icon} text-xs`}></i>
                  <span>{priority.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions - Updated with orange theme */}
          <div className={`pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex gap-3`}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${
                darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-orange-200 hover:bg-orange-100 text-gray-700'
              } transition-all duration-200`}
              disabled={isSubmitting}
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.target || !formData.deadline}
              className="flex-1 bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
