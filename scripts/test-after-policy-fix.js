import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testAfterPolicyFix() {
  console.log('🧪 Testing conversation participants after RLS policy fix...\n');

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

  console.log('✅ Signed in as teacher1');
  const currentUserId = authData.user.id;

  // Test: Get all participants in teacher1's conversations
  console.log('\n📋 Testing conversation participants access:');
  
  const { data: myConversations, error: convError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (convError) {
    console.log('❌ Error getting my conversations:', convError.message);
    return;
  }

  console.log(`✅ Found ${myConversations.length} conversations I participate in\n`);

  // For each conversation, try to get ALL participants (not just myself)
  for (const conv of myConversations) {
    console.log(`🔍 Testing participants for conversation ${conv.conversation_id.substring(0, 8)}...:`);
    
    const { data: allParticipants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        joined_at,
        users (
          id,
          name,
          email
        )
      `)
      .eq('conversation_id', conv.conversation_id);

    if (participantsError) {
      console.log('  ❌ Error:', participantsError.message);
    } else {
      console.log(`  ✅ Can see ${allParticipants.length} participants:`);
      allParticipants.forEach((p, i) => {
        const isMe = p.user_id === currentUserId;
        console.log(`    ${i + 1}. ${p.users?.name || p.users?.email || 'Unknown'} ${isMe ? '(me)' : ''}`);
      });
    }
    console.log('');
  }

  console.log('🎯 Test completed!');
}

testAfterPolicyFix();
