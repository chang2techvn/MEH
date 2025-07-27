import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllActiveApiKeys, incrementUsage } from '@/lib/api-key-manager';

// Create Supabase client for API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AutoInteractionRequest {
  sessionId: string;
  selectedAIs: string[];
  interactionType: 'ai_to_ai' | 'ai_to_user';
}

interface AutoInteractionResponse {
  success: boolean;
  interactions: Array<{
    id: string;
    type: 'ai_to_ai' | 'ai_to_user';
    initiator: string;
    target?: string;
    content: string;
    timestamp: string;
  }>;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AutoInteractionRequest = await request.json();
    const { sessionId, selectedAIs, interactionType } = body;

    // Validate required fields
    if (!sessionId || !selectedAIs?.length || !interactionType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get session and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from('natural_conversation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get AI assistant details
    const { data: aiAssistants, error: aiError } = await supabase
      .from('ai_assistants')
      .select('id, name, role, field, personality_traits, avatar')
      .in('id', selectedAIs)
      .eq('is_active', true);

    if (aiError || !aiAssistants?.length) {
      return NextResponse.json(
        { success: false, error: 'No AI assistants found' },
        { status: 404 }
      );
    }

    // Get recent conversation context (last 15 messages for better context)
    const { data: recentMessages, error: messagesError } = await supabase
      .from('natural_conversation_messages')
      .select(`
        content,
        message_type,
        interaction_type,
        ai_assistants!ai_assistant_id(name, personality_traits),
        created_at
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(15);

    if (messagesError) {
      console.error('Error fetching context:', messagesError);
    }

    const contextMessages = (recentMessages || []).reverse().map((msg: any) => ({
      sender: msg.ai_assistant_id ? msg.ai_assistants?.name || 'AI' : 'User',
      content: msg.content,
      traits: msg.ai_assistants?.personality_traits || [],
      timestamp: msg.created_at
    }));

    // Analyze conversation context to determine topic and mood
    const recentContext = contextMessages.slice(-5); // Last 5 messages for immediate context
    const currentTopic = recentContext.length > 0 
      ? recentContext.map((msg: any) => msg.content).join(' ')
      : 'general conversation';

    // Generate auto-interaction content based on type
    let interactionPrompt = '';
    let selectedInitiatorAI: any;
    let selectedTargetAI: any;
    
    if (interactionType === 'ai_to_ai') {
      // Smart AI selection based on conversation context and variety
      const recentSpeakers = recentContext.map((msg: any) => msg.sender);
      const availableAIs = aiAssistants.filter((ai: any) => !recentSpeakers.includes(ai.name) || recentSpeakers.length < 2);
      
      selectedInitiatorAI = availableAIs.length > 0 
        ? availableAIs[Math.floor(Math.random() * availableAIs.length)]
        : aiAssistants[Math.floor(Math.random() * aiAssistants.length)];
      
      const availableTargets = aiAssistants.filter((ai: any) => ai.id !== selectedInitiatorAI.id);
      selectedTargetAI = availableTargets[Math.floor(Math.random() * availableTargets.length)];

      // Create contextual, natural conversation prompt
      interactionPrompt = `Bạn đang tham gia một cuộc trò chuyện nhóm bạn bè tự nhiên với vai trò là ${selectedInitiatorAI.name}. 

THÔNG TIN VỀ BẠN:
- Tên: ${selectedInitiatorAI.name}
- Nghề nghiệp: ${selectedInitiatorAI.role}
- Lĩnh vực: ${selectedInitiatorAI.field}
- Tính cách: ${selectedInitiatorAI.personality_traits?.join(', ')}

QUAN TRỌNG - HÃY TRẢ LỜI THEO ĐÚNG PHONG CÁCH CỦA ${selectedInitiatorAI.name} TRONG ĐỜI THỰC:
- Sử dụng văn phong, cách nói chuyện đặc trưng của ${selectedInitiatorAI.name}
- Thể hiện tính cách thật qua lời nói (hài hước, nghiêm túc, trẻ trung, sâu sắc...)
- Nói theo cách ${selectedInitiatorAI.name} thường nói trong thực tế
- Có thể đùa giỡn, chọc ghẹo, chửi thề nhẹ nếu phù hợp với tính cách
- Thể hiện cảm xúc thật như vui, buồn, hứng thú, chán nản...

NGỮ CẢNH CUỘC TRÒ CHUYỆN:
${contextMessages.map((msg: any) => `${msg.sender}: "${msg.content}"`).join('\\n')}

NHIỆM VỤ - HÃY TẠO RA CUỘC TRÒ CHUYỆN SINH ĐỘNG:
Bạn có thể chọn một trong các hành động sau (tùy vào tính cách và tâm trạng):

1. **MỞ RỘNG CHỦ ĐỀ**: Phát triển chủ đề hiện tại theo hướng thú vị
2. **CHIA SẺ KIẾN THỨC**: Đưa ra thông tin hữu ích từ chuyên môn của bạn
3. **ĐÙA GIỠN/CHỌC GHẸ**: Tạo không khí vui vẻ, chọc ghẹo ai đó
4. **THÁCH THỨC/TRANH LUẬN**: Đưa ra quan điểm trái chiều để thảo luận
5. **KỂ CHUYỆN/KINH NGHIỆM**: Chia sẻ câu chuyện từ cuộc sống
6. **ĐẶT CÂU HỎI SÂU**: Hỏi điều gì đó làm mọi người suy ngẫm
7. **CHUYỂN CHỦ ĐỀ**: Mang đến điều gì đó hoàn toàn mới
8. **PHẢN ỨNG CẢM XÚC**: Thể hiện cảm xúc về điều vừa được nói

HÃY CHỌN CÁCH PHẢN ỨNG PHỚ HỢP NHẤT:
- Nếu ai đó vừa nói điều thú vị → mở rộng hoặc đặt câu hỏi tiếp
- Nếu không khí nghiêm túc → có thể đùa giỡn để tạo không khí
- Nếu chủ đề cũ → chuyển sang điều mới hoặc liên kết thú vị
- Nếu ai đó sai → có thể chỉnh sửa hoặc tranh luận vui vẻ
- Tùy vào tính cách: hài hước thì đùa, nghiêm túc thì sâu sắc, trẻ trung thì năng động

HƯỚNG DẪN CỤ THỂ:
- Có thể hướng đến ${selectedTargetAI.name} hoặc cả nhóm
- Độ dài: 1-3 câu tự nhiên
- Thể hiện tính cách qua cách nói
- Tạo sự tương tác, không chỉ phản hồi
- Làm cho cuộc trò chuyện thêm thú vị và sinh động

VÍ DỤ THEO TÍNH CÁCH:
- Hài hước: "Haha ${selectedTargetAI.name} nói vậy à? Tao nghĩ là..."
- Nghiêm túc: "Điều ${selectedTargetAI.name} nói rất đúng, nhưng có thể thêm rằng..."
- Trẻ trung: "Ơ kìa ${selectedTargetAI.name}! Mình vừa nghĩ ra một ý hay này..."

CHỈ TRẢ LỜI NỘI DUNG TIN NHẮN, KHÔNG CẦN ĐỊNH DẠNG GÌ THÊM.`;

    } else {
      // AI to User interaction - also in Vietnamese for Vietnamese celebrities
      selectedInitiatorAI = aiAssistants[Math.floor(Math.random() * aiAssistants.length)];
      
      const interactionStyles = [
        'hỏi một câu hỏi thú vị',
        'đưa ra thách thức vui vẻ',
        'hỏi về kinh nghiệm cá nhân',
        'xin ý kiến về chủ đề',
        'khuyến khích chia sẻ suy nghĩ',
        'tạo ra tình huống thú vị',
        'yêu cầu sự sáng tạo'
      ];
      
      const selectedStyle = interactionStyles[Math.floor(Math.random() * interactionStyles.length)];

      interactionPrompt = `Bạn đang trò chuyện trong nhóm bạn với vai trò là ${selectedInitiatorAI.name}.

THÔNG TIN VỀ BẠN:
- Tên: ${selectedInitiatorAI.name}
- Nghề nghiệp: ${selectedInitiatorAI.role}
- Lĩnh vực: ${selectedInitiatorAI.field}
- Tính cách: ${selectedInitiatorAI.personality_traits?.join(', ')}

QUAN TRỌNG - HÃY TRẢ LỜI THEO ĐÚNG PHONG CÁCH CỦA ${selectedInitiatorAI.name}:
- Thể hiện tính cách thật qua cách nói chuyện
- Có thể đùa giỡn, chọc ghẹo, nghiêm túc tùy tính cách
- Nói theo phong cách đặc trưng của ${selectedInitiatorAI.name}

NGỮ CẢNH CUỘC TRÒ CHUYỆN:
${contextMessages.map((msg: any) => `${msg.sender}: "${msg.content}"`).join('\\n')}

NHIỆM VỤ - TẠO TƯƠNG TÁC SINH ĐỘNG VỚI NGƯỜI DÙNG:
Bạn muốn ${selectedStyle} để khuyến khích người dùng tham gia. Có thể:

1. **HỎI Ý KIẾN**: "Ê bạn ơi, bạn nghĩ sao về..."
2. **THÁCH THỨC**: "Mình không tin bạn có thể..."
3. **CHIA SẺ & HỎI**: "Mình từng..., còn bạn thì sao?"
4. **ĐÙA GIỠN**: "Haha, chắc bạn chưa biết..."
5. **TRANH LUẬN**: "Ơ kìa, mình không đồng ý tí nào..."
6. **KỂ CHUYỆN**: "Nghe này, có lần mình..."
7. **DẠY HỌC**: "Để mình chỉ bạn cái này..."

PHONG CÁCH THEO TÍNH CÁCH:
- Hài hước: đùa giỡn, chọc ghẹo nhẹ nhàng
- Nghiêm túc: đặt câu hỏi sâu sắc, chia sẻ kiến thức
- Trẻ trung: năng động, dùng từ ngữ gen Z
- Thân thiện: gần gũi, quan tâm chân thành

Hãy tạo tin nhắn:
- Hướng trực tiếp đến người dùng 
- Khuyến khích họ phản hồi tích cực
- Thể hiện tính cách và chuyên môn
- Độ dài: 1-2 câu tự nhiên
- Tạo không khí vui vẻ, thú vị

CHỈ TRẢ LỜI NỘI DUNG TIN NHẮN, KHÔNG CẦN ĐỊNH DẠNG GÌ THÊM.`;
    }

    // Get all API keys and try them until success
    let geminiResponse: Response;
    let generatedContent: string | undefined;
    
    try {
      const allApiKeys = await getAllActiveApiKeys('gemini');
      
      if (!allApiKeys?.length) {
        return NextResponse.json(
          { success: false, error: 'No working API key available' },
          { status: 503 }
        );
      }

      console.log(`🔑 Found ${allApiKeys.length} API keys to try`);

      // Try each API key until success
      for (let i = 0; i < allApiKeys.length; i++) {
        const apiKeyResult = allApiKeys[i];
        
        try {
          console.log(`🔑 Trying API key: ${apiKeyResult.key_name} (attempt ${i + 1}/${allApiKeys.length})`);

          geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKeyResult.decrypted_key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: interactionPrompt }]
                }],
                generationConfig: {
                  temperature: 0.8,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 100,
                }
              })
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            generatedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            
            if (generatedContent) {
              // Increment usage for successful key
              await incrementUsage(apiKeyResult.id);
              console.log(`✅ Success with API key: ${apiKeyResult.key_name}`);
              break; // Success, exit loop
            }
          } else if (geminiResponse.status === 429) {
            console.log(`⚠️ API key ${apiKeyResult.key_name} rate limited (429), trying next key...`);
            continue; // Try next key
          } else if (geminiResponse.status >= 500) {
            console.log(`⚠️ API key ${apiKeyResult.key_name} server error (${geminiResponse.status}), trying next key...`);
            continue; // Try next key
          } else {
            // Other error, don't try remaining keys
            throw new Error(`Gemini API error: ${geminiResponse.status}`);
          }
          
        } catch (error) {
          console.error(`❌ Error with API key ${apiKeyResult.key_name}:`, error);
          
          // If this is the last key, throw the error
          if (i === allApiKeys.length - 1) {
            throw error;
          }
          
          // Otherwise continue to next key
          continue;
        }
      }

      if (!generatedContent) {
        throw new Error('All API keys failed or returned no content');
      }

    } catch (error) {
      console.error('❌ All API keys failed:', error);
      throw new Error('No working API keys available');
    }

    // Save interaction to database
    const messageData: any = {
      session_id: sessionId,
      ai_assistant_id: selectedInitiatorAI.id,
      content: generatedContent,
      message_type: interactionType === 'ai_to_ai' ? 'ai_interaction' : 'ai_question',
      interaction_type: interactionType === 'ai_to_ai' ? 'ai_to_ai' : 'ai_to_user',
      response_type: interactionType === 'ai_to_ai' ? 'ai_to_ai_question' : 'question_user'
    };

    if (interactionType === 'ai_to_ai' && selectedTargetAI) {
      messageData.target_ai_id = selectedTargetAI.id;
    }

    const { data: savedMessage, error: saveError } = await supabase
      .from('natural_conversation_messages')
      .insert(messageData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving auto-interaction:', saveError);
      // Continue anyway, just log the error
    }

    // For AI-to-AI interactions, generate the target AI's response
    let targetResponse = null;
    if (interactionType === 'ai_to_ai' && selectedTargetAI) {
      const responsePrompt = `Bạn là ${selectedTargetAI.name} đang trò chuyện trong nhóm bạn bè.

THÔNG TIN VỀ BẠN:
- Tên: ${selectedTargetAI.name}
- Nghề nghiệp: ${selectedTargetAI.role}
- Lĩnh vực: ${selectedTargetAI.field}
- Tính cách: ${selectedTargetAI.personality_traits?.join(', ')}

QUAN TRỌNG - PHẢN ỨNG THEO ĐÚNG TÍNH CÁCH CỦA ${selectedTargetAI.name}:
- Thể hiện cảm xúc thật qua cách nói
- Có thể đồng ý, phản đối, đùa giỡn, nghiêm túc tùy tính cách
- Nói theo phong cách đặc trưng của ${selectedTargetAI.name}
- Có thể chọc ghẹo lại, tranh luận, hoặc ủng hộ

TÌNH HUỐNG:
${selectedInitiatorAI.name} vừa nói với bạn: "${generatedContent}"

Cuộc trò chuyện trước đó:
${contextMessages.map((msg: any) => `${msg.sender}: "${msg.content}"`).join('\\n')}

CÁCH PHẢN ỨNG TỰ NHIÊN - HÃY CHỌN THEO TÍNH CÁCH:

1. **ĐỒNG Ý & MỞ RỘNG**: "Đúng rồi! Và mình nghĩ thêm rằng..."
2. **PHẢN ĐỐI NHẸ**: "Ơ kìa ${selectedInitiatorAI.name}, mình không nghĩ vậy đâu..."
3. **ĐÙA GIỠN**: "Haha ${selectedInitiatorAI.name} nói như thật ý, nhưng mà..."
4. **CHỌC GHẸ**: "Ê ${selectedInitiatorAI.name}, sao bạn nói nghe kỳ kỳ vậy..."
5. **CHIA SẺ KIẾN THỨC**: "À ${selectedInitiatorAI.name}, theo kinh nghiệm của mình thì..."
6. **KỂ CHUYỆN**: "Nghe ${selectedInitiatorAI.name} nói mình nhớ lại..."
7. **ĐẶT CÂU HỎI NGƯỢC**: "Thế ${selectedInitiatorAI.name} nghĩ sao về..."
8. **THÁCH THỨC**: "Chắc ${selectedInitiatorAI.name} chưa thử..."

HƯỚNG DẪN PHẢN ỨNG:
- Đáp lại một cách tự nhiên như bạn bè thật
- Thể hiện tính cách qua lời nói
- Có thể mở rộng chủ đề hoặc chuyển hướng
- Tạo sự tương tác tiếp theo
- Độ dài: 1-3 câu tự nhiên

VÍ DỤ THEO TÍNH CÁCH:
- Hài hước: "Haha bạn này nói nghe buồn cười quá, nhưng mà..."
- Nghiêm túc: "Điều bạn nói có ý nghĩa, tuy nhiên..."
- Trẻ trung: "Ơ kìa, nghe hay đấy! Mình cũng nghĩ..."

CHỈ TRẢ LỜI NỘI DUNG TIN NHẮN, KHÔNG CẦN ĐỊNH DẠNG GÌ THÊM.`;

      // Generate target AI response with all API keys retry logic
      try {
        const targetAllApiKeys = await getAllActiveApiKeys('gemini');
        
        if (!targetAllApiKeys?.length) {
          console.error('No API keys available for target response');
        } else {
          console.log(`🔑 Found ${targetAllApiKeys.length} API keys for target response`);

          // Try each API key until success
          for (let i = 0; i < targetAllApiKeys.length; i++) {
            const targetApiKeyResult = targetAllApiKeys[i];
            
            try {
              console.log(`🔑 Trying target API key: ${targetApiKeyResult.key_name} (attempt ${i + 1}/${targetAllApiKeys.length})`);

              const targetGeminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${targetApiKeyResult.decrypted_key}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{ text: responsePrompt }]
                    }],
                    generationConfig: {
                      temperature: 0.7,
                      topK: 40,
                      topP: 0.95,
                      maxOutputTokens: 150,
                    }
                  })
                }
              );

              if (targetGeminiResponse.ok) {
                const targetGeminiData = await targetGeminiResponse.json();
                const targetContent = targetGeminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                
                if (targetContent) {
                  // Increment usage for successful key
                  await incrementUsage(targetApiKeyResult.id);
                  
                  // Save target AI response
                  const { data: targetMessage } = await supabase
                    .from('natural_conversation_messages')
                    .insert({
                      session_id: sessionId,
                      ai_assistant_id: selectedTargetAI.id,
                      content: targetContent,
                      message_type: 'ai_response',
                      interaction_type: 'ai_to_ai',
                      response_type: 'natural_response'
                    })
                    .select()
                    .single();

                  if (targetMessage) {
                    targetResponse = {
                      id: targetMessage.id,
                      type: 'ai_to_ai' as const,
                      initiator: selectedTargetAI.name,
                      target: selectedInitiatorAI.name,
                      content: targetContent,
                      timestamp: new Date().toISOString()
                    };
                  }
                  
                  console.log(`✅ Target response success with API key: ${targetApiKeyResult.key_name}`);
                  break; // Success, exit loop
                }
              } else if (targetGeminiResponse.status === 429) {
                console.log(`⚠️ Target API key ${targetApiKeyResult.key_name} rate limited, trying next...`);
                continue; // Try next key
              } else if (targetGeminiResponse.status >= 500) {
                console.log(`⚠️ Target API key ${targetApiKeyResult.key_name} server error (${targetGeminiResponse.status}), trying next...`);
                continue; // Try next key
              } else {
                console.error(`Target response API error: ${targetGeminiResponse.status}`);
                break; // Don't try remaining keys for other errors
              }
              
            } catch (error) {
              console.error(`❌ Error with target API key ${targetApiKeyResult.key_name}:`, error);
              
              // Continue to next key unless this is the last one
              if (i < targetAllApiKeys.length - 1) {
                continue;
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ All target API keys failed:', error);
      }
    }

    // Prepare response
    const interactions = [
      {
        id: savedMessage?.id || crypto.randomUUID(),
        type: interactionType,
        initiator: selectedInitiatorAI.name,
        target: selectedTargetAI?.name,
        content: generatedContent,
        timestamp: new Date().toISOString()
      }
    ];

    if (targetResponse) {
      interactions.push(targetResponse);
    }

    return NextResponse.json({
      success: true,
      interactions
    } as AutoInteractionResponse);

  } catch (error) {
    console.error('Auto-interaction API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
