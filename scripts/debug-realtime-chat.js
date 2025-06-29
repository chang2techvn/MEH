#!/usr/bin/env node

/**
 * Debug Realtime Chat Script
 * This script tests the real-time chat functionality step by step
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugRealtimeChat() {
  console.log('🔍 Debugging realtime chat functionality...\n');
  
  // Step 1: Test authentication for both teachers
  console.log('👤 Step 1: Testing authentication...');
  
  const teacher1Auth = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123456'
  });
  
  if (teacher1Auth.error) {
    console.error('❌ Teacher 1 auth failed:', teacher1Auth.error);
    return;
  }
  
  console.log('✅ Teacher 1 authenticated:', teacher1Auth.data.user.id);
  const teacher1Id = teacher1Auth.data.user.id;
  
  await supabase.auth.signOut();
  
  const teacher2Auth = await supabase.auth.signInWithPassword({
    email: 'teacher2@university.edu',
    password: 'teacher123456'
  });
  
  if (teacher2Auth.error) {
    console.error('❌ Teacher 2 auth failed:', teacher2Auth.error);
    return;
  }
  
  console.log('✅ Teacher 2 authenticated:', teacher2Auth.data.user.id);
  const teacher2Id = teacher2Auth.data.user.id;
  
  // Step 2: Test conversation access
  console.log('\n💬 Step 2: Testing conversation access...');
  
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
      )
    `)
    .eq('conversation_participants.user_id', teacher2Id);
    
  if (convError) {
    console.error('❌ Error fetching conversations:', convError);
    return;
  }
  
  console.log(`✅ Teacher 2 can see ${conversations.length} conversations`);
  
  if (conversations.length === 0) {
    console.log('⚠️ No conversations found for teacher 2!');
    return;
  }
  
  const conversation = conversations[0];
  console.log(`Using conversation: ${conversation.title} (ID: ${conversation.id})`);
  
  // Step 3: Test message insertion
  console.log('\n📝 Step 3: Testing message insertion...');
  
  const testMessage = {
    conversation_id: conversation.id,
    sender_id: teacher2Id,
    content: `Test message from teacher2 - ${new Date().toISOString()}`,
    message_type: 'text',
    created_at: new Date().toISOString()
  };
  
  console.log('Attempting to insert message:', testMessage);
  
  const { data: newMessage, error: insertError } = await supabase
    .from('conversation_messages')
    .insert(testMessage)
    .select();
    
  if (insertError) {
    console.error('❌ Error inserting message:', insertError);
    console.log('🔍 Checking RLS policies...');
    
    // Check if user exists in users table
    const { data: userCheck, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', teacher2Id);
      
    if (userError) {
      console.error('❌ Error checking user:', userError);
    } else if (userCheck.length === 0) {
      console.error('❌ Teacher 2 not found in users table!');
    } else {
      console.log('✅ Teacher 2 exists in users table:', userCheck[0].name);
    }
    
    return;
  }
  
  console.log('✅ Message inserted successfully:', newMessage[0]);
  
  // Step 4: Test message retrieval
  console.log('\n📥 Step 4: Testing message retrieval...');
  
  const { data: messages, error: msgError } = await supabase
    .from('conversation_messages')
    .select(`
      *,
      users (
        id,
        name
      )
    `)
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true });
    
  if (msgError) {
    console.error('❌ Error fetching messages:', msgError);
  } else {
    console.log(`✅ Retrieved ${messages.length} messages`);
    messages.slice(-3).forEach(msg => {
      console.log(`  - ${msg.users?.name || 'Unknown'}: "${msg.content.substring(0, 50)}..."`);
    });
  }
  
  // Step 5: Test realtime subscription
  console.log('\n🔄 Step 5: Testing realtime subscription...');
  
  let messageReceived = false;
  
  const channel = supabase
    .channel('conversation_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversation.id}`
      },
      (payload) => {
        console.log('🔔 Realtime message received:', payload.new);
        messageReceived = true;
      }
    )
    .subscribe();
    
  console.log('📡 Subscribed to realtime updates...');
  
  // Wait a moment for subscription to be established
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 6: Test sending another message to trigger realtime
  console.log('\n📤 Step 6: Testing realtime trigger...');
  
  const realtimeTestMessage = {
    conversation_id: conversation.id,
    sender_id: teacher1Id,
    content: `Realtime test message from teacher1 - ${new Date().toISOString()}`,
    message_type: 'text',
    created_at: new Date().toISOString()
  };
  
  // Sign in as teacher1 to send message
  await supabase.auth.signOut();
  await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123456'
  });
  
  const { data: realtimeMessage, error: realtimeError } = await supabase
    .from('conversation_messages')
    .insert(realtimeTestMessage)
    .select();
    
  if (realtimeError) {
    console.error('❌ Error sending realtime test message:', realtimeError);
  } else {
    console.log('✅ Realtime test message sent');
  }
  
  // Wait for realtime notification
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (messageReceived) {
    console.log('✅ Realtime working correctly!');
  } else {
    console.log('❌ Realtime not working - message not received');
  }
  
  // Cleanup
  supabase.removeChannel(channel);
  await supabase.auth.signOut();
  
  console.log('\n📊 Debug Summary:');
  console.log('================');
  console.log('✅ Authentication: Working');
  console.log('✅ Conversation access: Working');
  console.log(insertError ? '❌ Message insertion: Failed' : '✅ Message insertion: Working');
  console.log(msgError ? '❌ Message retrieval: Failed' : '✅ Message retrieval: Working');
  console.log(messageReceived ? '✅ Realtime updates: Working' : '❌ Realtime updates: Failed');
}

debugRealtimeChat().catch(console.error);
