/**
 * Script to test authenticated notifications access
 * Run with: node scripts/test-authenticated-notifications.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !adminKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, adminKey);
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthenticatedNotifications() {
  console.log('🔐 Testing Authenticated Notifications Access\n');
  
  try {
    // 1. Get a test user
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found');
      return;
    }

    const testUser = users[0];
    console.log(`Testing with user: ${testUser.email} (${testUser.id})`);

    // 2. Check notifications for this user with admin access
    const { data: userNotifications, error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false });

    if (notificationsError) {
      console.error('❌ Error fetching notifications with admin:', notificationsError);
    } else {
      console.log(`✅ Admin found ${userNotifications.length} notifications for user`);
    }

    // 3. Try to simulate authenticated client access
    // First, let's manually set the user context (this simulates what happens in the app)
    console.log('\n🔗 Simulating authenticated client access...');
    
    // Try to access notifications without authentication (should fail)
    const { data: unauthData, error: unauthError } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id);

    if (unauthError) {
      console.log('✅ Unauthenticated access properly blocked:', unauthError.code);
    } else {
      console.log(`⚠️ Unauthenticated access succeeded (${unauthData?.length || 0} notifications)`);
    }

    // 4. Test with manual auth simulation
    console.log('\n🧪 Testing auth simulation...');
    
    // Get user auth data for simulation
    const { data: authUsers, error: authUsersError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', testUser.email)
      .limit(1);

    if (authUsersError) {
      console.log('Cannot access auth.users table for simulation');
    } else if (authUsers && authUsers.length > 0) {
      console.log(`Auth user found: ${authUsers[0].id}`);
      
      // Now we need to create a properly signed JWT to test
      // For now, let's just see if the frontend would work
    }

    // 5. Test the exact query the frontend would make
    console.log('\n🎯 Testing frontend-style query...');
    
    try {
      const frontendQuery = await supabaseClient
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (frontendQuery.error) {
        console.log('✅ Frontend query blocked by RLS:', frontendQuery.error.code);
      } else {
        console.log(`⚠️ Frontend query succeeded (${frontendQuery.data?.length || 0} notifications)`);
      }
    } catch (error) {
      console.log('✅ Frontend query failed as expected:', error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testAuthenticatedNotifications().then(() => {
  console.log('\n✅ Authenticated notifications test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during test:', error);
  process.exit(1);
});
