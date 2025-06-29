#!/usr/bin/env node

/**
 * Create Test Conversations and Messages
 * This script creates conversations and messages between the teachers
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestConversations() {
  console.log('💬 Creating test conversations and messages...\n');
  
  const teacher1Id = '3fd6f201-16d1-4c38-8233-513ca600b8fe';
  const teacher2Id = '727a1f51-57fe-4ce6-b41d-69ae40fb2c5c';
  
  // Clean up any existing conversations and messages
  console.log('🧹 Cleaning up existing conversations...');
  await supabase.from('conversation_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('conversation_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Cleaned up existing data');
  
  // Create a conversation between the teachers
  console.log('\n💬 Creating conversation...');
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      title: 'Teacher Collaboration',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (convError) {
    console.error('Error creating conversation:', convError);
    return;
  }
  
  console.log(`✅ Created conversation: ${conversation.id}`);
  
  // Add participants to the conversation
  console.log('\n👥 Adding participants...');
  const participants = [
    {
      conversation_id: conversation.id,
      user_id: teacher1Id,
      joined_at: new Date().toISOString()
    },
    {
      conversation_id: conversation.id,
      user_id: teacher2Id,
      joined_at: new Date().toISOString()
    }
  ];
  
  const { data: participantsData, error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participants)
    .select();
    
  if (participantsError) {
    console.error('Error adding participants:', participantsError);
    return;
  }
  
  console.log(`✅ Added ${participantsData.length} participants`);
  
  // Create some test messages
  console.log('\n📝 Creating test messages...');
  const messages = [
    {
      conversation_id: conversation.id,
      sender_id: teacher1Id,
      content: 'Hi Michael! I wanted to discuss the new curriculum changes.',
      message_type: 'text',
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
    },
    {
      conversation_id: conversation.id,
      sender_id: teacher2Id,
      content: 'Hello Sarah! Yes, I saw the updates. What are your thoughts on the speaking practice modules?',
      message_type: 'text',
      created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 minutes ago
    },
    {
      conversation_id: conversation.id,
      sender_id: teacher1Id,
      content: 'I think they\'re great! The AI evaluation system is really helping students improve their pronunciation.',
      message_type: 'text',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    },
    {
      conversation_id: conversation.id,
      sender_id: teacher2Id,
      content: 'Absolutely! I\'ve noticed students are more engaged with the interactive challenges too.',
      message_type: 'text',
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
    }
  ];
  
  const { data: messagesData, error: messagesError } = await supabase
    .from('conversation_messages')
    .insert(messages)
    .select();
    
  if (messagesError) {
    console.error('Error creating messages:', messagesError);
    return;
  }
  
  console.log(`✅ Created ${messagesData.length} messages`);
  
  // Also create some direct messages (if using the messages table)
  console.log('\n📧 Creating direct messages...');
  const directMessages = [
    {
      sender_id: teacher1Id,
      receiver_id: teacher2Id,
      content: 'Quick question about tomorrow\'s faculty meeting - do you have the agenda?',
      message_type: 'text',
      is_read: false,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    },
    {
      sender_id: teacher2Id,
      receiver_id: teacher1Id,
      content: 'Yes, I\'ll send it over right now. We\'re discussing the new assessment criteria.',
      message_type: 'text',
      is_read: true,
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() // 25 minutes ago
    }
  ];
  
  const { data: directMessagesData, error: directMessagesError } = await supabase
    .from('messages')
    .insert(directMessages)
    .select();
    
  if (directMessagesError) {
    console.error('Error creating direct messages:', directMessagesError);
  } else {
    console.log(`✅ Created ${directMessagesData.length} direct messages`);
  }
  
  // Final verification
  console.log('\n🔍 Final verification...');
  
  const { data: finalConversations, error: finalConvError } = await supabase
    .from('conversations')
    .select('*');
    
  const { data: finalMessages, error: finalMsgError } = await supabase
    .from('conversation_messages')
    .select('*');
    
  const { data: finalDirectMessages, error: finalDirectError } = await supabase
    .from('messages')
    .select('*');
    
  console.log(`📊 Summary:`);
  console.log(`  - Conversations: ${finalConversations?.length || 0}`);
  console.log(`  - Conversation Messages: ${finalMessages?.length || 0}`);
  console.log(`  - Direct Messages: ${finalDirectMessages?.length || 0}`);
  
  if (finalConversations?.length > 0 && finalMessages?.length > 0) {
    console.log('\n✅ Chat system is ready! Both teachers can now send and receive messages.');
  }
}

createTestConversations().catch(console.error);
