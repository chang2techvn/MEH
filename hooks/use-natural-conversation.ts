import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AICharacter, Message, VocabularyItem } from '@/types/ai-hub.types';
import { useAutoInteraction } from './use-auto-interaction';
import useSmoothAutoScroll from './use-smooth-auto-scroll';

interface NaturalConversationSession {
  id: string;
  user_id: string;
  title: string;
  conversation_mode: 'natural_group' | 'structured' | 'mixed';
  session_settings: {
    allow_ai_interruptions?: boolean;
    allow_ai_questions?: boolean;
    topic_drift_allowed?: boolean;
    max_ai_participants?: number;
    response_timing?: 'natural' | 'sequential';
  };
  active_ai_ids: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface NaturalConversationMessage {
  id: string;
  session_id: string;
  sender_id?: string;
  ai_assistant_id?: string;
  content: string;
  message_type: 'text' | 'ai_response' | 'ai_question' | 'ai_interaction';
  response_type?: 'direct_answer' | 'ai_to_ai_question' | 'question_user' | 'agreement' | 'disagreement' | 'interrupt' | 'topic_shift' | 'build_on_previous' | 'natural_response';
  interaction_type: 'user_to_ai' | 'ai_to_user' | 'ai_to_ai' | 'system' | 'reply' | 'ai_reply';
  target_ai_id?: string;
  vocabulary?: VocabularyItem[];
  confidence_score?: number;
  naturalness_score?: number;
  processing_time?: number;
  reply_to_message_id?: string; // Added field for reply functionality
  created_at: string;
}

export function useNaturalConversation(selectedAIIds: string[]) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoInteracting, setIsAutoInteracting] = useState(false);
  const [typingAIs, setTypingAIs] = useState<{id: string, name: string, avatar: string}[]>([]);
  const [currentSession, setCurrentSession] = useState<NaturalConversationSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize smooth auto scroll
  const {
    scrollContainerRef,
    autoScrollToMessage,
    scrollToBottom,
    isAutoScrolling
  } = useSmoothAutoScroll({
    behavior: 'smooth',
    delay: 150,
    staggerDelay: 400,
    enabled: true
  });

  // Update chat container ref to use smooth scroll container
  useEffect(() => {
    if (scrollContainerRef.current && chatContainerRef.current) {
      chatContainerRef.current = scrollContainerRef.current;
    }
  }, [scrollContainerRef]);

  // Helper function to add message with smooth scroll
  const addMessageWithScroll = (newMessage: Message) => {
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      
      // Schedule smooth scroll after message is added
      setTimeout(() => {
        const messageElements = chatContainerRef.current?.querySelectorAll('[data-message-id]');
        if (messageElements && messageElements.length > 0) {
          const lastMessageElement = messageElements[messageElements.length - 1] as HTMLElement;
          if (lastMessageElement) {
            autoScrollToMessage(lastMessageElement, newMessage.id);
          }
        } else {
          // Fallback to scroll to bottom
          scrollToBottom();
        }
      }, 50);
      
      return updatedMessages;
    });
  };

  // Watch for messages changes and auto-scroll to new messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        const messageElements = chatContainerRef.current?.querySelectorAll('[data-message-id]');
        if (messageElements && messageElements.length > 0) {
          const messageElement = Array.from(messageElements).find(
            el => el.getAttribute('data-message-id') === latestMessage.id
          ) as HTMLElement;
          
          if (messageElement) {
            autoScrollToMessage(messageElement, latestMessage.id);
          }
        }
      }, 100);
    }
  }, [messages.length, autoScrollToMessage]);

  // Auto-interaction handler
  const handleAutoInteraction = async (type: 'ai_to_ai' | 'ai_to_user') => {
    // Don't trigger auto-interactions if user is actively using the system
    if (!currentSession || isAutoInteracting || isProcessing) {
      console.log('🚫 Auto-interaction blocked - system busy');
      return;
    }

    try {
      console.log(`🤖 Triggering auto-interaction: ${type}`);
      
      setIsAutoInteracting(true);
      
      // First, get AI details for typing indicator
      const { data: aiAssistants } = await supabase
        .from('ai_assistants')
        .select('id, name, avatar')
        .in('id', selectedAIIds)
        .eq('is_active', true);

      if (!aiAssistants?.length) return;

      // Randomly select AI for typing indicator
      const selectedAI = aiAssistants[Math.floor(Math.random() * aiAssistants.length)];
      
      // Show typing indicator (but don't block user input)
      setTypingAIs([{
        id: selectedAI.id,
        name: selectedAI.name,
        avatar: selectedAI.avatar
      }]);

      // Add a small delay to make typing visible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch('/api/auto-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          selectedAIs: selectedAIIds,
          interactionType: type
        })
      });

      if (!response.ok) {
        throw new Error(`Auto-interaction failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Clear initial typing indicator
      setTypingAIs([]);
      
      if (data.success && data.interactions) {
        // Process each interaction with typing effect
        for (let i = 0; i < data.interactions.length; i++) {
          const interaction = data.interactions[i];
          
          // Find the AI for this interaction
          const typingAI = aiAssistants.find(ai => ai.name === interaction.initiator);
          
          if (typingAI) {
            // Show typing indicator for this specific AI
            setTypingAIs([{
              id: typingAI.id,
              name: typingAI.name,
              avatar: typingAI.avatar
            }]);
            
            // Wait a bit to show typing
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
            
            // Clear typing and add message
            setTypingAIs([]);
          }
          
          const autoMessage: Message = {
            id: interaction.id,
            sender: interaction.initiator,
            content: interaction.content,
            timestamp: new Date(interaction.timestamp),
            type: 'text',
            isTyping: false,
            isAutoGenerated: true // Mark as auto-generated
          };
          
          addMessageWithScroll(autoMessage);
          
          // Small delay between messages for better UX
          if (i < data.interactions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log(`✅ Auto-interaction successful: ${data.interactions.length} messages`);
      }
    } catch (error) {
      console.error('❌ Auto-interaction error:', error);
      
      // Clear any remaining typing indicators
      setTypingAIs([]);
      
      setError(error instanceof Error ? error.message : 'Auto-interaction failed');
    } finally {
      // Add a small delay before clearing auto-interaction state to prevent conflicts
      setTimeout(() => {
        setIsAutoInteracting(false);
      }, 100);
    }
  };

  // Initialize auto-interaction system
  const {
    isEnabled: autoInteractionEnabled,
    isActive: autoInteractionActive,
    recordUserActivity,
    startAutoInteraction,
    stopAutoInteraction,
    toggleAutoInteraction,
    resetAutoInteraction,
    currentTimeoutSeconds
  } = useAutoInteraction(
    currentSession?.id || null,
    selectedAIIds,
    handleAutoInteraction,
    {}, // config
    isProcessing // Pass user activity state - pause auto-interactions when user is processing
  );

  // Load an existing session by ID
  const loadSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Load session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('natural_conversation_sessions')
        .select(`
          *,
          users!natural_conversation_sessions_user_id_fkey(
            profiles(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError) throw sessionError;
      
      setCurrentSession(sessionData);
      
      // Load conversation history for this session
      await loadConversationHistory(sessionId);
      
      return sessionData;
    } catch (error) {
      console.error('Error loading session:', error);
      setError(error instanceof Error ? error.message : 'Failed to load session');
      return null;
    }
  };

  // Create a new natural conversation session
  const createSession = async (title?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('natural_conversation_sessions')
        .insert({
          user_id: user.id,
          title: title || `Cuộc trò chuyện với ${selectedAIIds.length} AI`,
          conversation_mode: 'natural_group',
          active_ai_ids: selectedAIIds,
          session_settings: {
            allow_ai_interruptions: true,
            allow_ai_questions: true,
            topic_drift_allowed: true,
            max_ai_participants: 4,
            response_timing: 'natural'
          }
        })
        .select(`
          *,
          users!natural_conversation_sessions_user_id_fkey(
            profiles(
              full_name,
              avatar_url
            )
          )
        `)
        .single();

      if (error) throw error;
      
      setCurrentSession(data);
      setMessages([]);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create session');
      return null;
    }
  };

  // Send a message in natural conversation mode
  const sendNaturalMessage = async (content: string, replyToMessageId?: string, replyToAI?: string) => {
    try {
      // Record user activity for auto-interaction system
      recordUserActivity();
      
      let sessionToUse = currentSession;
      
      // Create session if it doesn't exist
      if (!sessionToUse) {
        console.log('🔄 Creating new session...');
        sessionToUse = await createSession();
        if (!sessionToUse) {
          console.error('❌ Failed to create session');
          setError('Failed to create conversation session');
          return;
        }
        console.log('✅ Session created:', sessionToUse.id);
      }

      console.log('📤 Sending message with session:', sessionToUse.id);
      
      // Only set processing state for user-initiated messages, not auto-interactions
      if (!isAutoInteracting) {
        setIsProcessing(true);
      }
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add user message to local state immediately with smooth scroll
      const userMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'user',
        content,
        timestamp: new Date(),
        type: 'text',
        isTyping: false,
        replyToMessageId: replyToMessageId || undefined
      };

      addMessageWithScroll(userMessage);

      // Insert user message to database
      const { error: insertError } = await supabase
        .from('natural_conversation_messages')
        .insert({
          session_id: sessionToUse.id,
          sender_id: user.id,
          content,
          message_type: 'text',
          interaction_type: replyToMessageId ? 'reply' : 'user_to_ai',
          reply_to_message_id: replyToMessageId || null
        });

      if (insertError) {
        console.error('Error saving user message:', insertError);
        // Don't throw error, continue with conversation even if saving fails
      }

      // Call natural conversation API
      const response = await fetch('/api/natural-group-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: sessionToUse.id,
          selectedAIs: selectedAIIds,
          conversationMode: 'natural_group',
          replyToMessageId: replyToMessageId || undefined,
          replyToAI: replyToAI || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'typing_start') {
                // Don't interfere with auto-interaction typing indicators
                if (!isAutoInteracting) {
                  setTypingAIs(data.ais);
                }
                // Don't set isProcessing here as it blocks input unnecessarily
              } else if (data.type === 'typing_stop') {
                setTypingAIs(prev => prev.filter(ai => ai.name !== data.aiName));
              } else if (data.type === 'ai_response') {
                const aiMessage: Message = {
                  id: data.response.id,
                  sender: data.response.aiName, // This is AI name, not ID
                  content: data.response.content,
                  timestamp: new Date(data.timestamp),
                  type: 'text',
                  isTyping: false,
                  vocabulary: data.response.vocabulary && data.response.vocabulary.length > 0 ? data.response.vocabulary : undefined,
                  replyToMessageId: data.response.replyToMessageId || undefined,
                  isReplyMode: data.response.isReplyMode || false
                };

                addMessageWithScroll(aiMessage);
                
                // Remove this AI from typing list if not already removed
                setTypingAIs(prev => prev.filter(ai => ai.name !== data.response.aiName));
              } else if (data.type === 'ai_to_ai_interaction') {
                const interactionMessage: Message = {
                  id: crypto.randomUUID(),
                  sender: data.response.targetAI, // This is AI name, not ID
                  content: data.response.response,
                  timestamp: new Date(data.timestamp),
                  type: 'text',
                  isTyping: false
                };

                addMessageWithScroll(interactionMessage);
              } else if (data.type === 'error') {
                console.error('API Error:', data.message);
                setError(data.message);
                // Remove AI from typing list on error
                if (data.aiName) {
                  setTypingAIs(prev => prev.filter(ai => ai.name !== data.aiName));
                }
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      // Only clear processing state if this wasn't an auto-interaction
      if (!isAutoInteracting) {
        setIsProcessing(false);
      }
      // Always clear typing indicators for user-initiated messages
      setTypingAIs([]);
    }
  };

  // Load conversation history
  const loadConversationHistory = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('natural_conversation_messages')
        .select(`
          *,
          ai_assistants!ai_assistant_id(name)
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.ai_assistant_id ? msg.ai_assistants?.name || 'AI' : 'user', // Changed from 'You' to 'user'
        content: msg.content,
        timestamp: new Date(msg.created_at),
        type: 'text',
        isTyping: false,
        vocabulary: msg.vocabulary || [],
        replyToMessageId: msg.reply_to_message_id || undefined,
        isReplyMode: !!msg.reply_to_message_id,
        isAutoGenerated: msg.message_type === 'ai_interaction' || msg.interaction_type?.includes('ai_to')
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversation');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Helper function for replying to a specific AI message
  const replyToMessage = async (content: string, originalMessageId: string, targetAIId: string) => {
    return sendNaturalMessage(content, originalMessageId, targetAIId);
  };

  // Function to clear current session and start fresh
  const clearSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setError(null);
    setIsProcessing(false);
    setTypingAIs([]);
  };

  return {
    messages,
    isProcessing,
    isAutoInteracting,
    typingAIs,
    currentSession,
    error,
    chatContainerRef: scrollContainerRef, // Use smooth scroll container ref
    sendNaturalMessage,
    replyToMessage, // New function for reply functionality
    createSession,
    loadSession,
    loadConversationHistory,
    clearSession, // New function to clear session
    // Auto-interaction functions
    autoInteractionEnabled,
    autoInteractionActive,
    currentTimeoutSeconds,
    startAutoInteraction,
    stopAutoInteraction,
    toggleAutoInteraction,
    resetAutoInteraction,
    // Smooth scroll functions
    scrollToBottom,
    isAutoScrolling
  };
}
