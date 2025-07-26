import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

export interface ChatSession {
  id: string;
  title: string;
  conversation_mode: 'natural_group' | 'structured' | 'mixed';
  active_ai_ids: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  session_settings: {
    allow_ai_interruptions?: boolean;
    allow_ai_questions?: boolean;
    topic_drift_allowed?: boolean;
    max_ai_participants?: number;
    response_timing?: 'natural' | 'sequential';
  };
  // Virtual fields for display
  lastMessage: string; // Required for compatibility with ChatHistory interface
  lastMessageTime?: string;
  timestamp: Date; // For compatibility with ChatHistory interface
  participants: string[]; // AI IDs for compatibility
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadSessions = async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load sessions with last message
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('natural_conversation_sessions')
        .select(`
          id,
          title,
          conversation_mode,
          active_ai_ids,
          created_at,
          updated_at,
          is_active,
          session_settings
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;

      // For each session, get the last message
      const sessionsWithMessages = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: lastMessage } = await supabase
            .from('natural_conversation_messages')
            .select('content, created_at')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...session,
            participants: session.active_ai_ids, // For compatibility with existing components
            lastMessage: lastMessage?.content || 'Cuộc trò chuyện mới',
            lastMessageTime: lastMessage?.created_at || session.created_at,
            timestamp: new Date(lastMessage?.created_at || session.updated_at)
          };
        })
      );

      setSessions(sessionsWithMessages);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  // Load sessions when user changes
  useEffect(() => {
    loadSessions();
  }, [user]);

  // Real-time subscription for new sessions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'natural_conversation_sessions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Reload sessions when changes occur
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    sessions,
    loading,
    error,
    reload: loadSessions
  };
}
