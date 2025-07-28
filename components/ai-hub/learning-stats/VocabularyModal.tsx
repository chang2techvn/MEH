import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVocabulary, VocabularyEntry } from '@/hooks/use-learning-goals';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({ isOpen, onClose, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('created_at');

  // Use real database data
  const { vocabulary, loading, error, fetchVocabulary } = useVocabulary();

  // Fetch all vocabulary when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVocabulary(); // Fetch all vocabulary (no limit)
    }
  }, [isOpen]);

  // Get unique categories from real data
  const categories = ['Tất cả', ...Array.from(new Set(vocabulary.map(word => word.category)))];
  
  const sortOptions = [
    { value: 'created_at', label: 'Ngày thêm' },
    { value: 'usage_count', label: 'Tần suất sử dụng' },
    { value: 'term', label: 'Thứ tự ABC' },
    { value: 'mastery_level', label: 'Độ thành thạo' }
  ];

  const filteredVocabulary = vocabulary
    .filter(word => 
      (selectedCategory === 'Tất cả' || word.category === selectedCategory) &&
      (word.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
       word.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage_count':
          return b.usage_count - a.usage_count;
        case 'term':
          return a.term.localeCompare(b.term);
        case 'mastery_level':
          return b.mastery_level - a.mastery_level;
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getMasteryColor = (masteryLevel: number) => {
    if (masteryLevel <= 1) return 'bg-red-100 text-red-800 border-red-200';
    if (masteryLevel <= 2) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (masteryLevel <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (masteryLevel <= 4) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getMasteryLabel = (masteryLevel: number) => {
    if (masteryLevel <= 1) return 'Mới học';
    if (masteryLevel <= 2) return 'Cơ bản';
    if (masteryLevel <= 3) return 'Trung bình';
    if (masteryLevel <= 4) return 'Khá';
    return 'Thành thạo';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-6xl mx-4 h-[80vh] ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 animate-fadeIn flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between flex-shrink-0`}>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Kho từ vựng của bạn
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              Tổng cộng {vocabulary.length} từ vựng
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`h-10 w-10 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-200 hover:scale-110`}
          >
            <i className="fas fa-times text-lg"></i>
          </Button>
        </div>

        {/* Controls */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-4 flex-shrink-0`}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Input
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} transition-all duration-200`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`min-w-[140px] justify-between ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-filter mr-2 text-sm"></i>
                    {selectedCategory}
                  </div>
                  <i className="fas fa-chevron-down text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`cursor-pointer ${selectedCategory === category ? 'bg-orange-50 text-orange-600' : ''}`}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className={`min-w-[140px] justify-between ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-sort mr-2 text-sm"></i>
                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                  </div>
                  <i className="fas fa-chevron-down text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`cursor-pointer ${sortBy === option.value ? 'bg-orange-50 text-orange-600' : ''}`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Vocabulary Grid - Scrollable Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 scrollbar-auto-hide">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-8" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-16 w-full mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className={`text-6xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  Lỗi tải dữ liệu
                </h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-4`}>
                  {error}
                </p>
                <Button onClick={() => fetchVocabulary()} variant="outline">
                  <i className="fas fa-redo mr-2"></i>
                  Thử lại
                </Button>
              </div>
            ) : vocabulary.length === 0 ? (
              <div className="text-center py-12">
                <div className={`text-6xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                  <i className="fas fa-book-open"></i>
                </div>
                <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  Chưa có từ vựng nào
                </h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Bắt đầu học để xây dựng kho từ vựng của bạn!
                </p>
              </div>
            ) : filteredVocabulary.length === 0 ? (
              <div className="text-center py-12">
                <div className={`text-6xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                  <i className="fas fa-search"></i>
                </div>
                <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  Không tìm thấy từ vựng
                </h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVocabulary.map((word, index) => (
                  <div
                    key={word.id}
                    className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn group cursor-pointer`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-green-600 transition-colors duration-200">
                          {word.term}
                        </h3>
                        {word.pronunciation && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
                            [{word.pronunciation}]
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
                          {word.usage_count}x
                        </Badge>
                        <Badge className={`text-xs border ${getMasteryColor(word.mastery_level)}`}>
                          {getMasteryLabel(word.mastery_level)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-medium`}>
                      {word.meaning}
                    </p>
                    
                    {word.example_sentence && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-3`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
                          "{word.example_sentence}"
                        </p>
                        {word.example_translation && (
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                            {word.example_translation}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {word.category}
                        </Badge>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(word.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-green-100 hover:text-green-600 transition-all duration-200 hover:scale-110"
                          title="Phát âm"
                        >
                          <i className="fas fa-volume-up text-sm"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200 hover:scale-110"
                          title="Thêm vào ôn tập"
                        >
                          <i className="fas fa-bookmark text-sm"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className={`${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'} transition-all duration-200`}
            >
              <i className="fas fa-download mr-2"></i>
              Xuất file
            </Button>
            <Button
              variant="outline"
              className={`${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'} transition-all duration-200`}
            >
              <i className="fas fa-upload mr-2"></i>
              Nhập file
            </Button>
          </div>
          <Button
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={onClose}
          >
            <i className="fas fa-check mr-2"></i>
            Hoàn thành
          </Button>
        </div>
      </div>
    </div>
  );
};
