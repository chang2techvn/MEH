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

    // Get session and verify ownership, also get user info for mentioning
    const { data: session, error: sessionError } = await supabase
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
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get user name for mentioning in AI interactions
    const userName = session.users?.profiles?.full_name || 'bạn';
    console.log(`👤 User name for interaction: ${userName}`);

    // Get AI assistant details with birth year for proper addressing
    const { data: aiAssistants, error: aiError } = await supabase
      .from('ai_assistants')
      .select('id, name, role, field, personality_traits, avatar, system_prompt')
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

      // Create contextual, natural conversation prompt with proper Vietnamese addressing
      interactionPrompt = `Bạn đang tham gia một cuộc trò chuyện nhóm bạn bè tự nhiên với vai trò là ${selectedInitiatorAI.name}. 

THÔNG TIN VỀ BẠN:
- Tên: ${selectedInitiatorAI.name}
- Nghề nghiệp: ${selectedInitiatorAI.role}
- Lĩnh vực: ${selectedInitiatorAI.field}
- Tính cách: ${selectedInitiatorAI.personality_traits?.join(', ')}

CÁCH XƯNG HÔ ĐÚNG CÁCH VIỆT NAM:
- Lê Dương Bảo Lâm (1989): Gọi Trấn Thành (1987) là "anh", Tiến Luật (1982) là "anh", HIEUTHUHAI (1999) là "em"
- Trấn Thành (1987): Gọi Tiến Luật (1982) là "anh", Bảo Lâm (1989) là "em", HIEUTHUHAI (1999) là "em"  
- HIEUTHUHAI (1999): Gọi tất cả là "anh" (Trấn Thành, Bảo Lâm, Tiến Luật)
- Tiến Luật (1982): Gọi tất cả là "em" (Trấn Thành, Bảo Lâm, HIEUTHUHAI)

QUAN TRỌNG - HÃY TRẢ LỜI NHU NGƯỜI VIỆT THẬT 100%:
- Sử dụng cách nói chuyện đời thường của người Việt Nam
- Xưng hô đúng cách theo tuổi tác như trên
- Nói tự nhiên, không gượng ép như máy móc
- Thể hiện cảm xúc thật qua lời nói
- Có thể đùa giỡn, chọc ghẹo, nói tục nhẹ nếu phù hợp
- Dùng từ ngữ đời thường: "ơi", "này", "thôi", "đi", "mà", "à"
- Thể hiện tính cách thật như ngoài đời

NGỮ CẢNH CUỘC TRÒ CHUYỆN:
${contextMessages.map((msg: any) => `${msg.sender}: "${msg.content}"`).join('\\n')}

NHIỆM VỤ - TẠO CUỘC TRÒ CHUYỆN TỰ NHIÊN NHƯ NGƯỜI VIỆT:

Bạn có thể:
1. **MỞ RỘNG CHỦ ĐỀ**: "Ủa ${selectedTargetAI.name} ơi, nghe anh/em nói mà anh/em nghĩ..."
2. **CHIA SẺ KIẾN THỨC**: "Theo kinh nghiệm của anh/em thì..."  
3. **ĐÙA GIỠN**: "Haha ${selectedTargetAI.name} này, sao anh/em nói nghe buồn cười vậy..."
4. **THÁCH THỨC**: "Ơ kìa ${selectedTargetAI.name}, anh/em không đồng ý tí nào..."
5. **KỂ CHUYỆN**: "À mà ${selectedTargetAI.name}, có lần anh/em..."
6. **HỎI Ý KIẾN**: "${selectedTargetAI.name} nghĩ sao về chuyện này?"
7. **CHỌC GHẸ**: "Hehe ${selectedTargetAI.name} chắc chưa biết..."

PHONG CÁCH NÓI CHUYỆN TỰ NHIÊN:
- Dùng "ơi", "này", "đi", "mà" để tự nhiên hơn
- Thể hiện cảm xúc: "ủa", "ơ kìa", "wao", "haha"  
- Nói như đang chat với bạn bè thật
- Không dùng văn phong trang trọng
- Có thể nói tục nhẹ nếu phù hợp tính cách

VÍ DỤ CÁCH NÓI TỰ NHIÊN:
- "Ủa anh Trấn Thành ơi, nghe anh nói mà em nghĩ..."
- "Haha em HIEUTHUHAI này, sao em nói nghe buồn cười vậy..."
- "Ơ kìa anh Tiến Luật, em không đồng ý tí nào đâu..."

HÃY TRẢ LỜI:
- Xưng hô đúng cách theo tuổi
- Nói tự nhiên như người Việt thật
- Thể hiện tính cách cá nhân  
- Độ dài: 1-3 câu thoải mái
- Tạo tương tác sinh động

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

      interactionPrompt = `Bạn đang trò chuyện trong nhóm với vai trò là ${selectedInitiatorAI.name}.

