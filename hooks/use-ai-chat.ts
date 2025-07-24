import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/ai-hub.types';
import { chatHistoryMessages } from '@/lib/ai-hub-data';

export const useChat = (selectedAIs: string[], currentChatId?: string | null) => {
  // Load messages từ lịch sử nếu có currentChatId, ngược lại dùng default messages hoặc empty cho chat mới
  const getInitialMessages = (): Message[] => {
    if (currentChatId && chatHistoryMessages[currentChatId]) {
      return chatHistoryMessages[currentChatId];
    }
    
    // Nếu currentChatId là null (chat mới), trả về array rỗng
    if (currentChatId === null) {
      return [];
    }
    
    // Default messages cho lần đầu tiên
    return [
      {
        id: '1',
        sender: 'ai1',
        content: 'Xin chào! Tôi là Emma - Giáo viên tiếng Anh ảo. Bạn muốn học gì hôm nay?',
        timestamp: new Date(2025, 5, 16, 9, 30),
        type: 'text',
        isTyping: false,
        highlights: ['Xin chào', 'học']
      },
      {
        id: '2',
        sender: 'user',
        content: 'Chào Emma, tôi muốn học về cách giao tiếp trong công việc',
        timestamp: new Date(2025, 5, 16, 9, 31),
        type: 'text',
        isTyping: false,
      },
      {
        id: '3',
        sender: 'ai3',
        content: 'Xin chào! Tôi là Alex - Chuyên gia kinh doanh. Tôi có thể giúp bạn với các từ vựng và cách giao tiếp trong môi trường công sở. Hãy bắt đầu với một số từ vựng cơ bản nhé!',
        timestamp: new Date(2025, 5, 16, 9, 32),
        type: 'text',
        isTyping: false,
        highlights: ['từ vựng', 'giao tiếp', 'môi trường công sở']
      },
      {
        id: '4',
        sender: 'ai1',
        content: 'Tuyệt vời! Tôi và Alex sẽ giúp bạn. Trước tiên, hãy học về cách chào hỏi đồng nghiệp và cấp trên một cách chuyên nghiệp nhé.',
        timestamp: new Date(2025, 5, 16, 9, 33),
        type: 'text',
        isTyping: false,
        highlights: ['chào hỏi đồng nghiệp', 'cấp trên', 'chuyên nghiệp']
      }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Reset messages khi currentChatId thay đổi
  useEffect(() => {
    setMessages(getInitialMessages());
  }, [currentChatId]);

  const sendMessage = (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
    if (content.trim() === '' && !mediaUrl) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString() + '-' + Math.random().toString(36).slice(2),
      sender: 'user',
      content,
      timestamp: new Date(),
      type: (mediaType as 'text' | 'image' | 'video' | 'audio') || 'text',
      mediaUrl,
      isTyping: false,
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiSender = selectedAIs[Math.floor(Math.random() * selectedAIs.length)];
      const aiResponses = [
        {
          content: 'Câu hỏi hay đấy! Trong tiếng Anh, chúng ta có thể diễn đạt điều này như sau: "That\'s an interesting question!"',
          vocabulary: [
            {
              term: 'interesting',
              pronunciation: 'ˈɪnt(ə)rɪstɪŋ',
              meaning: 'thú vị, hấp dẫn',
              audioUrl: 'https://api.example.com/audio/interesting.mp3'
            }
          ]
        },
        {
          content: 'Hãy thử luyện tập câu này: "I would like to schedule a meeting with you to discuss this matter."',
          vocabulary: [
            {
              term: 'schedule',
              pronunciation: 'ˈʃɛdjuːl',
              meaning: 'lên lịch, sắp xếp',
              audioUrl: 'https://api.example.com/audio/schedule.mp3'
            },
            {
              term: 'discuss',
              pronunciation: 'dɪˈskʌs',
              meaning: 'thảo luận, bàn bạc',
              audioUrl: 'https://api.example.com/audio/discuss.mp3'
            }
          ]
        },
        {
          content: 'Một từ vựng quan trọng trong công việc là "deadline" - thời hạn hoàn thành công việc.',
          vocabulary: [
            {
              term: 'deadline',
              pronunciation: 'ˈdedlaɪn',
              meaning: 'thời hạn chót',
              audioUrl: 'https://api.example.com/audio/deadline.mp3'
            }
          ]
        }
      ];
      
      const highlights = ['deadline', 'feedback', 'challenges', 'schedule', 'appreciate', 'interesting'];
      const randomResponseObj = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const highlightedWords = highlights.filter(word => 
        randomResponseObj.content.toLowerCase().includes(word.toLowerCase())
      );
      
      const newAIMessage: Message = {
        id: (Date.now() + 1).toString() + '-' + Math.random().toString(36).slice(2),
        sender: aiSender,
        content: randomResponseObj.content,
        timestamp: new Date(),
        type: 'text',
        isTyping: false,
        highlights: highlightedWords,
        vocabulary: randomResponseObj.vocabulary
      };
      
      setMessages(prev => [...prev, newAIMessage]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        const scrollContainer = chatContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        } else {
          // Fallback cho trường hợp không có ScrollArea
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    };

    // Delay scroll để đảm bảo DOM đã được render
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  return {
    messages,
    isTyping,
    sendMessage,
    chatContainerRef
  };
};
