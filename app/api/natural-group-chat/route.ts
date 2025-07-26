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
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, selectedAIs, conversationMode = 'natural_group' }: NaturalConversationRequest = await request.json();

    if (!message || !sessionId || !selectedAIs || selectedAIs.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get AI personalities from database
    const { data: aiPersonalities, error: aiError } = await supabase
      .from('ai_assistants')
      .select('*')
      .in('id', selectedAIs)
      .eq('is_active', true);

    if (aiError || !aiPersonalities || aiPersonalities.length === 0) {
      return NextResponse.json(
        { error: 'Failed to get AI personalities' },
        { status: 500 }
      );
    }

    // Create a readable stream for server-sent events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get conversation history for context
          const { data: conversationHistory } = await supabase
            .from('natural_conversation_messages')
            .select(`
              *,
              ai_assistants!ai_assistant_id(name)
            `)
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(10);

          const recentMessages = (conversationHistory || []).reverse();

          // Process each AI personality for natural conversation
          const responses = await Promise.allSettled(
            aiPersonalities.map(async (ai: AIPersonality, index: number) => {
              // Natural delay based on AI personality and response type
              const delay = calculateNaturalDelay(ai, index);
              await new Promise(resolve => setTimeout(resolve, delay));

              return generateNaturalAIResponse(ai, message, recentMessages);
            })
          );

          // Stream successful responses
          for (let i = 0; i < responses.length; i++) {
            const result = responses[i];
            
            if (result.status === 'fulfilled' && result.value) {
              const response = result.value;
              const ai = aiPersonalities[i];

              // Save AI response to database
              const { error: saveError } = await supabase
                .from('natural_conversation_messages')
                .insert({
                  session_id: sessionId,
                  ai_assistant_id: ai.id,
                  content: response.content,
                  message_type: 'ai_response',
                  response_type: response.responseType,
                  interaction_type: 'ai_to_user',
                  confidence_score: response.confidence,
                  naturalness_score: response.naturalness,
                  vocabulary: response.vocabulary,
                  processing_time: response.processingTime
                });

              if (saveError) {
                console.error('Error saving AI message:', saveError);
              }

              // Stream the response
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
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
                  processingTime: response.processingTime
                },
                timestamp: new Date().toISOString()
              })}\n\n`));

              // Check for AI-to-AI interactions
              if (response.interactionIntent?.type === 'question_ai' && aiPersonalities.length > 1) {
                const targetAI = aiPersonalities.find(target => target.id !== ai.id);
                if (targetAI) {
                  const aiToAIDelay = 1000 + Math.random() * 2000; // 1-3 seconds
                  await new Promise(resolve => setTimeout(resolve, aiToAIDelay));

                  const followUpResponse = await generateAIToAIResponse(targetAI, ai, response.content);
                  
                  if (followUpResponse) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'ai_to_ai_interaction',
                      response: {
                        initiatingAI: ai.name,
                        targetAI: targetAI.name,
                        response: followUpResponse.content,
                        interactionType: 'ai_to_ai_response',
                        timestamp: new Date().toISOString()
                      }
                    })}\n\n`));
                  }
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to process natural conversation'
          })}\n\n`));
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
  conversationHistory: any[]
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Build context-aware prompt
    const contextPrompt = buildNaturalConversationPrompt(ai, userMessage, conversationHistory);
    
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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
  conversationHistory: any[]
): string {
  const historyContext = conversationHistory
    .slice(-5) // Last 5 messages for context
    .map(msg => `${msg.ai_assistant_id ? msg.ai_assistants?.name || 'AI' : 'User'}: ${msg.content}`)
    .join('\n');

  return `
You are ${ai.name}, ${ai.role} in ${ai.field}.
${ai.system_prompt || `You are an expert in ${ai.field} helping users learn English through natural conversation.`}

## Recent Conversation:
${historyContext}

## User's New Message:
User: ${userMessage}

## Your Response Guidelines:
- Be natural and conversational like a real person
- Stay true to your personality: ${ai.personality_traits?.join(', ') || 'helpful'}
- Provide helpful insights from your ${ai.field} expertise
- Keep responses concise (1-2 sentences typically)
- Include relevant vocabulary when natural: [VOCAB:term|pronunciation|meaning|example]
- Sometimes ask follow-up questions to keep conversation engaging
- Show genuine interest and react naturally to the conversation

## Format:
Respond naturally as ${ai.name}. If you include vocabulary, use this format:
[VOCAB:presentation|ˌprezənˈteɪʃən|bài thuyết trình|I need to prepare a presentation for tomorrow.]

Respond now:`;
}

function calculateNaturalDelay(ai: AIPersonality, index: number): number {
  const baseDelay = 800; // 0.8 seconds
  const randomVariation = Math.random() * 1000; // 0-1 second variation
  const indexDelay = index * 300; // Stagger responses by 300ms
  
  // Personality-based adjustments
  let personalityMultiplier = 1.0;
  if (ai.personality_traits?.includes('quick_thinker')) personalityMultiplier = 0.7;
  if (ai.personality_traits?.includes('thoughtful')) personalityMultiplier = 1.3;
  
  return Math.floor((baseDelay + randomVariation + indexDelay) * personalityMultiplier);
}

function extractVocabularyFromResponse(content: string): any[] {
  const vocabulary: any[] = [];
  const vocabRegex = /\[VOCAB:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
  let match;
  
  while ((match = vocabRegex.exec(content)) !== null) {
    vocabulary.push({
      term: match[1],
      pronunciation: match[2],
      meaning: match[3],
      example: match[4],
      difficulty: 'medium',
      category: 'general'
    });
  }
  
  return vocabulary;
}

function cleanResponseContent(content: string): string {
  // Remove VOCAB tags from the display content
  return content.replace(/\[VOCAB:[^\]]+\]/g, '').trim();
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
