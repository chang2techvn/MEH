#!/usr/bin/env node

/**
 * Generate Browser Test Script
 * Creates a JavaScript snippet to test chat in browser console
 */

console.log(`
🧪 BROWSER CONSOLE TEST SCRIPT
==============================

Copy and paste this into your browser console while signed in as teacher1:

`);

console.log(`
// Test 1: Check current user
console.log('Current user:', (await supabase.auth.getUser()).data.user);

// Test 2: Check conversations
const conversations = await supabase
  .from('conversations')
  .select(\`
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
  \`)
  .eq('conversation_participants.user_id', (await supabase.auth.getUser()).data.user.id);

console.log('Conversations:', conversations);

// Test 3: Send a test message
if (conversations.data && conversations.data.length > 0) {
  const convId = conversations.data[0].id;
  const userId = (await supabase.auth.getUser()).data.user.id;
  
  console.log('Sending test message...');
  
  const result = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: convId,
      sender_id: userId,
      content: 'Browser console test - ' + new Date().toISOString(),
      message_type: 'text'
    })
    .select();
    
  console.log('Message send result:', result);
}

// Test 4: Setup realtime subscription
if (conversations.data && conversations.data.length > 0) {
  const convId = conversations.data[0].id;
  
  console.log('Setting up realtime test...');
  
  const channel = supabase
    .channel('browser-test')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: \`conversation_id=eq.\${convId}\`
      },
      (payload) => {
        console.log('🎉 REALTIME MESSAGE RECEIVED:', payload);
      }
    )
    .subscribe();
    
  // Send test message after subscription
  setTimeout(async () => {
    console.log('Sending realtime test message...');
    await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: convId,
        sender_id: (await supabase.auth.getUser()).data.user.id,
        content: 'Realtime test from browser - ' + new Date().toISOString(),
        message_type: 'text'
      });
  }, 2000);
}
`);

console.log(`
📋 WHAT TO LOOK FOR:
====================
1. Check if conversations are loaded
2. Check if message sending works
3. Check if realtime events are received
4. Look for any error messages in console

💡 COMMON ISSUES:
=================
1. RLS policies blocking queries
2. Missing environment variables
3. Chat context not properly initialized
4. Component not re-rendering after state changes

🔧 IF REALTIME WORKS IN CONSOLE BUT NOT IN UI:
=============================================
The issue is likely in the React component state management
or the chat context implementation.
`);

console.log(`
🎯 NEXT DEBUGGING STEPS:
========================
1. Run the above script in browser console
2. Check browser Network tab for failed requests
3. Look for React state update issues
4. Verify chat component is properly connected to context
`);
