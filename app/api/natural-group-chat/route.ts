import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getActiveApiKey, incrementUsage, rotateToNextKey } from '@/lib/api-key-manager';

// API Key Manager - sử dụng hệ thống xoay key
let currentApiKey: string | null = null;
let currentKeyId: string | null = null;

// Hàm lấy API key với rotation
async function getGeminiApiKey(): Promise<{ apiKey: string; keyId: string }> {
  try {
    // Nếu đã có key hiện tại, sử dụng nó
    if (currentApiKey && currentKeyId) {
      return { apiKey: currentApiKey, keyId: currentKeyId };
    }

    // Lấy key mới từ API key manager
    const keyData = await getActiveApiKey('gemini');
    currentApiKey = keyData.decrypted_key;
    currentKeyId = keyData.id;

    console.log(`🔑 Using API key: ${keyData.key_name} (Usage: ${keyData.current_usage}/${keyData.usage_limit})`);
    
    return { apiKey: currentApiKey, keyId: currentKeyId };
  } catch (error) {
    console.error('❌ Failed to get API key:', error);
    throw new Error('No available API keys');
  }
}

// Hàm xoay API key khi gặp lỗi
async function rotateApiKey(reason: string): Promise<{ apiKey: string; keyId: string }> {
  try {
    console.log(`🔄 Rotating API key due to: ${reason}`);
    
    const rotationResult = await rotateToNextKey('gemini', currentKeyId || undefined, reason);
    
    if (!rotationResult.success) {
      throw new Error(`API key rotation failed: ${rotationResult.reason}`);
    }

    // Lấy key mới sau khi rotate
    const keyData = await getActiveApiKey('gemini');
    currentApiKey = keyData.decrypted_key;
    currentKeyId = keyData.id;

    console.log(`✅ Successfully rotated to new API key: ${keyData.key_name}`);
    
    return { apiKey: currentApiKey, keyId: currentKeyId };
  } catch (error) {
    console.error('❌ API key rotation failed:', error);
    currentApiKey = null;
    currentKeyId = null;
    throw error;
  }
}

interface NaturalConversationRequest {
  message: string;
  sessionId: string;
  selectedAIs: string[];
  conversationMode: 'natural_group' | 'structured' | 'mixed';
  replyToMessageId?: string; // ID của message được reply
  replyToAI?: string; // ID của AI được reply
}

