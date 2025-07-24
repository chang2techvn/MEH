import { AICharacter, ChatHistory, LearningStats, RecentVocabulary, Message } from '@/types/ai-hub.types';

export const aiCharacters: AICharacter[] = [
  {
    id: 'ai1',
    name: 'Emma',
    role: 'Giáo viên tiếng Anh',
    field: 'Giáo dục',
    description: 'Chuyên gia giảng dạy tiếng Anh với hơn 10 năm kinh nghiệm. Giúp bạn cải thiện phát âm, ngữ pháp và giao tiếp tự nhiên.',
    avatar: 'https://readdy.ai/api/search-image?query=A%20professional%20female%20English%20teacher%20with%20glasses%20and%20a%20friendly%20smile%2C%20wearing%20smart%20casual%20attire%2C%20standing%20against%20a%20clean%20light%20blue%20background%20with%20subtle%20educational%20elements%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=ai1&orientation=squarish',
    online: true,
    animation: 'bounce'
  },
  {
    id: 'ai2',
    name: 'Dr. Watson',
    role: 'Bác sĩ',
    field: 'Y tế',
    description: 'Bác sĩ đa khoa với chuyên môn về y học tổng quát. Giúp bạn học từ vựng và giao tiếp trong môi trường y tế.',
    avatar: 'https://readdy.ai/api/search-image?query=A%20professional%20male%20doctor%20with%20a%20stethoscope%2C%20wearing%20a%20white%20coat%2C%20with%20a%20kind%20and%20trustworthy%20expression%2C%20against%20a%20clean%20light%20blue%20medical%20background%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=ai2&orientation=squarish',
    online: true,
    animation: 'pulse'
  },
  {
    id: 'ai3',
    name: 'Alex',
    role: 'Chuyên gia kinh doanh',
    field: 'Kinh doanh',
    description: 'Chuyên gia tư vấn kinh doanh với kinh nghiệm quốc tế. Giúp bạn học từ vựng và giao tiếp trong môi trường doanh nghiệp.',
    avatar: 'https://readdy.ai/api/search-image?query=A%20confident%20business%20professional%20in%20a%20modern%20suit%2C%20with%20a%20smartphone%20in%20hand%2C%20standing%20against%20a%20clean%20light%20blue%20corporate%20background%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=ai3&orientation=squarish',
    online: true,
    animation: 'slide'
  },
  {
    id: 'ai4',
    name: 'Techie Tom',
    role: 'Kỹ sư phần mềm',
    field: 'Công nghệ',
    description: 'Kỹ sư phần mềm với chuyên môn về AI và phát triển web. Giúp bạn học từ vựng công nghệ và IT.',
    avatar: 'https://readdy.ai/api/search-image?query=A%20tech-savvy%20software%20engineer%20with%20glasses%2C%20wearing%20a%20casual%20t-shirt%20with%20tech%20logo%2C%20sitting%20at%20a%20modern%20workspace%20with%20multiple%20screens%2C%20against%20a%20clean%20light%20blue%20tech-inspired%20background%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=ai4&orientation=squarish',
    online: false,
    animation: 'fade'
  },
  {
    id: 'ai5',
    name: 'Chef Maria',
    role: 'Đầu bếp',
    field: 'Ẩm thực',
    description: 'Đầu bếp quốc tế với chuyên môn về ẩm thực Pháp và Ý. Giúp bạn học từ vựng về nấu ăn và ẩm thực.',
    avatar: 'https://readdy.ai/api/search-image?query=A%20professional%20chef%20in%20white%20uniform%20and%20chef%20hat%2C%20holding%20cooking%20utensils%2C%20standing%20in%20a%20modern%20kitchen%20with%20a%20clean%20light%20blue%20background%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=ai5&orientation=squarish',
    online: true,
    animation: 'wobble'
  },
  {
    id: 'ai6',
    name: 'Travel Tina',
    role: 'Hướng dẫn viên du lịch',
    field: 'Du lịch',
    description: 'Hướng dẫn viên du lịch với kinh nghiệm toàn cầu. Giúp bạn học từ vựng và giao tiếp khi đi du lịch.',
    avatar: 'https://readdy.ai/api/search-image?query=A%20friendly%20female%20tour%20guide%20wearing%20casual%20explorer%20outfit%20with%20a%20hat%2C%20holding%20a%20map%2C%20standing%20against%20a%20clean%20light%20blue%20background%20with%20subtle%20travel%20elements%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=ai6&orientation=squarish',
    online: false,
    animation: 'bounce'
  }
];

