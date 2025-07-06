require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseNotInSyntax() {
  console.log('🔍 Testing Supabase .not() syntax variations...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  const testIds = ['870abf1d-8236-4d98-9746-e9d2cd3457d2', 'ea9c530c-bb8e-4407-ba8d-44c074d37c4f'];
  
  console.log('\n📋 Test 1: Using .not("id", "in", array)...');
  try {
    const { data: test1, error: error1 } = await supabase
      .from('users')
      .select('id, email')
      .neq('id', currentUserId)
      .not('id', 'in', testIds)
      .limit(3);
    
    if (error1) {
      console.error('❌ Test 1 error:', error1.message);
    } else {
      console.log('✅ Test 1 works:', test1?.length, 'users');
    }
  } catch (e) {
    console.error('❌ Test 1 exception:', e.message);
  }
  
  console.log('\n📋 Test 2: Using individual .neq() for each ID...');
  try {
    let query = supabase
      .from('users')
      .select('id, email')
      .neq('id', currentUserId);
    
    // Add .neq() for each ID to exclude
    testIds.forEach(id => {
      query = query.neq('id', id);
    });
    
    const { data: test2, error: error2 } = await query.limit(3);
    
    if (error2) {
      console.error('❌ Test 2 error:', error2.message);
    } else {
      console.log('✅ Test 2 works:', test2?.length, 'users');
    }
  } catch (e) {
    console.error('❌ Test 2 exception:', e.message);
  }
  
  console.log('\n📋 Test 3: Using .filter() with SQL...');
  try {
    const idsString = testIds.map(id => `'${id}'`).join(',');
    const { data: test3, error: error3 } = await supabase
      .from('users')
      .select('id, email')
      .neq('id', currentUserId)
      .filter('id', 'not.in', `(${idsString})`)
      .limit(3);
    
    if (error3) {
      console.error('❌ Test 3 error:', error3.message);
    } else {
      console.log('✅ Test 3 works:', test3?.length, 'users');
    }
  } catch (e) {
    console.error('❌ Test 3 exception:', e.message);
  }
  
  console.log('\n📋 Test 4: Skip exclude logic entirely (show all available users)...');
  try {
    const { data: test4, error: error4 } = await supabase
      .from('users')
      .select(`
        id, 
        email,
        profiles!inner (
          username,
          full_name,
          avatar_url
        )
      `)
      .neq('id', currentUserId)
      .eq('is_active', true)
      .limit(5);
    
    if (error4) {
      console.error('❌ Test 4 error:', error4.message);
    } else {
      console.log('✅ Test 4 works:', test4?.length, 'users');
      test4?.forEach(user => {
        const profile = user.profiles?.[0];
        console.log(`  - ${user.email}: ${profile?.full_name}`);
      });
    }
  } catch (e) {
    console.error('❌ Test 4 exception:', e.message);
  }
}

testSupabaseNotInSyntax().catch(console.error);