interface AIPersonality {
  id: string;
  name: string;
  role: string;
  field: string;
  description: string;
  personality_traits: string[];
  response_threshold: number;
  system_prompt?: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      sessionId, 
      selectedAIs, 
      conversationMode = 'natural_group',
      replyToMessageId,
      replyToAI 
    }: NaturalConversationRequest = await request.json();

    if (!message || !sessionId || !selectedAIs || selectedAIs.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine if this is a reply mode conversation
    const isReplyMode = !!(replyToMessageId && replyToAI);
    
    // For reply mode, only the target AI responds
    let activeAIs = selectedAIs;
    if (isReplyMode) {
      // In reply mode, ONLY the target AI responds
      activeAIs = [replyToAI];
    }

    // Get AI personalities from database
    const { data: aiPersonalities, error: aiError } = await supabase
      .from('ai_assistants')
      .select('*')
      .in('id', activeAIs) // Use activeAIs instead of selectedAIs
      .eq('is_active', true);

    if (aiError || !aiPersonalities || aiPersonalities.length === 0) {
      return NextResponse.json(
        { error: 'Failed to get AI personalities' },
        { status: 500 }
      );
    }

    // Create a readable stream for server-sent events
    const encoder = new TextEncoder();
    let isStreamClosed = false;
    
    const stream = new ReadableStream({
      async start(controller) {
        // Helper function to safely enqueue data
        const safeEnqueue = (data: string) => {
          if (!isStreamClosed) {
            try {
              controller.enqueue(encoder.encode(data));
            } catch (error) {
              console.warn('Stream already closed, ignoring message:', data);
              isStreamClosed = true;
            }
          }
        };
        
        try {
          // Get conversation history for context - increased to 35 messages for better context
          const { data: conversationHistory } = await supabase
            .from('natural_conversation_messages')
            .select(`
              *,
              ai_assistants!ai_assistant_id(name)
            `)
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(50); // Increased from 10 to 35 messages

          const recentMessages = (conversationHistory || []).reverse();

          // Get the original message being replied to if in reply mode
          let replyContext = null;
          if (isReplyMode && replyToMessageId) {
            const { data: originalMessage } = await supabase
              .from('natural_conversation_messages')
              .select(`
                *,
                ai_assistants!ai_assistant_id(name)
              `)
              .eq('id', replyToMessageId)
              .single();
            
            if (originalMessage) {
              replyContext = {
                content: originalMessage.content,
                sender: originalMessage.ai_assistant_id ? originalMessage.ai_assistants?.name : 'User',
                timestamp: originalMessage.created_at
              };
            }
          }

          // Send typing indicators for all participating AIs first
          safeEnqueue(`data: ${JSON.stringify({
            type: 'typing_start',
            ais: aiPersonalities.map(ai => ({
              id: ai.id,
              name: ai.name,
              avatar: ai.avatar
            })),
            isReplyMode,
            replyToAI: replyToAI,
            timestamp: new Date().toISOString()
          })}\n\n`);

          // Create truly async promises - each AI responds independently
          // In reply mode, prioritize the target AI
          const sortedAIs = isReplyMode ? 
            aiPersonalities.sort((a, b) => a.id === replyToAI ? -1 : 1) : 
            aiPersonalities;

          sortedAIs.forEach(async (ai: AIPersonality, index: number) => {
            try {
              // Natural delay based on AI personality and response type
              let delay = calculateNaturalDelay(ai, index, recentMessages);
              
              // In reply mode, the target AI responds much faster
              if (isReplyMode && ai.id === replyToAI) {
                delay = Math.max(500, delay * 0.3); // Much faster response for target AI
              }
              
              // Skip response if delay is -1 (lurking behavior) - but not for target AI in reply mode
              if (delay === -1 && !(isReplyMode && ai.id === replyToAI)) {
                safeEnqueue(`data: ${JSON.stringify({
                  type: 'typing_stop',
                  aiName: ai.name,
                  timestamp: new Date().toISOString()
                })}\n\n`);
                return;
              }
              
              await new Promise(resolve => setTimeout(resolve, delay));

              const response = await generateNaturalAIResponse(ai, message, recentMessages, replyContext, isReplyMode);
              
              if (!response) {
                safeEnqueue(`data: ${JSON.stringify({
                  type: 'typing_stop',
                  aiName: ai.name,
                  timestamp: new Date().toISOString()
                })}\n\n`);
                return;
              }

              // Save AI response to database
              const { error: saveError } = await supabase
                .from('natural_conversation_messages')
                .insert({
                  session_id: sessionId,
                  ai_assistant_id: ai.id,
                  content: response.content,
                  message_type: 'ai_response',
                  response_type: response.responseType,
                  interaction_type: isReplyMode ? 'ai_reply' : 'ai_to_user',
                  confidence_score: response.confidence,
                  naturalness_score: response.naturalness,  
                  vocabulary: response.vocabulary,
                  processing_time: response.processingTime,
                  reply_to_message_id: isReplyMode ? replyToMessageId : null
                });

              if (saveError) {
                console.error('Error saving AI message:', saveError);
                // Don't throw error, continue with streaming
              }

              // Send typing stop for this AI
              safeEnqueue(`data: ${JSON.stringify({
                type: 'typing_stop',
                aiName: ai.name,
                timestamp: new Date().toISOString()
              })}\n\n`);

              // Stream the response immediately when ready
              safeEnqueue(`data: ${JSON.stringify({
                type: 'ai_response',
                response: {
                  id: crypto.randomUUID(),
                  aiId: ai.id,
                  aiName: ai.name,
                  content: response.content,
                  responseType: response.responseType,
                  interactionIntent: response.interactionIntent,
                  vocabulary: response.vocabulary,
                  confidence: response.confidence,
                  naturalness: response.naturalness,
                  processingTime: response.processingTime,
                  isReplyMode: isReplyMode,
                  replyToMessageId: isReplyMode ? replyToMessageId : null
                },
                timestamp: new Date().toISOString()
              })}\n\n`);

              // Random chance for AI-to-AI interaction after delay (disabled in reply mode)
              if (!isReplyMode && Math.random() < 0.3 && aiPersonalities.length > 1) {
                const interactionDelay = 2000 + Math.random() * 4000; // 2-6 seconds
                setTimeout(async () => {
                  try {
                    const otherAIs = aiPersonalities.filter(target => target.id !== ai.id);
                    const targetAI = otherAIs[Math.floor(Math.random() * otherAIs.length)];
                    
                    const reactionResponse = await generateGroupChatReaction(targetAI, ai, response.content, recentMessages);
                    
                    if (reactionResponse) {
                      safeEnqueue(`data: ${JSON.stringify({
                        type: 'ai_to_ai_interaction',
                        response: {
                          initiatingAI: ai.name,
                          targetAI: targetAI.name,
                          response: reactionResponse.content,
                          interactionType: determineInteractionType(reactionResponse.content),
                          timestamp: new Date().toISOString()
                        },
                        timestamp: new Date().toISOString()
                      })}\n\n`);
                    }
                  } catch (error) {
                    console.error('Error in AI-to-AI interaction:', error);
                  }
                }, interactionDelay);
              }

            } catch (error) {
              console.error(`Error generating response for ${ai.name}:`, error);
              
              safeEnqueue(`data: ${JSON.stringify({
                type: 'typing_stop',
                aiName: ai.name,
                timestamp: new Date().toISOString()
              })}\n\n`);

              safeEnqueue(`data: ${JSON.stringify({
                type: 'error',
                message: `Failed to get response from ${ai.name}`,
                aiName: ai.name,
                timestamp: new Date().toISOString()
              })}\n\n`);
            }
          });

          // Close stream after reasonable timeout (all AIs should have responded by then)
          setTimeout(() => {
            isStreamClosed = true;
            controller.close();
          }, 15000); // 15 seconds timeout
        } catch (error) {
          console.error('Stream error:', error);
          safeEnqueue(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to process natural conversation'
          })}\n\n`);
          isStreamClosed = true;
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Natural conversation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateNaturalAIResponse(
  ai: AIPersonality,
  userMessage: string,
  conversationHistory: any[],
  replyContext?: { content: string; sender: string; timestamp: string } | null,
  isReplyMode?: boolean
): Promise<{
  content: string;
  responseType: string;
  interactionIntent?: { type: string; target?: string };
  vocabulary: any[];
  confidence: number;
  naturalness: number;
  processingTime: number;
} | null> {
  try {
    const startTime = Date.now();
    
    // Lấy API key động
    const { apiKey, keyId } = await getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Build context-aware prompt with reply context
    const contextPrompt = buildNaturalConversationPrompt(ai, userMessage, conversationHistory, replyContext, isReplyMode);
    
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const content = response.text();
    
    // Tăng usage counter
    await incrementUsage(keyId);
    
    const processingTime = Date.now() - startTime;
    
    // Extract vocabulary from response
    const vocabulary = extractVocabularyFromResponse(content);
    
    // Determine response type and interaction intent
    const responseType = determineResponseType(ai, content, conversationHistory);
    const interactionIntent = determineInteractionIntent(ai, content);
    
    return {
      content: cleanResponseContent(content),
      responseType,
      interactionIntent,
      vocabulary,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
      naturalness: Math.random() * 0.2 + 0.8, // 0.8-1.0 range
      processingTime
    };
    
  } catch (error) {
    console.error(`Error generating response for ${ai.name}:`, error);
    
    // Nếu lỗi liên quan API key, thử rotate
    if (error instanceof Error && (
      error.message.includes('API_KEY') || 
      error.message.includes('403') || 
      error.message.includes('Forbidden')
    )) {
      try {
        await rotateApiKey(`API error for ${ai.name}: ${error.message}`);
        console.log(`🔄 Rotated API key after error for ${ai.name}`);
      } catch (rotateError) {
        console.error('❌ Failed to rotate API key:', rotateError);
      }
    }
    
    return null;
  }
}

async function generateAIToAIResponse(
  targetAI: AIPersonality,
  initiatingAI: AIPersonality,
  initiatingMessage: string
): Promise<{ content: string } | null> {
  try {
    // Lấy API key động
    const { apiKey, keyId } = await getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are ${targetAI.name}, ${targetAI.role} in ${targetAI.field}.
${initiatingAI.name} just said to you: "${initiatingMessage}"

Respond directly to ${initiatingAI.name} naturally, as if you're in a group conversation.
Keep it brief and conversational (1-2 sentences max).
Show your personality: ${targetAI.personality_traits?.join(', ') || 'helpful'}.

Respond now as ${targetAI.name}:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Tăng usage counter
    await incrementUsage(keyId);
    
    return {
      content: cleanResponseContent(response.text())
    };
    
  } catch (error) {
    console.error(`Error generating AI-to-AI response for ${targetAI.name}:`, error);
    
    // Nếu lỗi liên quan API key, thử rotate
    if (error instanceof Error && (
      error.message.includes('API_KEY') || 
      error.message.includes('403') || 
      error.message.includes('Forbidden')
    )) {
      try {
        await rotateApiKey(`API error for AI-to-AI ${targetAI.name}: ${error.message}`);
        console.log(`🔄 Rotated API key after AI-to-AI error for ${targetAI.name}`);
      } catch (rotateError) {
        console.error('❌ Failed to rotate API key:', rotateError);
      }
    }
    
    return null;
  }
}

function buildNaturalConversationPrompt(
  ai: AIPersonality,
  userMessage: string,
  conversationHistory: any[],
  replyContext?: { content: string; sender: string; timestamp: string } | null,
  isReplyMode?: boolean
): string {
  // Build comprehensive conversation context with more messages for better continuity
  const historyContext = conversationHistory
    .slice(-15) // Use last 15 messages for better context (increased from 5)
    .map(msg => {
      const sender = msg.ai_assistant_id ? msg.ai_assistants?.name || 'AI' : 'User';
      const timestamp = new Date(msg.created_at).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `[${timestamp}] ${sender}: ${msg.content}`;
    })
    .join('\n');

  // Analyze recent conversation themes and topics for better contextual responses
  const recentTopics = conversationHistory
    .slice(-10)
    .map(msg => msg.content)
    .join(' ')
    .toLowerCase();
  
  // Determine conversation mood and style
  const conversationMood = determineConversationMood(conversationHistory.slice(-8));
  
  // Build reply context section
  let replySection = '';
  if (isReplyMode && replyContext) {
    const replyTime = new Date(replyContext.timestamp).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    replySection = `
## 🔄 REPLY MODE - Direct 1-on-1 Conversation
You are responding to a specific message from ${replyContext.sender}:
"[${replyTime}] ${replyContext.sender}: ${replyContext.content}"

IMPORTANT REPLY GUIDELINES:
- This is a DIRECT REPLY - you are the ONLY AI responding
- Address the user's message personally and directly
- This is now a 1-on-1 conversation between you and the user
- Be more focused, personal, and detailed in your response
- Reference the original message you're replying to
- No other AIs will participate in this reply - it's just you and the user
- Show that you understand exactly what the user is asking about
`;
  }
  
  return `
You are ${ai.name}, ${ai.role} in ${ai.field}.
${ai.system_prompt || `You are an expert in ${ai.field} helping users learn English through natural conversation.`}
${replySection}
## Extended Group Chat Context (Last 15 messages):
${historyContext}

## Conversation Analysis:
- Recent topics discussed: ${extractKeyTopics(recentTopics)}
- Current conversation mood: ${conversationMood}
- Your role in this conversation: Maintain personality while being contextually aware
- Conversation type: ${isReplyMode ? 'FOCUSED REPLY' : 'GROUP CHAT'}

## User's New Message:
User: ${userMessage}

## ${isReplyMode ? 'Direct Reply Mode' : 'Enhanced Group Chat'} Response Guidelines:
${isReplyMode ? `
- **EXCLUSIVE RESPONSE**: You are the ONLY AI responding - make it count!
- **Direct Engagement**: Address the user's specific message personally
- **Detailed Response**: Since it's 1-on-1, you can be more thorough
- **Personal Connection**: Build a direct relationship with the user
- **Context Focus**: Concentrate entirely on the message you're replying to
- **No Competition**: You don't need to compete with other AIs for attention
` : `
- **Context Awareness**: Reference previous messages naturally when relevant
- **Conversation Flow**: Build upon what others have said, don't just respond in isolation
- **Social Dynamics**: React to what others said, ask follow-up questions, or add related thoughts
- **Memory**: Show you remember what was discussed earlier in the conversation
`}
- **Personality Consistency**: Stay true to your traits: ${ai.personality_traits?.join(', ') || 'helpful'}
- **Natural Variation**: Sometimes be brief, sometimes elaborate based on conversation flow
- **Topic Continuity**: If the conversation has a theme, contribute meaningfully to it
- **Vocabulary Integration**: Include relevant vocabulary ONLY when responding in English: [VOCAB:term|pronunciation|meaning|example]
- **Cultural Sensitivity**: Adapt your response style to the conversation's cultural context
- **Engagement**: Keep the conversation flowing naturally - ask questions, share experiences, or build on ideas
- **RESPONSE LENGTH**: Keep your response under 35 words maximum - be concise and natural like in real group chats

## Response Strategy Based on Context:
${generateResponseStrategy(ai, conversationHistory.slice(-8), userMessage)}

## Format Guidelines:
Respond naturally as ${ai.name}. ${isReplyMode ? 'Address the specific message being replied to.' : 'Reference earlier messages when appropriate.'} 
If including vocabulary (ONLY for English responses), use: [VOCAB:term|pronunciation|meaning|example]

IMPORTANT: 
${isReplyMode ? `
- This is a DIRECT REPLY - you are the only AI responding
- Address the specific message being replied to personally
- Be comprehensive since you have the user's full attention
- Show clear understanding of what the user is asking
- Build a direct connection with the user
` : `
- Don't just answer the last message - consider the whole conversation flow
- Show that you've been following the discussion
- Be conversational and build relationships with other participants
`}
- Only use vocabulary format for English terms that would help English learners

Respond now with full context awareness:`;
}

function calculateNaturalDelay(ai: AIPersonality, index: number, messageHistory: any[]): number {
  const baseDelay = 1500; // 1.5 seconds base
  const randomVariation = Math.random() * 3000; // 0-3 second variation for realism
  
  // Personality-based response speed
  let personalityMultiplier = 1.0;
  if (ai.personality_traits?.includes('quick_thinker') || ai.personality_traits?.includes('tự tin')) personalityMultiplier = 0.6;
  if (ai.personality_traits?.includes('thoughtful') || ai.personality_traits?.includes('khiêm tốn')) personalityMultiplier = 1.4;
  if (ai.personality_traits?.includes('bí ẩn')) personalityMultiplier = 1.8; // Sơn Tùng style
  
  // Enhanced topic interest detection with more context
  const recentMessages = messageHistory.slice(-8).map(m => m.content?.toLowerCase() || ''); // Increased from 3 to 8
  const allMessageText = recentMessages.join(' ');
  
  // Check if AI field/expertise is mentioned
  const isInterestedTopic = allMessageText.includes(ai.field?.toLowerCase() || '') || 
    ai.tags?.some(tag => allMessageText.includes(tag.toLowerCase()));
  
  // Check if AI was mentioned or addressed directly
  const isMentioned = allMessageText.includes(ai.name.toLowerCase()) || 
    recentMessages.some(msg => msg.includes('@'));
  
  // Check if conversation is asking for help in AI's area
  const isHelpRequest = allMessageText.includes('help') || allMessageText.includes('how') || 
    allMessageText.includes('explain') || allMessageText.includes('teach');
  
  // Faster response for relevant topics
  if (isInterestedTopic) personalityMultiplier *= 0.7;
  if (isMentioned) personalityMultiplier *= 0.5; // Much faster when mentioned
  if (isHelpRequest && isInterestedTopic) personalityMultiplier *= 0.6;
  
  // Consider conversation momentum - if conversation is active, respond faster
  const recentMessageCount = messageHistory.slice(-5).length; // Messages in last period
  if (recentMessageCount >= 3) personalityMultiplier *= 0.8; // Active conversation
  
  // Random chance to not respond (like real group chat - some people lurk)
  // But less likely to lurk if mentioned or topic is interesting
  let lurkerChance = 0.2; // 20% base chance
  if (isMentioned) lurkerChance = 0.05; // 5% if mentioned
  if (isInterestedTopic) lurkerChance = 0.1; // 10% for interesting topics
  
  const responseChance = Math.random();
  if (responseChance < lurkerChance) return -1; // Don't respond
  
  // Stagger responses but with more variation and context awareness
  const staggerDelay = index * (500 + Math.random() * 1000);
  
  return Math.floor((baseDelay + randomVariation + staggerDelay) * personalityMultiplier);
}

function extractVocabularyFromResponse(content: string): any[] {
  const vocabulary: any[] = [];
  const vocabRegex = /\[VOCAB:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
  let match;
  
  // Simple check to see if the response is primarily in English
  const englishWordsRegex = /\b[a-zA-Z]{2,}\b/g;
  const englishWords = content.match(englishWordsRegex) || [];
  const totalWords = content.split(/\s+/).length;
  const englishRatio = englishWords.length / totalWords;
  
  // Only extract vocabulary if response is primarily English (>50% English words)
  if (englishRatio < 0.5) {
    return vocabulary;
  }
  
  while ((match = vocabRegex.exec(content)) !== null) {
    const term = match[1].trim();
    
    // Additional check: ensure the term itself is English (contains only Latin letters)
    if (/^[a-zA-Z\s\-']+$/.test(term)) {
      vocabulary.push({
        term: term,
        pronunciation: match[2],
        meaning: match[3],
        example: match[4],
        difficulty: 'medium',
        category: 'general'
      });
    }
  }
  
  return vocabulary;
}

function cleanResponseContent(content: string): string {
  // Remove VOCAB tags from the display content
  return content.replace(/\[VOCAB:[^\]]+\]/g, '').trim();
}

function determineInteractionType(content: string): string {
  if (content.includes('?')) return 'question';
  if (content.toLowerCase().includes('haha') || content.includes('😂') || content.includes('😄')) return 'reaction_funny';
  if (content.toLowerCase().includes('đồng ý') || content.toLowerCase().includes('agree') || content.toLowerCase().includes('đúng')) return 'agreement';
  if (content.toLowerCase().includes('không đồng ý') || content.toLowerCase().includes('disagree')) return 'disagreement';
  if (content.includes('@') || content.toLowerCase().includes('này')) return 'mention';
  return 'comment';
}

async function generateGroupChatReaction(ai: AIPersonality, originalAI: AIPersonality, originalContent: string, history: any[]) {
  try {
    // Group chat reactions should be shorter and more casual
    const reactionPrompts = [
      `React naturally to what ${originalAI.name} just said: "${originalContent}". Keep it short and conversational like in a group chat.`,
      `${originalAI.name} mentioned: "${originalContent}". Give a brief, natural reaction as ${ai.name}.`,
      `Respond to ${originalAI.name}'s message in a casual group chat style. Be brief and authentic to your personality.`
    ];
    
    const randomPrompt = reactionPrompts[Math.floor(Math.random() * reactionPrompts.length)];
    
    // Enhanced context with more messages and better formatting
    const historyContext = history.slice(-8).map(msg => {
      const sender = msg.ai_assistant_id ? msg.ai_assistants?.name || 'AI' : 'User';
      const timestamp = new Date(msg.created_at).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `[${timestamp}] ${sender}: ${msg.content}`;
    }).join('\n');

    const prompt = `${ai.system_prompt || `You are ${ai.name}, a ${ai.role} expert in ${ai.field}.`}

## Extended Group Chat Context (Last 8 messages):
${historyContext}

## Current Situation:
${randomPrompt}

## Enhanced Group Chat Guidelines:
- Keep responses very short (1 sentence max)
- Be casual and natural like in a real group chat
- Show your personality: ${ai.personality_traits?.join(', ') || 'helpful'}
- Reference the conversation context when natural
- You can use emoji occasionally
- Sometimes just react briefly or ask a quick question
- Don't always be helpful - sometimes just be social
- Build on what others have said in the conversation
- Show you've been following the discussion

## Context Awareness:
- Consider the overall conversation flow, not just the last message
- React to themes or topics that have been discussed
- Show continuity with your previous responses if any

Respond now as ${ai.name} with full context awareness:`;

    const { apiKey } = await getGeminiApiKey();
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.9, // Higher temperature for more varied reactions
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100, // Short responses for group chat
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) return null;

    // Clean content and extract vocabulary
    const cleanContent = cleanResponseContent(content);
    const vocabulary = extractVocabularyFromResponse(content);

    return {
      content: cleanContent,
      vocabulary,
      confidence: 0.8,
      naturalness: 0.9, // Group reactions are naturally high
      processingTime: Date.now()
    };

  } catch (error) {
    console.error(`Error generating group reaction for ${ai.name}:`, error);
    return null;
  }
}

