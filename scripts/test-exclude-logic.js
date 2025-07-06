require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExcludeLogic() {
  console.log('🔍 Testing exclude users logic...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  
  // Get existing conversation participants (simulate what the component does)
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      conversations!inner(
        id,
        title
      )
    `)
    .eq('user_id', currentUserId);
  
  if (conversationsError) {
    console.error('❌ Error getting conversations:', conversationsError);
    return;
  }
  
  console.log(`✅ Found ${conversations?.length} conversations for teacher1`);
  
  // Get participants in each conversation
  const existingUserIds = new Set();
  
  for (const conv of conversations || []) {
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conv.conversation_id)
      .neq('user_id', currentUserId);
    
    if (participants) {
      participants.forEach(p => existingUserIds.add(p.user_id));
    }
  }
  
  console.log(`📊 Users to exclude: ${existingUserIds.size}`);
  console.log('Exclude list:', Array.from(existingUserIds));
  
  // Test the query with exclude logic
  console.log('\n🔍 Testing query with exclude logic...');
  
  let query = supabase
    .from('users')
    .select(`
      id, 
      email, 
      last_login,
      profiles!inner (
        username,
        full_name,
        avatar_url
      )
    `)
    .neq('id', currentUserId)
    .eq('is_active', true)
    .order('last_login', { ascending: false })
    .limit(10);
  
  // Apply exclude logic
  if (existingUserIds.size > 0) {
    const existingUserIdsList = Array.from(existingUserIds);
    console.log('Applying exclude filter for:', existingUserIdsList);
    query = query.not('id', 'in', existingUserIdsList);
  }
  
  const { data: availableUsers, error: availableUsersError } = await query;
  
  if (availableUsersError) {
    console.error('❌ Error with exclude query:', availableUsersError);
  } else {
    console.log(`✅ Available users after exclude: ${availableUsers?.length}`);
    availableUsers?.forEach(user => {
      const profile = user.profiles?.[0];
      console.log(`  - ${user.email}: ${profile?.full_name}`);
    });
  }
  
  // Test without exclude for comparison
  console.log('\n🔍 Testing same query without exclude...');
  
  const { data: allUsers, error: allUsersError } = await supabase
    .from('users')
    .select(`
      id, 
      email, 
      last_login,
      profiles!inner (
        username,
        full_name,
        avatar_url
      )
    `)
    .neq('id', currentUserId)
    .eq('is_active', true)
    .order('last_login', { ascending: false })
    .limit(10);
  
  if (allUsersError) {
    console.error('❌ Error without exclude:', allUsersError);
  } else {
    console.log(`✅ All users without exclude: ${allUsers?.length}`);
  }
}

testExcludeLogic().catch(console.error);
