import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvslsmghynwwdbqbhjsg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2c2xzbWdoeW53d2RicWJoanNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDE4NzQ4OCwiZXhwIjoyMDQ5NzYzNDg4fQ.O8Rh2_Vb4vu_RkQKPyj8W5CrYf8PkkrNNEhefUXVJG8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status and policies...\n');

  try {
    // Check RLS status for users table
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled
          FROM pg_tables 
          WHERE tablename = 'users' AND schemaname = 'public';
        `
      });

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
      return;
    }

    console.log('📋 RLS Status for users table:', rlsStatus);

    // Check policies on users table
    const { data: policies, error: policiesError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            pol.policyname,
            pol.permissive,
            pol.roles,
            pol.cmd,
            pol.qual,
            pol.with_check
          FROM pg_policies pol
          WHERE pol.tablename = 'users' AND pol.schemaname = 'public';
        `
      });

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
      return;
    }

    console.log('\n🛡️ Policies on users table:', policies);

    if (!policies || policies.length === 0) {
      console.log('ℹ️ No policies found on users table');
    }

    // Test direct access to users table with anon key
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2c2xzbWdoeW53d2RicWJoanNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxODc0ODgsImV4cCI6MjA0OTc2MzQ4OH0.Lzh3J06vpnUNAT_VLSLdPgbqhABzDZeQ0g8MIelCtNI');
    
    console.log('\n🔑 Testing anon access to users table...');
    const { data: anonUsers, error: anonError } = await anonClient
      .from('users')
      .select('id, email, name')
      .limit(3);

    if (anonError) {
      console.log('❌ Anon access error:', anonError.message);
    } else {
      console.log('✅ Anon can access users:', anonUsers?.length || 0, 'records');
    }

    // Test with a signed-in user (teacher1)
    console.log('\n👤 Testing authenticated user access...');
    const { data: teacher1, error: signInError } = await anonClient.auth.signInWithPassword({
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
        console.log(`  ${i + 1}. ${user.name || user.email} (${user.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkRLSStatus();
