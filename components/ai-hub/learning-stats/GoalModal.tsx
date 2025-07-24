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
  category: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSave?: (goal: Omit<Goal, 'id' | 'current' | 'completed'>) => void;
}

const goalCategories = [
  { value: 'vocabulary', label: 'Từ vựng', icon: 'fa-book', color: 'from-orange-500 to-orange-600' },
  { value: 'grammar', label: 'Ngữ pháp', icon: 'fa-language', color: 'from-orange-500 to-orange-600' },
  { value: 'speaking', label: 'Nói', icon: 'fa-microphone', color: 'from-orange-500 to-red-500' },
  { value: 'listening', label: 'Nghe', icon: 'fa-headphones', color: 'from-purple-500 to-pink-500' },
  { value: 'reading', label: 'Đọc', icon: 'fa-book-open', color: 'from-indigo-500 to-purple-500' },
  { value: 'writing', label: 'Viết', icon: 'fa-pen', color: 'from-pink-500 to-rose-500' }
];

const priorities = [
  { value: 'low', label: 'Thấp', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'medium', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'high', label: 'Cao', color: 'bg-red-100 text-red-700 border-red-200' }
];

const units = [
  { value: 'từ', label: 'từ vựng' },
  { value: 'phút', label: 'phút' },
  { value: 'bài', label: 'bài tập' },
  { value: 'trang', label: 'trang' },
  { value: 'câu', label: 'câu' },
  { value: 'lần', label: 'lần' }
];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, darkMode, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'vocabulary' as Goal['category'],
    target: '',
    unit: 'từ',
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
        unit: 'từ',
        deadline: '',
        priority: 'medium'
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề mục tiêu';
    }

    if (!formData.target || parseInt(formData.target) <= 0) {
      newErrors.target = 'Vui lòng nhập số lượng mục tiêu hợp lệ';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Vui lòng chọn thời hạn';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.deadline = 'Thời hạn phải sau ngày hôm nay';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newGoal = {
      title: formData.title,
      category: formData.category,
      target: parseInt(formData.target),
      unit: formData.unit,
      deadline: formData.deadline,
      priority: formData.priority
    };

    onSave?.(newGoal);
    setIsSubmitting(false);
    onClose();
  };

  const getCategoryInfo = (category: string) => {
    return goalCategories.find(cat => cat.value === category) || goalCategories[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 transform transition-all duration-300 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      } rounded-2xl shadow-2xl overflow-hidden`}>
        
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-90" />
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-target text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Thêm mục tiêu mới</h2>
                  <p className="text-white/80 text-sm">Tạo mục tiêu học tập của bạn</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 transition-all duration-200 hover:scale-110"
              >
                <i className="fas fa-times text-lg"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <i className="fas fa-edit mr-2 text-orange-500"></i>
              Tiêu đề mục tiêu
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: Học 50 từ vựng mới"
              className={`${darkMode ? 'bg-gray-700 border-gray-600' : ''} transition-all duration-200 ${errors.title ? 'border-red-500 shake' : ''}`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs animate-in fade-in-0 slide-in-from-top-1">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.title}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <i className="fas fa-layer-group mr-2 text-purple-500"></i>
              Loại mục tiêu
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'} transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${getCategoryInfo(formData.category).color} flex items-center justify-center mr-3`}>
                      <i className={`fas ${getCategoryInfo(formData.category).icon} text-white text-xs`}></i>
                    </div>
                    {getCategoryInfo(formData.category).label}
                  </div>
                  <i className="fas fa-chevron-down text-sm"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`w-64 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                {goalCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.value}
                    onClick={() => setFormData({ ...formData, category: category.value as Goal['category'] })}
                    className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${darkMode ? 'hover:bg-gray-600' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mr-3`}>
                      <i className={`fas ${category.icon} text-white text-xs`}></i>
                    </div>
                    {category.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Target and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <i className="fas fa-bullseye mr-2 text-orange-500"></i>
                Số lượng
              </label>
              <Input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="50"
                min="1"
                className={`${darkMode ? 'bg-gray-700 border-gray-600' : ''} transition-all duration-200 ${errors.target ? 'border-red-500 shake' : ''}`}
              />
              {errors.target && (
                <p className="text-red-500 text-xs animate-in fade-in-0 slide-in-from-top-1">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.target}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <i className="fas fa-ruler mr-2 text-orange-500"></i>
                Đơn vị
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'} transition-all duration-200`}
                  >
                    {formData.unit}
                    <i className="fas fa-chevron-down text-sm"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
                  {units.map((unit) => (
                    <DropdownMenuItem
                      key={unit.value}
                      onClick={() => setFormData({ ...formData, unit: unit.value })}
                      className={`cursor-pointer ${darkMode ? 'hover:bg-gray-600' : ''}`}
                    >
                      {unit.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <i className="fas fa-calendar-alt mr-2 text-red-500"></i>
              Thời hạn
            </label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`${darkMode ? 'bg-gray-700 border-gray-600' : ''} transition-all duration-200 ${errors.deadline ? 'border-red-500 shake' : ''}`}
            />
            {errors.deadline && (
              <p className="text-red-500 text-xs animate-in fade-in-0 slide-in-from-top-1">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.deadline}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <i className="fas fa-flag mr-2 text-yellow-500"></i>
              Độ ưu tiên
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value as Goal['priority'] })}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    formData.priority === priority.value
                      ? `${priority.color} border-current shadow-lg transform scale-105`
                      : `${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">{priority.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'} transition-all duration-200`}
              disabled={isSubmitting}
            >
              <i className="fas fa-times mr-2"></i>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Tạo mục tiêu
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