function determineResponseType(ai: AIPersonality, content: string, history: any[]): string {
  if (content.includes('?')) return 'question_user';
  if (content.toLowerCase().includes('agree') || content.toLowerCase().includes('right')) return 'agreement';
  if (content.toLowerCase().includes('disagree') || content.toLowerCase().includes('however')) return 'disagreement';
  return 'direct_answer';
}

function determineInteractionIntent(ai: AIPersonality, content: string): { type: string; target?: string } | undefined {
  if (content.includes('?')) {
    return { type: 'question_user', target: 'user' };
  }
  return undefined;
}

// Helper function to determine conversation mood
function determineConversationMood(recentMessages: any[]): string {
  if (recentMessages.length === 0) return 'neutral';
  
  const content = recentMessages.map(msg => msg.content?.toLowerCase() || '').join(' ');
  
  if (content.includes('haha') || content.includes('😂') || content.includes('😄') || content.includes('funny')) {
    return 'humorous';
  }
  if (content.includes('help') || content.includes('question') || content.includes('how')) {
    return 'helpful';
  }
  if (content.includes('learn') || content.includes('study') || content.includes('practice')) {
    return 'educational';
  }
  if (content.includes('great') || content.includes('awesome') || content.includes('excellent')) {
    return 'enthusiastic';
  }
  if (content.includes('difficult') || content.includes('hard') || content.includes('problem')) {
    return 'supportive';
  }
  
  return 'conversational';
}

