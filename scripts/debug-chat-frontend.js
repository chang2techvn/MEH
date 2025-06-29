#!/usr/bin/env node

/**
 * Debug Chat Frontend
 * This script checks what's happening in the chat context and components
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugChatFrontend() {
  console.log('🔍 Debugging frontend chat functionality...\n');
  
  // Test authentication
  console.log('👤 Testing teacher1 login...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123456'
  });
  
  if (authError) {
    console.error('❌ Auth failed:', authError);
    return;
  }
  
  console.log('✅ Authenticated as teacher1');
  const userId = authData.user.id;
  
  // Test what the chat context would fetch
  console.log('\n💬 Testing conversation fetching (like chat context)...');
  
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
    .eq('conversation_participants.user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (convError) {
    console.error('❌ Conversation fetch error:', convError);
    return;
  }
  
  console.log(`✅ Found ${conversations.length} conversations`);
  
  if (conversations.length > 0) {
    const conv = conversations[0];
    console.log(`\nConversation: "${conv.title}"`);
    console.log(`Participants: ${conv.conversation_participants.length}`);
    console.log(`Messages: ${conv.conversation_messages?.length || 0}`);
    
    // Show recent messages
    if (conv.conversation_messages && conv.conversation_messages.length > 0) {
      console.log('\n📝 Recent messages:');
      conv.conversation_messages
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(-3)
        .forEach(msg => {
          console.log(`  - ${msg.users?.name || 'Unknown'}: "${msg.content.substring(0, 50)}..."`);
        });
    }
    
    // Test sending a message (like the chat component would)
    console.log('\n📤 Testing message sending...');
    const testMessage = {
      conversation_id: conv.id,
      sender_id: userId,
      content: `Frontend test message - ${new Date().toISOString()}`,
      message_type: 'text'
    };
    
    const { data: sentMessage, error: sendError } = await supabase
      .from('conversation_messages')
      .insert(testMessage)
      .select(`
        *,
        users (
          id,
          name
        )
      `)
      .single();
      
    if (sendError) {
      console.error('❌ Message send error:', sendError);
    } else {
      console.log('✅ Message sent successfully');
      console.log(`   ID: ${sentMessage.id}`);
      console.log(`   Content: "${sentMessage.content}"`);
    }
    
    // Test realtime subscription (like chat context would)
    console.log('\n📡 Testing realtime subscription...');
    
    let realtimeReceived = false;
    
    const channel = supabase
      .channel(`conversation:${conv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conv.id}`
        },
        (payload) => {
          console.log('✅ Realtime message received in frontend test:', {
            id: payload.new.id,
            content: payload.new.content.substring(0, 50) + '...',
            sender_id: payload.new.sender_id
          });
          realtimeReceived = true;
        }
      )
      .subscribe();
      
    // Wait for subscription to be ready
    await new Promise(resolve => {
      const checkStatus = setInterval(() => {
        if (channel.state === 'SUBSCRIBED') {
          clearInterval(checkStatus);
          resolve();
        }
      }, 100);
    });
    
    console.log('📡 Realtime subscribed, sending test message...');
    
    // Send another test message to trigger realtime
    const { error: realtimeTestError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conv.id,
        sender_id: userId,
        content: `Realtime frontend test - ${new Date().toISOString()}`,
        message_type: 'text'
      });
      
    if (realtimeTestError) {
      console.error('❌ Realtime test message error:', realtimeTestError);
    } else {
      console.log('📤 Realtime test message sent');
    }
    
    // Wait for realtime
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (realtimeReceived) {
      console.log('✅ Frontend realtime working correctly!');
    } else {
      console.log('❌ Frontend realtime not working');
    }
    
    // Cleanup
    supabase.removeChannel(channel);
  }
  
  await supabase.auth.signOut();
  
  console.log('\n🔧 POTENTIAL ISSUES TO CHECK:');
  console.log('==============================');
  console.log('1. Check if chat context is properly subscribing to realtime');
  console.log('2. Verify message sending function in chat component');
  console.log('3. Check if conversation state is updating after message send');
  console.log('4. Verify RLS policies allow SELECT/INSERT for authenticated users');
  console.log('5. Check browser console for any JavaScript errors');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('===============');
  console.log('1. Open browser dev tools and check console for errors');
  console.log('2. Check Network tab to see if message POST requests are successful');
  console.log('3. Verify chat context is properly updating conversations state');
  console.log('4. Test in different browsers to rule out caching issues');
}

debugChatFrontend().catch(console.error);
