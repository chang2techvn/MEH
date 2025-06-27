import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function debugUserData() {
  console.log('🔍 Debugging user data and names...\n');

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

  // Check all users and their names
  console.log('\n📋 All users and their data:');
  const { data: allUsers, error: usersError } = await supabase
    .from('users')
    .select('id, email, name, avatar, created_at')
    .order('email');

  if (usersError) {
    console.log('❌ Error:', usersError.message);
  } else {
    allUsers?.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   Name: "${user.name}" (${typeof user.name})`);
      console.log(`   Avatar: "${user.avatar}"`);
      console.log(`   ID: ${user.id.substring(0, 8)}...`);
      console.log('');
    });
  }

  // Test specific participants in a conversation
  console.log('🔍 Testing specific conversation participants:');
  const { data: conversations, error: convError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', authData.user.id)
    .limit(1);

  if (conversations && conversations.length > 0) {
    const convId = conversations[0].conversation_id;
    console.log(`\nConversation: ${convId.substring(0, 8)}...`);

    // Get participants with full user data
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        users (
          id,
          email,
          name,
          avatar,
          created_at
        )
      `)
      .eq('conversation_id', convId);

    if (participantsError) {
      console.log('❌ Error getting participants:', participantsError.message);
    } else {
      console.log(`✅ Found ${participants?.length} participants:`);
      participants?.forEach((p, i) => {
        console.log(`  ${i + 1}. User ID: ${p.user_id.substring(0, 8)}...`);
        if (p.users) {
          console.log(`     Email: ${p.users.email}`);
          console.log(`     Name: "${p.users.name}" (${typeof p.users.name})`);
          console.log(`     Avatar: "${p.users.avatar}"`);
        } else {
          console.log('     ❌ No user data found!');
        }
        console.log('');
      });
    }
  }

  console.log('✅ Debug completed!');
}

debugUserData();
