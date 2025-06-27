#!/usr/bin/env node

/**
 * Add Notifications for All Users Script
 * Creates comprehensive notifications for all existing users to ensure
 * the notification system is visible and working for everyone
 * 
 * Usage: node scripts/add-notifications-for-all-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔗 Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Notification templates for different user types
const NOTIFICATION_TEMPLATES = {
  student: [
    {
      title: "Welcome to English Learning Platform! 👋",
      message: "Start your English learning journey with our interactive challenges and AI-powered feedback.",
      notification_type: "system",
      data: { action_url: "/challenges" }
    },
    {
      title: "Daily Challenge Available ⭐",
      message: "Today's challenge focuses on conversation skills. Complete it to earn bonus points!",
      notification_type: "challenge",
      data: { action_url: "/ai-learning-hub" }
    },
    {
      title: "Streak Milestone! 🔥",
      message: "You're building a great learning habit! Keep practicing daily to maintain your streak.",
      notification_type: "achievement",
      data: { action_url: "/profile" }
    },
    {
      title: "New Video Lesson Available 📹",
      message: "Check out today's video lesson on English pronunciation and speaking techniques.",
      notification_type: "system",
      data: { action_url: "/ai-learning-hub" }
    },
    {
      title: "Community Update 💬",
      message: "Join the discussion! Your classmates are sharing their learning experiences.",
      notification_type: "system",
      data: { action_url: "/community" }
    }
  ],
  teacher: [
    {
      title: "Welcome, Teacher! 👨‍🏫",
      message: "Explore the teacher dashboard to monitor student progress and assign new challenges.",
      notification_type: "system",
      data: { action_url: "/profile" }
    },
    {
      title: "Student Submissions Ready 📝",
      message: "5 new student submissions are waiting for your review and feedback.",
      notification_type: "system",
      data: { action_url: "/profile" }
    },
    {
      title: "Weekly Progress Report 📊",
      message: "Your students completed 23 challenges this week with an average score of 85%.",
      notification_type: "system",
      data: { action_url: "/profile" }
    },
    {
      title: "New AI Assistant Available 🤖",
      message: "Try our new conversation practice AI to help students improve their speaking skills.",
      notification_type: "system",
      data: { action_url: "/ai-learning-hub" }
    }
  ],
  admin: [
    {
      title: "Platform Overview 🎯",
      message: "System status: All services running smoothly. 156 active users this week.",
      notification_type: "system",
      data: { action_url: "/profile" }
    },
    {
      title: "New Feature Released 🚀",
      message: "Video evaluation with AI feedback is now live for all users.",
      notification_type: "system",
      data: { action_url: "/ai-learning-hub" }
    },
    {
      title: "Security Update ✅",
      message: "All security patches applied successfully. Platform is secure and up-to-date.",
      notification_type: "system",
      data: { action_url: "/profile" }
    }
  ]
};

async function getAllUsers() {
  console.log('👥 Fetching all users...');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, role')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }

  console.log(`✅ Found ${users.length} users`);
  return users;
}

async function createNotificationsForUser(user) {
  const userRole = user.role || 'student';
  const templates = NOTIFICATION_TEMPLATES[userRole] || NOTIFICATION_TEMPLATES.student;
  
  console.log(`📨 Creating notifications for ${user.name || user.email} (${userRole})`);
  
  const notifications = templates.map((template, index) => ({
    user_id: user.id,
    title: template.title,
    message: template.message,
    notification_type: template.notification_type,
    data: template.data,
    is_read: index === 0 ? false : Math.random() > 0.3, // First notification unread, others randomly
    created_at: new Date(Date.now() - (index * 2 * 60 * 60 * 1000)).toISOString() // Spread over time
  }));

  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();

  if (error) {
    console.error(`❌ Error creating notifications for ${user.email}:`, error);
    return [];
  }

  console.log(`   ✅ Created ${data.length} notifications`);
  return data;
}

async function cleanExistingNotifications() {
  console.log('🧹 Cleaning existing notifications...');
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    console.error('❌ Error cleaning notifications:', error);
  } else {
    console.log('✅ Existing notifications cleaned');
  }
}

async function createSystemWideNotifications(users) {
  console.log('📢 Creating system-wide notifications...');
  
  const systemNotifications = [
    {
      title: "Platform Maintenance Complete ✅",
      message: "We've upgraded our servers for better performance. Enjoy faster loading times!",
      notification_type: "system",
      data: { action_url: "/" }
    },
    {
      title: "New Feature: AI Conversation Partner 🤖",
      message: "Practice speaking with our AI conversation partner. Available 24/7 to help improve your English!",
      notification_type: "system",
      data: { action_url: "/ai-learning-hub" }
    }
  ];

  const allUserNotifications = [];
  
  for (const notification of systemNotifications) {
    for (const user of users) {
      allUserNotifications.push({
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        notification_type: notification.notification_type,
        data: notification.data,
        is_read: false,
        created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert(allUserNotifications)
    .select();

  if (error) {
    console.error('❌ Error creating system-wide notifications:', error);
    return [];
  }

  console.log(`✅ Created ${data.length} system-wide notifications`);
  return data;
}

async function verifyNotifications() {
  console.log('🔍 Verifying notification distribution...');
  
  const { data: stats, error } = await supabase
    .from('notifications')
    .select('user_id, is_read')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error verifying notifications:', error);
    return;
  }

  const userStats = {};
  let totalUnread = 0;

  stats.forEach(notification => {
    if (!userStats[notification.user_id]) {
      userStats[notification.user_id] = { total: 0, unread: 0 };
    }
    userStats[notification.user_id].total++;
    if (!notification.is_read) {
      userStats[notification.user_id].unread++;
      totalUnread++;
    }
  });

  console.log('\n📊 NOTIFICATION STATISTICS:');
  console.log('=====================================');
  console.log(`Total notifications: ${stats.length}`);
  console.log(`Total unread: ${totalUnread}`);
  console.log(`Users with notifications: ${Object.keys(userStats).length}`);
  console.log('=====================================\n');

  return userStats;
}

async function main() {
  try {
    console.log('🚀 Starting notification population for all users...');
    console.log(`🕐 ${new Date().toISOString()}`);
    console.log('=====================================\n');

    // Get all users
    const users = await getAllUsers();
    
    if (users.length === 0) {
      console.log('❌ No users found. Please run the sample data script first.');
      return;
    }

    // Clean existing notifications
    await cleanExistingNotifications();

    // Create personalized notifications for each user
    let totalPersonalNotifications = 0;
    for (const user of users) {
      const notifications = await createNotificationsForUser(user);
      totalPersonalNotifications += notifications.length;
    }

    // Create system-wide notifications
    const systemNotifications = await createSystemWideNotifications(users);

    // Verify the results
    const stats = await verifyNotifications();

    console.log('\n🎉 NOTIFICATION POPULATION COMPLETED!');
    console.log('=====================================');
    console.log(`✅ Personal notifications: ${totalPersonalNotifications}`);
    console.log(`✅ System notifications: ${systemNotifications.length}`);
    console.log(`✅ Total notifications: ${totalPersonalNotifications + systemNotifications.length}`);
    console.log('\n📱 All users now have notifications to test the system!');
    console.log('Login with any account to see notifications in the header.');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
