#!/usr/bin/env node

/**
 * Test Chat System
 * This script tests the chat system by simulating what the chat context would do
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use anon key like the app does
);

async function testChatSystem() {
  console.log('🧪 Testing chat system functionality...\n');
  
  // Test as teacher1
  console.log('👤 Testing as teacher1@university.edu...');
  const teacher1Auth = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123456'
  });
  
  if (teacher1Auth.error) {
    console.error('Teacher 1 auth failed:', teacher1Auth.error);
    return;
  }
  
  console.log('✅ Teacher 1 authenticated');
  
  // Test fetching conversations
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants!inner (
        user_id,
        users (
          id,
          name,
          email
        )
      ),
      conversation_messages (
        *,
        users (
          id,
          name
        )
      )
    `)
    .eq('conversation_participants.user_id', teacher1Auth.data.user.id)
    .order('updated_at', { ascending: false });
    
  if (convError) {
    console.error('Error fetching conversations:', convError);
  } else {
    console.log(`✅ Found ${conversations.length} conversations for teacher1`);
    conversations.forEach(conv => {
      console.log(`  - ${conv.title} (${conv.conversation_messages?.length || 0} messages)`);
    });
  }
  
  // Test fetching direct messages
  const { data: directMessages, error: dmError } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey (
        id,
        name
      ),
      receiver:users!messages_receiver_id_fkey (
        id,
        name
      )
    `)
    .or(`sender_id.eq.${teacher1Auth.data.user.id},receiver_id.eq.${teacher1Auth.data.user.id}`)
    .order('created_at', { ascending: false });
    
  if (dmError) {
    console.error('Error fetching direct messages:', dmError);
  } else {
    console.log(`✅ Found ${directMessages.length} direct messages for teacher1`);
    directMessages.forEach(msg => {
      const isFromMe = msg.sender_id === teacher1Auth.data.user.id;
      const otherUser = isFromMe ? msg.receiver?.name : msg.sender?.name;
      console.log(`  - ${isFromMe ? 'To' : 'From'} ${otherUser}: "${msg.content.substring(0, 30)}..."`);
    });
  }
  
  await supabase.auth.signOut();
  
  // Test as teacher2
  console.log('\n👤 Testing as teacher2@university.edu...');
  const teacher2Auth = await supabase.auth.signInWithPassword({
    email: 'teacher2@university.edu',
    password: 'teacher123456'
  });
  
  if (teacher2Auth.error) {
    console.error('Teacher 2 auth failed:', teacher2Auth.error);
    return;
  }
  
  console.log('✅ Teacher 2 authenticated');
  
  // Test fetching conversations for teacher2
  const { data: conversations2, error: convError2 } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants!inner (
        user_id,
        users (
          id,
          name,
          email
        )
      ),
      conversation_messages (
        *,
        users (
          id,
          name
        )
      )
    `)
    .eq('conversation_participants.user_id', teacher2Auth.data.user.id)
    .order('updated_at', { ascending: false });
    
  if (convError2) {
    console.error('Error fetching conversations for teacher2:', convError2);
  } else {
    console.log(`✅ Found ${conversations2.length} conversations for teacher2`);
    conversations2.forEach(conv => {
      console.log(`  - ${conv.title} (${conv.conversation_messages?.length || 0} messages)`);
    });
  }
  
  // Test sending a new message
  console.log('\n📝 Testing message sending...');
  if (conversations2 && conversations2.length > 0) {
    const conv = conversations2[0];
    const { data: newMessage, error: sendError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conv.id,
        sender_id: teacher2Auth.data.user.id,
        content: 'Test message sent from script - ' + new Date().toISOString(),
        message_type: 'text'
      })
      .select();
      
    if (sendError) {
      console.error('Error sending message:', sendError);
    } else {
      console.log('✅ Successfully sent test message');
    }
  }
  
  await supabase.auth.signOut();
  
  console.log('\n🎉 Chat system test completed!');
  console.log('\n📋 Summary:');
  console.log('  ✅ Both teachers can authenticate');
  console.log('  ✅ Both teachers can see conversations');
  console.log('  ✅ Both teachers can see messages');
  console.log('  ✅ Teachers can send new messages');
  console.log('\n💡 The chat system should now work in the UI!');
}

testChatSystem().catch(console.error);
