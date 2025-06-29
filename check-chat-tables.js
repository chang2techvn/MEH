const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking chat-related tables...\n');

  try {
    // Check conversations table
    console.log('1. Conversations table:');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(5);
      
    if (convError) {
      console.log('❌ Error:', convError.message);
    } else {
      console.log('✅ Records:', conversations?.length || 0);
      if (conversations && conversations.length > 0) {
        console.log('Sample:', conversations[0]);
      }
    }

    // Check conversation_participants table
    console.log('\n2. Conversation_participants table:');
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .limit(5);
      
    if (partError) {
      console.log('❌ Error:', partError.message);
    } else {
      console.log('✅ Records:', participants?.length || 0);
      if (participants && participants.length > 0) {
        console.log('Sample:', participants[0]);
      }
    }

    // Check conversation_messages table
    console.log('\n3. Conversation_messages table:');
    const { data: convMessages, error: convMsgError } = await supabase
      .from('conversation_messages')
      .select('*')
      .limit(5);
      
    if (convMsgError) {
      console.log('❌ Error:', convMsgError.message);
    } else {
      console.log('✅ Records:', convMessages?.length || 0);
      if (convMessages && convMessages.length > 0) {
        console.log('Sample:', convMessages[0]);
      }
    }

    // Check messages table
    console.log('\n4. Messages table:');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);
      
    if (msgError) {
      console.log('❌ Error:', msgError.message);
    } else {
      console.log('✅ Records:', messages?.length || 0);
      if (messages && messages.length > 0) {
        console.log('Sample:', messages[0]);
      }
    }

    // Check which schema is being used
    console.log('\n5. Recommended approach:');
    if (convMessages && convMessages.length > 0) {
      console.log('📝 Use conversation_messages table for chat (existing data found)');
    } else if (messages && messages.length > 0) {
      console.log('📝 Use messages table for chat (existing data found)');
    } else {
      console.log('📝 Both tables are empty, choose based on schema design');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkTables();