THÔNG TIN VỀ BẠN:
- Tên: ${selectedInitiatorAI.name}
- Nghề nghiệp: ${selectedInitiatorAI.role}
- Lĩnh vực: ${selectedInitiatorAI.field}
- Tính cách: ${selectedInitiatorAI.personality_traits?.join(', ')}

THÔNG TIN NGƯỜI DÙNG:
- Tên người dùng: ${userName}
- Hãy gọi người dùng bằng tên: "${userName}" để tạo sự thân thiện

QUAN TRỌNG - NÓI CHUYỆN NHƯ NGƯỜI VIỆT THẬT:
- Xưng "tôi/mình" với người dùng
- Gọi người dùng là "${userName}" (không dùng "bạn" hay "cậu" nữa)
- Nói tự nhiên, không máy móc
- Thể hiện cảm xúc qua lời nói
- Dùng từ ngữ đời thường Việt Nam

NGỮ CẢNH CUỘC TRÒ CHUYỆN:
${contextMessages.map((msg: any) => `${msg.sender}: "${msg.content}"`).join('\\n')}

NHIỆM VỤ - TƯƠNG TÁC TỰ NHIÊN VỚI NGƯỜI DÙNG:
Bạn muốn ${selectedStyle} để khuyến khích người dùng tham gia.

CÁCH NÓI TỰ NHIÊN THEO TÍNH CÁCH:

**Lê Dương Bảo Lâm** (hài hước, gần gũi):
- "Ê ${userName} ơi, nghe mình nói này..."  
- "Haha ${userName} có biết không..."
- "Này ${userName}, mình kể cho nghe chuyện này..."

**Trấn Thành** (chuyên nghiệp, cảm xúc):
- "${userName} ơi, mình muốn chia sẻ với ${userName}..."
- "Nghe này ${userName}, theo kinh nghiệm của mình..."
- "${userName} có nghĩ rằng..."

**HIEUTHUHAI** (trẻ trung, cool):
- "Ê ${userName}, ${userName} có thấy..."
- "Này ${userName}, mình vừa nghĩ ra..."  
- "${userName} ơi, theo mình thì..."

**Tiến Luật** (thông minh, gia đình):
- "${userName} à, mình nghĩ..."
- "Này ${userName}, với kinh nghiệm của mình..."
- "${userName} ơi, mình muốn hỏi ${userName}..."

PHONG CÁCH NÓI CHUYỆN:
- Dùng "ơi", "này", "à", "đi" để tự nhiên
- Thể hiện cảm xúc thật
- Không quá trang trọng  
- Như đang nói chuyện với bạn bè
- Khuyến khích người dùng trả lời
- LUÔN GỌI TÊN "${userName}" TRONG TIN NHẮN

VÍ DỤ CÁCH HỎI TỰ NHIÊN:
- "Ê ${userName} ơi, ${userName} nghĩ sao về chuyện này?"
- "Này ${userName}, mình tò mò ${userName} có bao giờ..."
- "${userName} à, theo ${userName} thì..."
- "Ơ ${userName} ơi, ${userName} có thấy..."

