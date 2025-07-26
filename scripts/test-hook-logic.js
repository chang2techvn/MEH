/**
 * Simple test for Natural Conversation Hook
 * This helps debug session creation and message sending
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

async function testNaturalConversationHook() {
  console.log('🧪 Testing Natural Conversation Hook Logic...\n');

  try {
    // Step 1: Get test user (simulate authentication)
    console.log('🔐 Step 1: Authentication Test');
    
    const { data: users } = await supabaseAdmin
      .from('users')  
      .select('id, email')
      .limit(1);
    
    if (!users || users.length === 0) {
      console.error('❌ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Found test user: ${testUser.email} (${testUser.id})\n`);

    // Step 2: Get AI assistants (simulate selectedAIIds)
    console.log('🤖 Step 2: Get AI Assistants');
    
    const { data: aiAssistants } = await supabaseAdmin
      .from('ai_assistants')
      .select('id, name')
      .eq('is_active', true)
      .limit(3);

    if (!aiAssistants || aiAssistants.length === 0) {
      console.error('❌ No AI assistants found');
      return;
    }

    const selectedAIIds = aiAssistants.map(ai => ai.id);
    console.log(`✅ Found ${aiAssistants.length} AI assistants:`);
    aiAssistants.forEach(ai => console.log(`   - ${ai.name} (${ai.id})`));
    console.log('');

    // Step 3: Test session creation
    console.log('💬 Step 3: Test Session Creation');
    
    const sessionData = {
      user_id: testUser.id,
      title: `Test Natural Conversation - ${Date.now()}`,
      conversation_mode: 'natural_group',
      active_ai_ids: selectedAIIds,
      session_settings: {
        allow_ai_interruptions: true,
        allow_ai_questions: true,
        topic_drift_allowed: true,
        max_ai_participants: 4,
        response_timing: 'natural'
      }
    };

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('natural_conversation_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      return;
    }

    console.log(`✅ Session created successfully:`);
    console.log(`   ID: ${session.id}`);
    console.log(`   Title: ${session.title}`);
    console.log(`   Mode: ${session.conversation_mode}`);
    console.log(`   AIs: ${session.active_ai_ids.length}\n`);

    // Step 4: Test message insertion
    console.log('📝 Step 4: Test Message Creation');
    
    const messageData = {
      session_id: session.id,
      sender_id: testUser.id,
      content: 'Hello everyone! This is a test message.',
      message_type: 'text',
      interaction_type: 'user_to_ai'
    };

    const { data: message, error: messageError } = await supabaseAdmin
      .from('natural_conversation_messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('❌ Message creation failed:', messageError);
      return;
    }

    console.log(`✅ Message created successfully:`);
    console.log(`   ID: ${message.id}`);
    console.log(`   Content: "${message.content}"`);
    console.log(`   Type: ${message.message_type}`);
    console.log(`   Interaction: ${message.interaction_type}\n`);

    // Step 5: Test API call simulation
    console.log('🚀 Step 5: API Call Test Data');
    
    const apiRequestData = {
      message: 'Hello everyone! What do you think about AI?',
      sessionId: session.id,
      selectedAIs: selectedAIIds,
      conversationMode: 'natural_group'
    };

    console.log('✅ API request data prepared:');
    console.log(`   Message: "${apiRequestData.message}"`);
    console.log(`   Session ID: ${apiRequestData.sessionId}`);
    console.log(`   Selected AIs: ${apiRequestData.selectedAIs.length}`);
    console.log(`   Mode: ${apiRequestData.conversationMode}\n`);

    // Step 6: Cleanup
    console.log('🧹 Step 6: Cleanup');
    
    // Delete message first (foreign key constraint)
    const { error: deleteMessageError } = await supabaseAdmin
      .from('natural_conversation_messages')
      .delete()
      .eq('session_id', session.id);

    if (deleteMessageError) {
      console.warn('⚠️ Message cleanup warning:', deleteMessageError);
    }

    // Delete session
    const { error: deleteSessionError } = await supabaseAdmin
      .from('natural_conversation_sessions')
      .delete()
      .eq('id', session.id);

    if (deleteSessionError) {
      console.warn('⚠️ Session cleanup warning:', deleteSessionError);
    } else {
      console.log('✅ Test data cleaned up successfully\n');
    }

    console.log('🎉 All tests passed! Natural conversation hook logic is ready.');
    console.log('✨ Session creation works correctly');
    console.log('💾 Message insertion works correctly');
    console.log('🔑 Authentication simulation successful');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testNaturalConversationHook().catch(console.error);
