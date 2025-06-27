import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function createOneOnOneChats() {
  console.log('🔧 Creating 1:1 conversations for teacher1...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email')
    .order('email');

  if (usersError) {
    console.log('❌ Error fetching users:', usersError.message);
    return;
  }

  // Find teacher1
  const teacher1 = users.find(u => u.email === 'teacher1@university.edu');
  if (!teacher1) {
    console.log('❌ Teacher1 not found');
    return;
  }

  console.log('👤 Teacher1:', teacher1.name);

  // Delete existing conversations first
  console.log('\n🗑️ Cleaning up existing conversations...');
  
  // Get teacher1's conversations
  const { data: existingConvs } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', teacher1.id);

  if (existingConvs && existingConvs.length > 0) {
    // Delete messages first
    for (const conv of existingConvs) {
      await supabase
        .from('conversation_messages')
        .delete()
        .eq('conversation_id', conv.conversation_id);
    }

    // Delete participants
    await supabase
      .from('conversation_participants')
      .delete()
      .eq('user_id', teacher1.id);

    // Delete conversations
    const convIds = existingConvs.map(c => c.conversation_id);
    await supabase
      .from('conversations')
      .delete()
      .in('id', convIds);

    console.log(`✅ Deleted ${existingConvs.length} existing conversations`);
  }

  // Create 1:1 conversations with select users
  const selectedUsers = users.filter(u => 
    u.id !== teacher1.id && 
    ['john.smith@university.edu', 'sarah.wilson@university.edu', 'maria.garcia@university.edu', 'michael.brown@university.edu'].includes(u.email)
  );

  console.log(`\n💬 Creating ${selectedUsers.length} 1:1 conversations...\n`);

  for (const otherUser of selectedUsers) {
    console.log(`Creating conversation with ${otherUser.name}...`);

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        title: `${teacher1.name} & ${otherUser.name}`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (convError) {
      console.log(`❌ Error creating conversation:`, convError.message);
      continue;
    }

    // Add participants (only 2 people for 1:1 chat)
    const participants = [
      {
        conversation_id: conversation.id,
        user_id: teacher1.id,
        role: 'teacher',
        joined_at: new Date().toISOString()
      },
      {
        conversation_id: conversation.id,
        user_id: otherUser.id,
        role: 'student',
        joined_at: new Date().toISOString()
      }
    ];

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) {
      console.log(`❌ Error adding participants:`, participantsError.message);
      continue;
    }

    // Add some sample messages
    const messages = [
      {
        conversation_id: conversation.id,
        sender_id: otherUser.id,
        content: `Hi ${teacher1.name}! How are you doing?`,
        message_type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        conversation_id: conversation.id,
        sender_id: teacher1.id,
        content: `Hello ${otherUser.name}! I'm doing well, thank you. How about you?`,
        message_type: 'text', 
        created_at: new Date(Date.now() - 3000000).toISOString() // 50 minutes ago
      },
      {
        conversation_id: conversation.id,
        sender_id: otherUser.id,
        content: `Great! I have a question about the English lesson from yesterday.`,
        message_type: 'text',
        created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      }
    ];

    const { error: messagesError } = await supabase
      .from('conversation_messages')
      .insert(messages);

    if (messagesError) {
      console.log(`❌ Error adding messages:`, messagesError.message);
    } else {
      console.log(`✅ Created 1:1 conversation with ${otherUser.name}`);
    }

    console.log('');
  }

  console.log('✅ Completed creating 1:1 conversations!');
  console.log('\n🔄 Please refresh your UI to see the new 1:1 conversations.');
}

createOneOnOneChats();