// Helper function to extract key topics from conversation
function extractKeyTopics(conversationText: string): string {
  const commonTopics = [
    'english learning', 'grammar', 'vocabulary', 'pronunciation', 'speaking', 'writing',
    'business', 'technology', 'travel', 'food', 'culture', 'music', 'sports', 'movies',
    'work', 'study', 'career', 'education', 'communication', 'presentation'
  ];
  
  const foundTopics = commonTopics.filter(topic => 
    conversationText.includes(topic.toLowerCase())
  );
  
  return foundTopics.length > 0 ? foundTopics.slice(0, 3).join(', ') : 'general conversation';
}

// Helper function to generate response strategy based on context
function generateResponseStrategy(ai: AIPersonality, recentMessages: any[], userMessage: string): string {
  const lastMessage = recentMessages[recentMessages.length - 1];
  const hasMultipleParticipants = recentMessages.some(msg => 
    msg.ai_assistant_id && msg.ai_assistants?.name !== ai.name
  );
  
  let strategy = '';
  
  if (lastMessage && lastMessage.ai_assistant_id && lastMessage.ai_assistants?.name !== ai.name) {
    strategy += `- Build on what ${lastMessage.ai_assistants.name} just said\n`;
  }
  
  if (hasMultipleParticipants) {
    strategy += '- Acknowledge other participants when relevant\n';
  }
  
  if (userMessage.includes('?')) {
    strategy += '- Address the user\'s question while considering the ongoing discussion\n';
  }
  
  if (recentMessages.length > 3) {
    strategy += '- Reference earlier parts of the conversation if they connect to current topic\n';
  }
  
  return strategy || '- Respond naturally based on your personality and expertise';
}
