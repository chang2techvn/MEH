/**
 * Script to populate sample notifications for testing
 * Run with: node scripts/populate-notifications.js
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

async function populateNotifications() {
  console.log('🔔 Populating Sample Notifications\n');
  
  try {
    // Get first few users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('No users found. Please run populate-sample-data.js first');
      return;
    }

    console.log(`Found ${users.length} users to create notifications for`);

    // Create sample notifications for each user
    const notifications = [];
    
    for (const user of users) {
      // Recent unread notifications
      notifications.push(
        {
          user_id: user.id,
          title: 'New Challenge Available',
          message: 'A new "Technology Impact" challenge has been unlocked for you!',
          notification_type: 'challenge',
          is_read: false,
          data: { action_url: '/challenges', challenge_id: 'tech-impact-2024' },
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
        },
        {
          user_id: user.id,
          title: 'New Achievement Unlocked',
          message: 'Your teacher has provided feedback on your latest speaking exercise.',
          notification_type: 'achievement',
          is_read: false,
          data: { action_url: '/profile', submission_id: 'sub-123' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          user_id: user.id,
          title: 'New Comment on Your Post',
          message: 'Sarah Williams commented on your post "My English Learning Journey".',
          notification_type: 'comment',
          is_read: false,
          data: { action_url: '/community', post_id: 'post-456' },
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
        },
        {
          user_id: user.id,
          title: 'Achievement Unlocked!',
          message: 'Congratulations! You\'ve completed a 7-day learning streak.',
          notification_type: 'achievement',
          is_read: true,
          data: { action_url: '/profile', achievement_id: 'streak-7' },
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          user_id: user.id,
          title: 'Someone Liked Your Post',
          message: 'Alex Johnson liked your community post.',
          notification_type: 'like',
          is_read: true,
          data: { action_url: '/community', post_id: 'post-789' },
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          user_id: user.id,
          title: 'New Follower',
          message: 'Emily Chen started following you.',
          notification_type: 'follow',
          is_read: true,
          data: { action_url: '/profile', follower_id: 'user-emily' },
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          user_id: user.id,
          title: 'System Maintenance',
          message: 'We\'ll be performing system maintenance on Sunday from 2-4 AM UTC.',
          notification_type: 'system',
          is_read: false,
          data: { action_url: '/announcements' },
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        }
      );
    }

    // Insert all notifications
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Error inserting notifications:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${insertedNotifications.length} notifications`);

    // Show summary by user
    console.log('\n📊 Notifications Summary by User:');
    for (const user of users) {
      const userNotifications = insertedNotifications.filter(n => n.user_id === user.id);
      const unreadCount = userNotifications.filter(n => !n.is_read).length;
      console.log(`${user.email}: ${userNotifications.length} total, ${unreadCount} unread`);
    }

    // Show notification types
    console.log('\n📈 Notification Types Created:');
    const typeCount = {};
    insertedNotifications.forEach(n => {
      typeCount[n.notification_type] = (typeCount[n.notification_type] || 0) + 1;
    });
    console.table(typeCount);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the population
populateNotifications().then(() => {
  console.log('\n✅ Sample notifications population completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during population:', error);
  process.exit(1);
});
