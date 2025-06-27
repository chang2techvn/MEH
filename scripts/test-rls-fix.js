import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTk0MzcyLCJleHAiOjE5NjA3NzAzNzJ9.L3YUh6y5mOUIc3LtfJZzGRn6b2xQnJK2qZCDH6W1234';

async function testRLSFix() {
  console.log('🔍 Testing RLS fix for users table...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in as teacher1
  console.log('👤 Signing in as teacher1...');
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123'
  });

  if (signInError) {
    console.log('❌ Sign in error:', signInError.message);
    return;
  }

  console.log('✅ Signed in successfully as:', authData.user?.email);

  // Test 1: Check if we can see our own user record
  console.log('\n📋 Test 1: Can we see our own user record?');
  const { data: selfUser, error: selfError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', authData.user.id)
    .single();

  if (selfError) {
    console.log('❌ Cannot see own user:', selfError.message);
  } else {
    console.log('✅ Can see own user:', selfUser?.name || selfUser?.email);
  }

  // Test 2: Check if we can see other users in general
  console.log('\n📋 Test 2: How many users can we see total?');
  const { data: allUsers, error: allUsersError } = await supabase
    .from('users')
    .select('id, email, name');

  if (allUsersError) {
    console.log('❌ Cannot query users:', allUsersError.message);
  } else {
    console.log('✅ Can see', allUsers?.length || 0, 'users total');
    allUsers?.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.name || user.email} (${user.id.substring(0, 8)}...)`);
    });
  }

  // Test 3: Check conversations and participants
  console.log('\n📋 Test 3: Check conversations with participants...');
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      conversation_participants (
        user_id,
        users (
          id,
          email,
          name
        )
      )
    `);

  if (convError) {
    console.log('❌ Cannot query conversations:', convError.message);
  } else {
    console.log('✅ Found', conversations?.length || 0, 'conversations');
    conversations?.forEach((conv, i) => {
      console.log(`\n  Conversation ${i + 1} (${conv.id.substring(0, 8)}...):`);
      conv.conversation_participants?.forEach((cp, j) => {
        const user = cp.users;
        console.log(`    Participant ${j + 1}: ${user?.name || user?.email || 'Unknown'} (${cp.user_id.substring(0, 8)}...)`);
      });
    });
  }

  // Test 4: Check specific participant IDs we know exist
  console.log('\n📋 Test 4: Test accessing specific user IDs...');
  
  // Get some participant IDs from conversations
  if (conversations && conversations.length > 0) {
    const firstConv = conversations[0];
    const participantIds = firstConv.conversation_participants?.map(cp => cp.user_id) || [];
    
    console.log('Trying to access participant IDs:', participantIds.map(id => id.substring(0, 8) + '...'));
    
    for (const userId of participantIds) {
      const { data: specificUser, error: specificError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', userId)
        .single();

      if (specificError) {
        console.log(`❌ Cannot access user ${userId.substring(0, 8)}...: ${specificError.message}`);
      } else {
        console.log(`✅ Can access user ${userId.substring(0, 8)}...: ${specificUser?.name || specificUser?.email}`);
      }
    }
  }

  console.log('\n🏁 Test completed!');
}

testRLSFix().catch(console.error);
