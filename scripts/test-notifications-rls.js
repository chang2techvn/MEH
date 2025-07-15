/**
 * Script to test notifications access with RLS
 * Run with: node scripts/test-notifications-rls.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');  
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testNotificationsRLS() {
  console.log('🔒 Testing Notifications RLS Policies\n');
  
  try {
    // 1. Test with service role (should have full access)
    console.log('1️⃣ Testing with Service Role (Admin):');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .limit(5);

    if (adminError) {
      console.error('❌ Admin access failed:', adminError);
    } else {
      console.log(`✅ Admin can access ${adminData.length} notifications`);
    }

    // 2. Test with anonymous client (should be restricted)
    console.log('\n2️⃣ Testing with Anonymous Client:');
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('notifications')
      .select('*')
      .limit(5);

    if (anonError) {
      console.log('✅ Anonymous access properly blocked:', anonError.code);
    } else {
      console.log(`⚠️ Anonymous can access ${anonData?.length || 0} notifications`);
    }

    // 3. Get a test user and simulate authenticated access
    console.log('\n3️⃣ Testing with Authenticated User:');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found for testing');
      return;
    }

    const testUser = users[0];
    console.log(`Testing with user: ${testUser.email} (${testUser.id})`);

    // Create authenticated client session
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to sign in the user programmatically for testing
    // First, check if we can get user notifications with admin client
    const { data: userNotifications, error: userNotificationsError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .limit(3);

    if (userNotificationsError) {
      console.error('❌ Error fetching user notifications:', userNotificationsError);
    } else {
      console.log(`✅ User has ${userNotifications.length} notifications in database`);
      if (userNotifications.length > 0) {
        console.table(userNotifications.map(n => ({
          id: n.id.substring(0, 8) + '...',
          title: n.title,
          type: n.notification_type,
          read: n.is_read
        })));
      }
    }

    // 4. Check RLS status
    console.log('\n4️⃣ Checking RLS Status:');
    
    // Try to get RLS status from pg_class
    const { data: rlsStatus, error: rlsError } = await supabaseAdmin
      .rpc('check_table_rls', { table_name: 'notifications' });

    if (rlsError) {
      console.log('Cannot check RLS status via RPC, checking manually...');
      
      // Try another approach - attempt to access with different contexts
      const { error: testRLSError } = await supabaseAnon
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (testRLSError && testRLSError.code === 'PGRST301') {
        console.log('✅ RLS is enabled and working (anonymous access blocked)');
      } else if (testRLSError) {
        console.log('⚠️ RLS may have other restrictions:', testRLSError);
      } else {
        console.log('⚠️ RLS may be disabled or bypassed');
      }
    } else {
      console.log('RLS Status:', rlsStatus);
    }

    // 5. Try creating a notification and see if it appears
    console.log('\n5️⃣ Testing Notification Creation:');
    const testNotification = {
      user_id: testUser.id,
      title: 'RLS Test Notification',
      message: 'This is a test notification to verify RLS is working',
      notification_type: 'system',
      data: { test: true, source: 'rls-test' }
    };

    const { data: createdNotification, error: createError } = await supabaseAdmin
      .from('notifications')
      .insert([testNotification])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating test notification:', createError);
    } else {
      console.log('✅ Test notification created:', createdNotification.id);
      
      // Now try to read it with anonymous client
      const { data: readTest, error: readError } = await supabaseAnon
        .from('notifications')
        .select('*')
        .eq('id', createdNotification.id);

      if (readError) {
        console.log('✅ RLS properly blocks anonymous read access');
      } else {
        console.log('⚠️ Anonymous client can read the notification (RLS may be disabled)');
      }

      // Clean up
      await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('id', createdNotification.id);
      console.log('🗑️ Test notification cleaned up');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testNotificationsRLS().then(() => {
  console.log('\n✅ RLS test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during RLS test:', error);
  process.exit(1);
});
