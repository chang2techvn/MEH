import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function createUnreadMessages() {
  console.log('📨 Creating unread messages for testing...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find teacher1 and get their conversations
  const { data: teacher1 } = await supabase
    .from('users')
    .select('id, name')
    .eq('email', 'teacher1@university.edu')
    .single();

  if (!teacher1) {
    console.log('❌ Teacher1 not found');
    return;
  }

  console.log('👤 Teacher1:', teacher1.name);

  // Get teacher1's conversations
  const { data: conversations } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      last_read_at,
      conversations (
        title
      )
    `)
    .eq('user_id', teacher1.id);

  if (!conversations || conversations.length === 0) {
    console.log('❌ No conversations found');
    return;
  }

  console.log(`\n💬 Found ${conversations.length} conversations\n`);

  // Add new unread messages to each conversation
  for (const conv of conversations) {
    const conversationTitle = Array.isArray(conv.conversations) 
      ? conv.conversations[0]?.title 
      : conv.conversations?.title;

    console.log(`Adding unread messages to: ${conversationTitle}`);

    // Get the other participant (not teacher1)
    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select('user_id, users(name)')
      .eq('conversation_id', conv.conversation_id)
      .neq('user_id', teacher1.id);

    if (!otherParticipants || otherParticipants.length === 0) {
      console.log('  ❌ No other participants found');
      continue;
    }

    const otherUser = otherParticipants[0];
    const senderName = Array.isArray(otherUser.users) 
      ? otherUser.users[0]?.name 
      : otherUser.users?.name;

    // Add 2-3 new unread messages from the other user
    const newMessages = [
      {
        conversation_id: conv.conversation_id,
        sender_id: otherUser.user_id,
        content: `Hi! I just wanted to follow up on our conversation.`,
        message_type: 'text',
        created_at: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      },
      {
        conversation_id: conv.conversation_id,
        sender_id: otherUser.user_id,
        content: `Are you available to discuss the lesson today?`,
        message_type: 'text',
        created_at: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
      }
    ];

    const { error: messagesError } = await supabase
      .from('conversation_messages')
      .insert(newMessages);

    if (messagesError) {
      console.log(`  ❌ Error adding messages: ${messagesError.message}`);
    } else {
      console.log(`  ✅ Added ${newMessages.length} unread messages from ${senderName}`);
    }

    // Also update last_read_at to be older so messages appear unread
    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({
        last_read_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      })
      .eq('conversation_id', conv.conversation_id)
      .eq('user_id', teacher1.id);

    if (updateError) {
      console.log(`  ❌ Error updating last_read_at: ${updateError.message}`);
    } else {
      console.log(`  ✅ Updated last_read_at to mark messages as unread`);
    }

    console.log('');
  }

  console.log('✅ Completed creating unread messages!');
  console.log('\n🔄 Please refresh your UI to see the unread count badge.');
}

createUnreadMessages();
