import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VocabularyWord {
  term: string;
  meaning: string;
  pronunciation: string;
  count: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  dateAdded: string;
  example?: string;
}

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({ isOpen, onClose, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('dateAdded');

  // Extended vocabulary data for demo
  const allVocabulary: VocabularyWord[] = [
    { term: "Schedule", meaning: "lên lịch, sắp xếp", pronunciation: "ˈʃɛdjuːl", count: 8, category: "Business", difficulty: "medium", dateAdded: "2025-06-18", example: "I need to schedule a meeting with the team." },
    { term: "Meeting", meaning: "cuộc họp", pronunciation: "ˈmiːtɪŋ", count: 12, category: "Business", difficulty: "easy", dateAdded: "2025-06-17", example: "We have a meeting at 3 PM today." },
    { term: "Deadline", meaning: "thời hạn chót", pronunciation: "ˈdedlaɪn", count: 6, category: "Business", difficulty: "medium", dateAdded: "2025-06-16", example: "The deadline for this project is next Friday." },
    { term: "Presentation", meaning: "bài thuyết trình", pronunciation: "ˌprezənˈteɪʃən", count: 5, category: "Business", difficulty: "hard", dateAdded: "2025-06-15", example: "She gave an excellent presentation yesterday." },
    { term: "Colleague", meaning: "đồng nghiệp", pronunciation: "ˈkɒliːɡ", count: 9, category: "Business", difficulty: "medium", dateAdded: "2025-06-14", example: "My colleague helped me with the report." },
    { term: "Beautiful", meaning: "đẹp, xinh đẹp", pronunciation: "ˈbjuːtɪfəl", count: 15, category: "Daily", difficulty: "easy", dateAdded: "2025-06-13", example: "What a beautiful sunset!" },
    { term: "Adventure", meaning: "cuộc phiêu lưu", pronunciation: "ədˈventʃər", count: 4, category: "Travel", difficulty: "medium", dateAdded: "2025-06-12", example: "Our trip to the mountains was quite an adventure." },
    { term: "Innovation", meaning: "sự đổi mới", pronunciation: "ˌɪnəˈveɪʃən", count: 3, category: "Technology", difficulty: "hard", dateAdded: "2025-06-11", example: "Innovation is key to business success." },
    { term: "Communicate", meaning: "giao tiếp", pronunciation: "kəˈmjuːnɪkeɪt", count: 11, category: "Business", difficulty: "medium", dateAdded: "2025-06-10", example: "It's important to communicate clearly with your team." },
    { term: "Environment", meaning: "môi trường", pronunciation: "ɪnˈvaɪrənmənt", count: 7, category: "Science", difficulty: "medium", dateAdded: "2025-06-09", example: "We need to protect our environment." },
    { term: "Technology", meaning: "công nghệ", pronunciation: "tekˈnɒlədʒi", count: 13, category: "Technology", difficulty: "medium", dateAdded: "2025-06-08", example: "Technology has changed our lives dramatically." },
    { term: "Experience", meaning: "kinh nghiệm", pronunciation: "ɪkˈspɪəriəns", count: 10, category: "Daily", difficulty: "medium", dateAdded: "2025-06-07", example: "This job requires at least 3 years of experience." }
  ];

  const categories = ['Tất cả', 'Business', 'Daily', 'Travel', 'Technology', 'Science'];
  const sortOptions = [
    { value: 'dateAdded', label: 'Ngày thêm' },
    { value: 'count', label: 'Tần suất sử dụng' },
    { value: 'term', label: 'Thứ tự ABC' },
    { value: 'difficulty', label: 'Độ khó' }
  ];

  const filteredVocabulary = allVocabulary
    .filter(word => 
      (selectedCategory === 'Tất cả' || word.category === selectedCategory) &&
      (word.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
       word.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'count':
          return b.count - a.count;
        case 'term':
          return a.term.localeCompare(b.term);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'dateAdded':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
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
              Tổng cộng {filteredVocabulary.length} từ vựng
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVocabulary.map((word, index) => (
                <div
                  key={`${word.term}-${index}`}
                  className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn group cursor-pointer`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-green-600 transition-colors duration-200">
                        {word.term}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
                        [{word.pronunciation}]
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
                        {word.count}x
                      </Badge>
                      <Badge className={`text-xs border ${getDifficultyColor(word.difficulty)}`}>
                        {getDifficultyLabel(word.difficulty)}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-medium`}>
                    {word.meaning}
                  </p>
                  
                  {word.example && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-3`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
                        "{word.example}"
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {word.category}
                      </Badge>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(word.dateAdded).toLocaleDateString('vi-VN')}
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
            
            {filteredVocabulary.length === 0 && (
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