export const chatHistories: ChatHistory[] = [
  {
    id: 'chat1',
    title: 'Học tiếng Anh giao tiếp',
    participants: ['ai1', 'ai3'],
    lastMessage: 'Hãy thực hành đoạn hội thoại này...',
    timestamp: new Date(2025, 5, 15, 14, 30)
  },
  {
    id: 'chat2',
    title: 'Tư vấn sức khỏe',
    participants: ['ai2'],
    lastMessage: 'Bạn nên duy trì chế độ ăn uống...',
    timestamp: new Date(2025, 5, 14, 9, 15)
  },
  {
    id: 'chat3',
    title: 'Học nấu ăn',
    participants: ['ai5'],
    lastMessage: 'Công thức làm bánh này rất đơn giản...',
    timestamp: new Date(2025, 5, 13, 18, 45)
  },
  {
    id: 'chat4',
    title: 'Học lập trình',
    participants: ['ai4'],
    lastMessage: 'React hooks rất hữu ích trong development...',
    timestamp: new Date(2025, 5, 12, 16, 20)
  }
];

// Dữ liệu messages cho từng chat lịch sử
export const chatHistoryMessages: Record<string, Message[]> = {
  chat1: [
    {
      id: 'h1-1',
      sender: 'ai1',
      content: 'Xin chào! Tôi là Emma - Giáo viên tiếng Anh. Hôm nay chúng ta sẽ học về giao tiếp trong công việc nhé!',
      timestamp: new Date(2025, 5, 15, 14, 0),
      type: 'text',
      isTyping: false,
      highlights: ['giao tiếp', 'công việc']
    },
    {
      id: 'h1-2',
      sender: 'user',
      content: 'Chào cô Emma! Tôi muốn học cách trình bày ý tưởng trong cuộc họp.',
      timestamp: new Date(2025, 5, 15, 14, 1),
      type: 'text',
      isTyping: false,
    },
    {
      id: 'h1-3',
      sender: 'ai3',
      content: 'Xin chào! Tôi là Alex. Trong môi trường kinh doanh, việc trình bày rõ ràng rất quan trọng. Hãy bắt đầu với cấu trúc presentation cơ bản!',
      timestamp: new Date(2025, 5, 15, 14, 2),
      type: 'text',
      isTyping: false,
      highlights: ['trình bày', 'presentation'],
      vocabulary: [
        {
          term: 'presentation',
          pronunciation: 'ˌprezənˈteɪʃən',
          meaning: 'bài thuyết trình, bài trình bày',
          audioUrl: 'https://api.example.com/audio/presentation.mp3'
        }
      ]
    },
    {
      id: 'h1-4',
      sender: 'ai1',
      content: 'Đúng vậy! Một presentation tốt cần có: Introduction - Body - Conclusion. Hãy thực hành đoạn hội thoại này...',
      timestamp: new Date(2025, 5, 15, 14, 30),
      type: 'text',
      isTyping: false,
      highlights: ['Introduction', 'Body', 'Conclusion']
    }
  ],
  chat2: [
    {
      id: 'h2-1',
      sender: 'ai2',
      content: 'Chào bạn! Tôi là Dr. Watson. Hôm nay bạn cảm thấy thế nào?',
      timestamp: new Date(2025, 5, 14, 9, 0),
      type: 'text',
      isTyping: false,
    },
    {
      id: 'h2-2',
      sender: 'user',
      content: 'Chào bác sĩ! Gần đây tôi hay cảm thấy mệt mỏi. Có lời khuyên nào không ạ?',
      timestamp: new Date(2025, 5, 14, 9, 1),
      type: 'text',
      isTyping: false,
    },
    {
      id: 'h2-3',
      sender: 'ai2',
      content: 'Để duy trì sức khỏe tốt, bạn nên duy trì chế độ ăn uống cân bằng, tập thể dục đều đặn và ngủ đủ giấc. Bạn nên duy trì chế độ ăn uống...',
      timestamp: new Date(2025, 5, 14, 9, 15),
      type: 'text',
      isTyping: false,
      highlights: ['sức khỏe', 'chế độ ăn uống', 'tập thể dục'],
      vocabulary: [
        {
          term: 'balanced diet',
          pronunciation: 'ˈbælənst ˈdaɪət',
          meaning: 'chế độ ăn cân bằng',
          audioUrl: 'https://api.example.com/audio/balanced-diet.mp3'
        }
      ]
    }
  ],
  chat3: [
    {
      id: 'h3-1',
      sender: 'ai5',
      content: 'Ciao! Tôi là Chef Maria. Hôm nay chúng ta sẽ học cách làm bánh tiramisu!',
      timestamp: new Date(2025, 5, 13, 18, 0),
      type: 'text',
      isTyping: false,
      highlights: ['tiramisu']
    },
    {
      id: 'h3-2',
      sender: 'user',
      content: 'Chào chef! Tôi chưa bao giờ làm tiramisu. Có khó không ạ?',
      timestamp: new Date(2025, 5, 13, 18, 1),
      type: 'text',
      isTyping: false,
    },
    {
      id: 'h3-3',
      sender: 'ai5',
      content: 'Không khó đâu! Công thức làm bánh này rất đơn giản. Bạn cần: mascarpone, ladyfinger cookies, espresso và cocoa powder.',
      timestamp: new Date(2025, 5, 13, 18, 45),
      type: 'text',
      isTyping: false,
      highlights: ['mascarpone', 'ladyfinger', 'espresso', 'cocoa powder'],
      vocabulary: [
        {
          term: 'mascarpone',
          pronunciation: 'ˌmæskɑrˈpoʊni',
          meaning: 'phô mai mascarpone (phô mai kem Ý)',
          audioUrl: 'https://api.example.com/audio/mascarpone.mp3'
        }
      ]
    }
  ],
  chat4: [
    {
      id: 'h4-1',
      sender: 'ai4',
      content: 'Hi! Tôi là Tom, software engineer. Bạn muốn học về React không?',
      timestamp: new Date(2025, 5, 12, 16, 0),
      type: 'text',
      isTyping: false,
      highlights: ['React']
    },
    {
      id: 'h4-2',
      sender: 'user',
      content: 'Hi Tom! Tôi đang học React hooks. Bạn có thể giải thích useState không?',
      timestamp: new Date(2025, 5, 12, 16, 1),
      type: 'text',
      isTyping: false,
    },
    {
      id: 'h4-3',
      sender: 'ai4',
      content: 'useState là một Hook cho phép bạn thêm state vào functional components. React hooks rất hữu ích trong development...',
      timestamp: new Date(2025, 5, 12, 16, 20),
      type: 'text',
      isTyping: false,
      highlights: ['useState', 'Hook', 'state', 'functional components'],
      vocabulary: [
        {
          term: 'Hook',
          pronunciation: 'hʊk',
          meaning: 'Hook (tính năng đặc biệt của React)',
          audioUrl: 'https://api.example.com/audio/hook.mp3'
        }
      ]
    }
  ]
};

export const fields = ['Tất cả', 'Giáo dục', 'Y tế', 'Kinh doanh', 'Công nghệ', 'Ẩm thực', 'Du lịch'];

export const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', 
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '👍', '👏', '🙌', '🤝', '👨‍💻', '👩‍💻', '📚', '🎓', '✏️', '📝'
];

export const learningStats: LearningStats = {
  vocabulary: 78,
  grammar: 65,
  speaking: 42,
  listening: 56
};

export const recentVocabulary: RecentVocabulary[] = [
  { term: 'deadline', meaning: 'thời hạn chót', pronunciation: 'ˈdedlaɪn', count: 5 },
  { term: 'schedule', meaning: 'lên lịch, sắp xếp', pronunciation: 'ˈʃɛdjuːl', count: 3 },
  { term: 'meeting', meaning: 'cuộc họp', pronunciation: 'ˈmiːtɪŋ', count: 7 },
  { term: 'feedback', meaning: 'phản hồi', pronunciation: 'ˈfiːdbæk', count: 4 }
];
