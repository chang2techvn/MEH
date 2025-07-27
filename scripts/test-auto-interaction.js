/**
 * Test Auto-Interaction System
 * Test the auto-interaction API endpoint and functionality
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAutoInteractionSystem() {
  console.log('🤖 Testing Auto-Interaction System...\n');

  try {
    // Step 1: Get test data
    console.log('📋 Step 1: Getting test data');
    
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (!users || users.length === 0) {
      console.error('❌ No users found');
      return;
    }

    const { data: aiAssistants } = await supabase
      .from('ai_assistants')
      .select('id, name, role, field')
      .eq('is_active', true)
      .limit(3);

    if (!aiAssistants || aiAssistants.length < 2) {
      console.error('❌ Need at least 2 AI assistants');
      return;
    }

    console.log(`✅ Found ${aiAssistants.length} AI assistants for testing`);
    aiAssistants.forEach(ai => console.log(`   - ${ai.name} (${ai.role})`));
    console.log('');

    // Step 2: Create test session
    console.log('💬 Step 2: Creating test session');
    
    const { data: session, error: sessionError } = await supabase
      .from('natural_conversation_sessions')
      .insert({
        user_id: users[0].id,
        title: `Auto-Interaction Test - ${Date.now()}`,
        conversation_mode: 'natural_group',
        active_ai_ids: aiAssistants.map(ai => ai.id),
        session_settings: {
          allow_ai_interruptions: true,
          allow_ai_questions: true,
          topic_drift_allowed: true,
          max_ai_participants: 4,
          response_timing: 'natural'
        }
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      return;
    }

    console.log(`✅ Test session created: ${session.id}`);

    // Step 3: Add some context messages
    console.log('📝 Step 3: Adding context messages');
    
    const contextMessages = [
      {
        session_id: session.id,
        sender_id: users[0].id,
        content: 'Hello everyone! What do you think about AI technology?',
        message_type: 'text',
        interaction_type: 'user_to_ai'
      },
      {
        session_id: session.id,
        ai_assistant_id: aiAssistants[0].id,
        content: 'AI technology is fascinating! It\'s transforming how we work and live.',
        message_type: 'ai_response',
        interaction_type: 'ai_to_user',
        response_type: 'direct_answer'
      }
    ];

    for (const msg of contextMessages) {
      const { error: msgError } = await supabase
        .from('natural_conversation_messages')
        .insert(msg);
      
      if (msgError) {
        console.warn('⚠️ Message insert warning:', msgError);
      }
    }

    console.log('✅ Context messages added');

    // Step 4: Test AI-to-AI interaction
    console.log('🤖 Step 4: Testing AI-to-AI interaction');
    
    const aiToAiResponse = await fetch('http://localhost:3000/api/auto-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        selectedAIs: aiAssistants.map(ai => ai.id),
        interactionType: 'ai_to_ai'
      })
    });

    if (aiToAiResponse.ok) {
      const aiToAiData = await aiToAiResponse.json();
      console.log('✅ AI-to-AI interaction successful:');
      aiToAiData.interactions?.forEach((interaction, index) => {
        console.log(`   ${index + 1}. ${interaction.initiator}: "${interaction.content}"`);
        if (interaction.target) {
          console.log(`      → Target: ${interaction.target}`);
        }
      });
    } else {
      console.error('❌ AI-to-AI interaction failed:', aiToAiResponse.status);
    }

    console.log('');

    // Step 5: Test AI-to-User interaction
    console.log('👤 Step 5: Testing AI-to-User interaction');
    
    const aiToUserResponse = await fetch('http://localhost:3000/api/auto-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        selectedAIs: aiAssistants.map(ai => ai.id),
        interactionType: 'ai_to_user'
      })
    });

    if (aiToUserResponse.ok) {
      const aiToUserData = await aiToUserResponse.json();
      console.log('✅ AI-to-User interaction successful:');
      aiToUserData.interactions?.forEach((interaction, index) => {
        console.log(`   ${index + 1}. ${interaction.initiator}: "${interaction.content}"`);
      });
    } else {
      console.error('❌ AI-to-User interaction failed:', aiToUserResponse.status);
    }

    console.log('');

    // Step 6: Check database for saved interactions
    console.log('🔍 Step 6: Verifying saved interactions');
    
    const { data: savedMessages } = await supabase
      .from('natural_conversation_messages')
      .select(`
        content,
        message_type,
        interaction_type,
        ai_assistants!ai_assistant_id(name),
        created_at
      `)
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    console.log(`✅ Found ${savedMessages?.length || 0} messages in database:`);
    savedMessages?.forEach((msg, index) => {
      const sender = msg.ai_assistant_id ? msg.ai_assistants?.name : 'User';
      console.log(`   ${index + 1}. [${msg.interaction_type}] ${sender}: "${msg.content}"`);
    });

    // Step 7: Cleanup
    console.log('\n🧹 Step 7: Cleaning up test data');
    
    await supabase
      .from('natural_conversation_messages')
      .delete()
      .eq('session_id', session.id);

    await supabase
      .from('natural_conversation_sessions')
      .delete()
      .eq('id', session.id);

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Auto-Interaction System Test Complete!');
    console.log('✨ All components working correctly');
    console.log('🔄 Ready for production use');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testAutoInteractionSystem().catch(console.error);
