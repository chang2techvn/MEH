require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStartNewChatQuery() {
  console.log('🔍 Testing Start New Chat user loading...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  
  console.log('\n📋 Step 1: Test basic users query with profiles...');
  
  // Test the exact query from the component
  const { data: users, error } = await supabase
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
    .limit(5);
  
  if (error) {
    console.error('❌ Error with profiles!inner query:', error);
    
    // Try without !inner
    console.log('\n📋 Step 2: Try query without !inner...');
    const { data: usersWithoutInner, error: errorWithoutInner } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        last_login,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .neq('id', currentUserId)
      .eq('is_active', true)
      .order('last_login', { ascending: false })
      .limit(5);
    
    if (errorWithoutInner) {
      console.error('❌ Error even without !inner:', errorWithoutInner);
    } else {
      console.log('✅ Query works without !inner:', usersWithoutInner?.length, 'users found');
      usersWithoutInner?.forEach(user => {
        const profile = user.profiles?.[0];
        console.log(`  - ${user.email}: ${profile?.full_name || 'No profile'}`);
      });
    }
  } else {
    console.log('✅ Query with !inner works:', users?.length, 'users found');
    users?.forEach(user => {
      const profile = user.profiles?.[0];
      console.log(`  - ${user.email}: ${profile?.full_name || 'No profile'}`);
    });
  }
  
  console.log('\n📋 Step 3: Check which users have no profiles...');
  const { data: allUsers, error: allUsersError } = await supabase
    .from('users')
    .select('id, email')
    .neq('id', currentUserId)
    .eq('is_active', true);
  
  if (allUsersError) {
    console.error('❌ Error getting all users:', allUsersError);
    return;
  }
  
  console.log(`✅ Found ${allUsers?.length} active users (excluding current user)`);
  
  for (const user of allUsers || []) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.log(`  ❌ ${user.email}: No profile found`);
    } else {
      console.log(`  ✅ ${user.email}: ${profile.full_name || profile.username}`);
    }
  }
}

testStartNewChatQuery().catch(console.error);
