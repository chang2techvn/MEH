/**
 * Script to check notifications table structure and data
 * Run with: node scripts/check-notifications-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotificationsTable() {
  console.log('🔔 Checking Notifications Table Structure and Data\n');
  
  try {
    // 1. Check if table exists by trying to select from it
    console.log('📋 Table Existence Check:');
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Notifications table does not exist or is not accessible:', testError);
      return;
    } else {
      console.log('✅ Notifications table exists and is accessible');
    }

    // 2. Check total count
    console.log('\n📊 Table Statistics:');
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting count:', countError);
    } else {
      console.log(`Total notifications: ${count}`);
    }

    // 3. Check recent notifications
    console.log('\n🔔 Recent Notifications (Last 10):');
    const { data: recentNotifications, error: recentError } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        message,
        notification_type,
        is_read,
        data,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent notifications:', recentError);
    } else {
      if (recentNotifications && recentNotifications.length > 0) {
        console.table(recentNotifications);
      } else {
        console.log('No notifications found');
      }
    }

    // 4. Check unread notifications count by user
    console.log('\n📬 Unread Notifications by User:');
    const { data: unreadStats, error: unreadError } = await supabase
      .from('notifications')
      .select('user_id, is_read')
      .eq('is_read', false);

    if (unreadError) {
      console.error('Error fetching unread notifications:', unreadError);
    } else {
      const unreadByUser = unreadStats.reduce((acc, notification) => {
        acc[notification.user_id] = (acc[notification.user_id] || 0) + 1;
        return acc;
      }, {});
      console.table(unreadByUser);
    }

    // 5. Check notification types distribution
    console.log('\n📈 Notification Types Distribution:');
    const { data: notificationTypes, error: typesError } = await supabase
      .from('notifications')
      .select('notification_type')
      .not('notification_type', 'is', null);

    if (typesError) {
      console.error('Error fetching notification types:', typesError);
    } else {
      const distribution = notificationTypes.reduce((acc, notification) => {
        acc[notification.notification_type] = (acc[notification.notification_type] || 0) + 1;
        return acc;
      }, {});
      console.table(distribution);
    }

    // 6. Check notifications for a specific user (first user found)
    console.log('\n👤 Sample User Notifications:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else if (users && users.length > 0) {
      const sampleUser = users[0];
      console.log(`Checking notifications for user: ${sampleUser.email} (${sampleUser.id})`);
      
      const { data: userNotifications, error: userNotificationsError } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          notification_type,
          is_read,
          created_at
        `)
        .eq('user_id', sampleUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (userNotificationsError) {
        console.error('Error fetching user notifications:', userNotificationsError);
      } else {
        if (userNotifications && userNotifications.length > 0) {
          console.table(userNotifications);
        } else {
          console.log('No notifications found for this user');
        }
      }
    }

    // 7. Check if RLS is enabled
    console.log('\n🔒 RLS Status Check:');
    try {
      // Try to access without user context - if RLS is enabled, this should fail
      const { data: rlsTest, error: rlsError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (rlsError && rlsError.code === 'PGRST301') {
        console.log('✅ RLS is enabled (access denied without proper context)');
      } else {
        console.log('⚠️ RLS might be disabled or bypassed');
      }
    } catch (error) {
      console.log('✅ RLS is likely enabled (access restricted)');
    }

    // 8. Test notification creation (sample)
    console.log('\n🧪 Testing Notification Creation:');
    if (users && users.length > 0) {
      const testNotification = {
        user_id: users[0].id,
        title: 'Test Notification',
        message: 'This is a test notification created by the check script',
        notification_type: 'system',
        data: { test: true, script: 'check-notifications-table.js' }
      };

      const { data: createResult, error: createError } = await supabase
        .from('notifications')
        .insert([testNotification])
        .select()
        .single();

      if (createError) {
        console.error('Error creating test notification:', createError);
      } else {
        console.log('✅ Test notification created successfully:', createResult.id);
        
        // Clean up test notification
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', createResult.id);

        if (deleteError) {
          console.error('Error deleting test notification:', deleteError);
        } else {
          console.log('🗑️ Test notification cleaned up');
        }
      }
    }

    // 9. Check related tables
    console.log('\n🔗 Related Tables Check:');
    
    // Check notification_templates
    const { count: templatesCount, error: templatesCountError } = await supabase
      .from('notification_templates')
      .select('*', { count: 'exact', head: true });

    if (templatesCountError) {
      console.error('Error checking notification_templates:', templatesCountError);
    } else {
      console.log(`Notification templates: ${templatesCount}`);
    }

    // Check notification_deliveries  
    const { count: deliveriesCount, error: deliveriesCountError } = await supabase
      .from('notification_deliveries')
      .select('*', { count: 'exact', head: true });

    if (deliveriesCountError) {
      console.error('Error checking notification_deliveries:', deliveriesCountError);
    } else {
      console.log(`Notification deliveries: ${deliveriesCount}`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkNotificationsTable().then(() => {
  console.log('\n✅ Notifications table check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during check:', error);
  process.exit(1);
});
