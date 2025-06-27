import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function checkWithServiceKey() {
  console.log('🔧 Checking conversation participants with service key (admin view)...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all conversation participants
  const { data: allParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      user_id,
      joined_at,
      users (
        name,
        email
      )
    `)
    .order('conversation_id, joined_at');

  if (participantsError) {
    console.log('❌ Error:', participantsError.message);
    return;
  }

  console.log(`✅ Found ${allParticipants.length} total participant records:\n`);

  // Group by conversation
  const conversationGroups = {};
  allParticipants.forEach(p => {
    const convId = p.conversation_id.substring(0, 8) + '...';
    if (!conversationGroups[convId]) {
      conversationGroups[convId] = [];
    }
    conversationGroups[convId].push(p);
  });

  Object.keys(conversationGroups).forEach(convId => {
    console.log(`📋 Conversation ${convId}:`);
    conversationGroups[convId].forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.users?.name || p.users?.email || 'Unknown'} (${p.user_id.substring(0, 8)}...)`);
    });
    console.log('');
  });
}

checkWithServiceKey();
