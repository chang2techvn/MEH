import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function addMoreParticipants() {
  console.log('🔧 Adding more participants to teacher1 conversations...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email');

  if (usersError) {
    console.log('❌ Error fetching users:', usersError.message);
    return;
  }

  console.log(`✅ Found ${users.length} users`);

  // Find teacher1
  const teacher1 = users.find(u => u.email === 'teacher1@university.edu');
  if (!teacher1) {
    console.log('❌ Teacher1 not found');
    return;
  }

  console.log('👤 Teacher1 ID:', teacher1.id);

  // Get teacher1's conversations
  const { data: conversations, error: convError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', teacher1.id);

  if (convError) {
    console.log('❌ Error fetching conversations:', convError.message);
    return;
  }

  console.log(`✅ Teacher1 has ${conversations.length} conversations\n`);

  // For each conversation, add 2-3 other participants
  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i];
    console.log(`📝 Adding participants to conversation ${i + 1} (${conv.conversation_id.substring(0, 8)}...):`);

    // Select different users for each conversation
    const startIndex = i * 2;
    const otherUsers = users.filter(u => u.id !== teacher1.id).slice(startIndex, startIndex + 2);

    for (const user of otherUsers) {
      console.log(`  + Adding ${user.name || user.email}`);
      
      const { error: insertError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conv.conversation_id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (insertError) {
        console.log(`    ❌ Error adding ${user.name}:`, insertError.message);
      } else {
        console.log(`    ✅ Added ${user.name || user.email}`);
      }
    }

    // Add some messages from the new participants
    for (const user of otherUsers) {
      const { error: msgError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conv.conversation_id,
          sender_id: user.id,
          content: `Hello from ${user.name || user.email}! How are your English studies going?`,
          sent_at: new Date().toISOString()
        });

      if (msgError) {
        console.log(`    ❌ Error adding message from ${user.name}:`, msgError.message);
      } else {
        console.log(`    💬 Added message from ${user.name || user.email}`);
      }
    }

    console.log('');
  }

  console.log('✅ Completed adding participants and messages!');
}

addMoreParticipants();