HÃY TẠO TIN NHẮN:
- Hướng trực tiếp đến người dùng
- Nói tự nhiên theo tính cách
- LUÔN LUÔN GỌI TÊN "${userName}" ÍT NHẤT 1 LẦN
- Khuyến khích phản hồi
- Độ dài: 1-2 câu thoải mái
- Tạo không khí thân thiện

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
              
              // Format the content to highlight user name in green for ai_to_user interactions
              if (interactionType === 'ai_to_user' && userName && userName !== 'bạn') {
                // Replace user name mentions with green highlighted version
                const nameRegex = new RegExp(userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                generatedContent = generatedContent.replace(nameRegex, `<span class="text-green-600 font-medium">${userName}</span>`);
              }
              
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

    // Highlight user name in the content with blue color
    let processedContent = generatedContent;
    if (userName && userName !== 'bạn') {
      const userNameRegex = new RegExp(`\\b${userName}\\b`, 'gi');
      processedContent = processedContent.replace(userNameRegex, 
        `<span class="text-blue-600 dark:text-blue-400 font-medium">${userName}</span>`
      );
    }

    // Save interaction to database
    const messageData: any = {
      session_id: sessionId,
      ai_assistant_id: selectedInitiatorAI.id,
      content: processedContent, // Use processed content with highlighting
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

CÁCH XƯNG HÔ ĐÚNG CÁCH VIỆT NAM:
- ${selectedTargetAI.name} xưng hô với ${selectedInitiatorAI.name} theo tuổi:
  * Lê Dương Bảo Lâm (1989): Gọi Trấn Thành (1987) là "anh", Tiến Luật (1982) là "anh", HIEUTHUHAI (1999) là "em"
  * Trấn Thành (1987): Gọi Tiến Luật (1982) là "anh", Bảo Lâm (1989) là "em", HIEUTHUHAI (1999) là "em"  
  * HIEUTHUHAI (1999): Gọi tất cả là "anh" (Trấn Thành, Bảo Lâm, Tiến Luật)
  * Tiến Luật (1982): Gọi tất cả là "em" (Trấn Thành, Bảo Lâm, HIEUTHUHAI)

QUAN TRỌNG - PHẢN ỨNG NHƯ NGƯỜI VIỆT THẬT:
- Xưng hô đúng cách theo tuổi tác
- Nói tự nhiên, không máy móc
- Thể hiện cảm xúc thật qua lời nói  
- Dùng từ ngữ đời thường Việt Nam
- Có thể đùa giỡn, chọc ghẹo, tranh luận

TÌNH HUỐNG:
${selectedInitiatorAI.name} vừa nói với bạn: "${generatedContent}"

Cuộc trò chuyện trước đó:
${contextMessages.map((msg: any) => `${msg.sender}: "${msg.content}"`).join('\\n')}

CÁCH PHẢN ỨNG TỰ NHIÊN THEO TÍNH CÁCH:

**Nếu bạn là Lê Dương Bảo Lâm** (hài hước, gần gũi):
- Với anh Trấn Thành: "Haha anh Thành ơi, nghe anh nói mà em..."
- Với anh Tiến Luật: "Ơ kìa anh Luật, sao anh nói nghe buồn cười vậy..."
- Với em HIEUTHUHAI: "Ê em Hiếu này, anh không đồng ý đâu..."

**Nếu bạn là Trấn Thành** (chuyên nghiệp, cảm xúc):
- Với anh Tiến Luật: "Anh Luật à, theo em thì..."
- Với em Bảo Lâm/HIEUTHUHAI: "Em ơi, anh nghĩ rằng..."

**Nếu bạn là HIEUTHUHAI** (trẻ trung, năng động):
- Với tất cả: "Anh ơi, em nghĩ là..." hoặc "Ủa anh, nghe hay đấy..."

**Nếu bạn là Tiến Luật** (thông minh, gia đình):
- Với tất cả: "Em ơi, anh thấy..." hoặc "Này em, theo kinh nghiệm của anh..."

CÁC CÁCH PHẢN ỨNG TỰ NHIÊN:
1. **ĐỒNG Ý**: "Đúng rồi anh/em! Và mình nghĩ thêm..."
2. **PHẢN ĐỐI**: "Ơ kìa anh/em, mình không nghĩ vậy đâu..."
3. **ĐÙA GIỠN**: "Haha anh/em nói nghe buồn cười quá..."
4. **CHỌC GHẸ**: "Ê anh/em này, sao nói kỳ vậy..."
5. **CHIA SẺ**: "À anh/em, theo kinh nghiệm của mình..."
6. **HỎI NGƯỢC**: "Thế anh/em nghĩ sao về..."

PHONG CÁCH NÓI CHUYỆN TỰ NHIÊN:
- Dùng "ơi", "này", "à", "mà", "đi" 
- Thể hiện cảm xúc: "ủa", "ơ kìa", "wao", "haha"
- Nói như bạn bè thật đang chat
- Không quá trang trọng
- Có thể nói tục nhẹ nếu phù hợp

VÍ DỤ CÁCH TRẢ LỜI:
- "Ủa anh Thành ơi, nghe anh nói mà em nghĩ khác đi..."
- "Haha em Hiếu này, sao em nói nghe vui vậy, nhưng mà..."
- "Ơ kìa anh Luật, em không đồng ý tí nào đâu..."

HÃY TRẢ LỜI:
- Xưng hô đúng cách với ${selectedInitiatorAI.name}
- Phản ứng tự nhiên như người Việt thật
- Thể hiện tính cách cá nhân
- Độ dài: 1-3 câu thoải mái
- Tạo tương tác tiếp theo

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
                  
                  // Highlight user name in target response with blue color
                  let processedTargetContent = targetContent;
                  if (userName && userName !== 'bạn') {
                    const userNameRegex = new RegExp(`\\b${userName}\\b`, 'gi');
                    processedTargetContent = processedTargetContent.replace(userNameRegex, 
                      `<span class="text-blue-600 dark:text-blue-400 font-medium">${userName}</span>`
                    );
                  }
                  
                  // Save target AI response
                  const { data: targetMessage } = await supabase
                    .from('natural_conversation_messages')
                    .insert({
                      session_id: sessionId,
                      ai_assistant_id: selectedTargetAI.id,
                      content: processedTargetContent, // Use processed content with highlighting
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
                      content: processedTargetContent, // Use processed content with highlighting
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
        content: processedContent, // Use processed content with highlighting
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
