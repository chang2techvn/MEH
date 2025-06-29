#!/usr/bin/env node

/**
 * Simple Browser Test Commands
 * Run each command one by one in browser console
 */

console.log(`
🧪 SIMPLE BROWSER TESTS
=======================

Run these commands ONE BY ONE in browser console:

1. Check current user:
   await supabase.auth.getUser()

2. Check conversations:
   await supabase.from('conversations').select('*')

3. Check if you can access conversation_messages:
   await supabase.from('conversation_messages').select('*').limit(5)

4. Try sending a message (replace CONVERSATION_ID):
   await supabase.from('conversation_messages').insert({
     conversation_id: 'CONVERSATION_ID',
     sender_id: (await supabase.auth.getUser()).data.user.id,
     content: 'Test message',
     message_type: 'text'
   })

💡 Replace CONVERSATION_ID with actual ID from step 2
`);

console.log(`
🔍 WHAT TO CHECK:
================
- Does step 1 show your user info?
- Does step 2 return conversations?
- Does step 3 show existing messages?
- Does step 4 successfully insert a message?
- Do you see any errors in console?
`);
