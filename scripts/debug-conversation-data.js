import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function debugConversationData() {
  console.log('🔍 Debugging conversation participants data...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in as teacher1
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123'
  });

  if (signInError) {
    console.log('❌ Sign in error:', signInError.message);
    return;
  }

  console.log('✅ Signed in as teacher1\n');

  // Get teacher1's user ID for reference
  const currentUserId = authData.user.id;
  console.log('👤 Current user ID:', currentUserId, '\n');

  // Check conversation_participants table directly
  console.log('📋 Checking conversation_participants table:');
  const { data: allParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('*')
    .order('conversation_id');

  if (participantsError) {
    console.log('❌ Error fetching participants:', participantsError.message);
  } else {
    console.log(`Found ${allParticipants.length} participant records:`);
    allParticipants.forEach((p, i) => {
      console.log(`  ${i + 1}. Conv: ${p.conversation_id.substring(0, 8)}..., User: ${p.user_id.substring(0, 8)}..., Joined: ${p.joined_at}`);
    });
  }

  // Check conversations that teacher1 participates in
  console.log('\n🗣️ Conversations where teacher1 participates:');
  const { data: myConversations, error: myConvError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (myConvError) {
    console.log('❌ Error:', myConvError.message);
  } else {
    console.log(`Teacher1 participates in ${myConversations.length} conversations:`);
    myConversations.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.conversation_id.substring(0, 8)}...`);
    });

    // For each conversation, get all participants
    for (const conv of myConversations) {
      console.log(`\n  📋 Participants in conversation ${conv.conversation_id.substring(0, 8)}...:`);
      
      const { data: convParticipants, error: convError } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          users (
            id,
            name,
            email
          )
        `)
        .eq('conversation_id', conv.conversation_id);

      if (convError) {
        console.log('    ❌ Error:', convError.message);
      } else {
        console.log(`    Found ${convParticipants.length} participants:`);
        convParticipants.forEach((p, i) => {
          console.log(`      ${i + 1}. ${p.users?.name || p.users?.email || 'Unknown'} (${p.user_id.substring(0, 8)}...)`);
        });
      }
    }
  }

  console.log('\n✅ Debug completed!');
}

debugConversationData();
