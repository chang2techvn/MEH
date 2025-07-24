export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string | null;
  isTyping: boolean;
  highlights?: string[];
  vocabulary?: VocabularyItem[];
}

export interface VocabularyItem {
  term: string;
  pronunciation: string;
  meaning: string;
  audioUrl: string;
}

export interface AICharacter {
  id: string;
  name: string;
  role: string;
  field: string;
  description: string;
  avatar: string;
  online: boolean;
  animation: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  participants: string[];
  lastMessage: string;
  timestamp: Date;
}

export interface LearningStats {
  vocabulary: number;
  grammar: number;
  speaking: number;
  listening: number;
}

export interface RecentVocabulary {
  term: string;
  meaning: string;
  pronunciation: string;
  count: number;
}
