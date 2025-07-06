require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTeacher1Profile() {
  console.log('🔍 Testing teacher1 profile data...');
  
  const { data: userWithProfile, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      last_active,
      profiles!inner(
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('id', '13df7bf1-d38f-4b58-b444-3dfa67e04f17')
    .single();
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  const profile = userWithProfile.profiles?.[0];
  const displayName = profile?.full_name || profile?.username || userWithProfile.email;
  
  console.log('✅ User with profile:', {
    id: userWithProfile.id,
    email: userWithProfile.email,
    displayName: displayName,
    fullProfile: profile
  });
}

testTeacher1Profile().catch(console.error);
