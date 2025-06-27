import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvslsmghynwwdbqbhjsg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2c2xzbWdoeW53d2RicWJoanNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDE4NzQ4OCwiZXhwIjoyMDQ5NzYzNDg4fQ.O8Rh2_Vb4vu_RkQKPyj8W5CrYf8PkkrNNEhefUXVJG8';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2c2xzbWdoeW53d2RicWJoanNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxODc0ODgsImV4cCI6MjA0OTc2MzQ4OH0.Lzh3J06vpnUNAT_VLSLdPgbqhABzDZeQ0g8MIelCtNI';

async function testAccess() {
  console.log('🔍 Testing user access with different permissions...\n');

  // Test with service key (admin)
  console.log('🔧 Testing with service key (admin access):');
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: serviceUsers, error: serviceError } = await serviceClient
    .from('users')
    .select('id, email, name')
    .limit(5);

  if (serviceError) {
    console.log('❌ Service key error:', serviceError.message);
  } else {
    console.log('✅ Service key can access users:', serviceUsers?.length || 0, 'records');
    serviceUsers?.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.name || user.email} (${user.id.substring(0, 8)}...)`);
    });
  }

  // Test with anon key (unauthenticated)
  console.log('\n🌐 Testing with anon key (unauthenticated):');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: anonUsers, error: anonError } = await anonClient
    .from('users')
    .select('id, email, name')
    .limit(5);

  if (anonError) {
    console.log('❌ Anon key error:', anonError.message);
  } else {
    console.log('✅ Anon key can access users:', anonUsers?.length || 0, 'records');
  }

  // Test with authenticated user (teacher1)
  console.log('\n👤 Testing with authenticated user (teacher1):');
  
  const { data: teacher1Auth, error: signInError } = await anonClient.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123'
  });

  if (signInError) {
    console.log('❌ Sign in error:', signInError.message);
    return;
  }

  console.log('✅ Signed in as teacher1');

  const { data: authUsers, error: authError } = await anonClient
    .from('users')
    .select('id, email, name')
    .limit(10);

  if (authError) {
    console.log('❌ Authenticated access error:', authError.message);
  } else {
    console.log('✅ Authenticated user can access users:', authUsers?.length || 0, 'records');
    authUsers?.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.name || user.email} (${user.id.substring(0, 8)}...)`);
    });
  }

  console.log('\n📝 Summary:');
  console.log('- Service key (admin):', serviceUsers?.length || 0, 'users visible');
  console.log('- Anon key (unauthenticated):', anonUsers?.length || 0, 'users visible');  
  console.log('- Authenticated user:', authUsers?.length || 0, 'users visible');

  if (serviceUsers && authUsers && serviceUsers.length > authUsers.length) {
    console.log('\n⚠️ RLS is likely enabled - authenticated users see fewer records than admin');
  } else if (serviceUsers && authUsers && serviceUsers.length === authUsers.length) {
    console.log('\n✅ RLS is likely disabled - authenticated users see all records');
  }
}

testAccess();
