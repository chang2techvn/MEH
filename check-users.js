const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAuthUsers() {
  console.log('👤 Checking auth users...\n');

  try {
    // Get users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }

    console.log('📋 Auth users:');
    authUsers.users.forEach(user => {
      console.log(`- ${user.email} (${user.id})`);
    });

    // Get users from database
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(10);

    if (dbError) {
      console.log('❌ DB error:', dbError.message);
      return;
    }

    console.log('\n📊 Database users:');
    dbUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - ${user.id}`);
    });

    console.log('\n🔍 Recommendations:');
    console.log('Use these credentials for testing:');
    authUsers.users.slice(0, 3).forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`  Password: (check populate-sample-data.js script)`);
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

listAuthUsers();
