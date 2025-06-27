#!/usr/bin/env node

/**
 * Fix Teacher Account Script
 * Updates teacher1@university.edu to have proper role and notifications
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔗 Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    console.log('🔧 Fixing teacher1@university.edu account...');
    
    // Step 1: Update user role and stats
    console.log('📝 Updating user role and stats...');
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        role: 'teacher',
        points: 3200,
        level: 50,
        streak_days: 45
      })
      .eq('email', 'teacher1@university.edu')
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return;
    }
    
    console.log('✅ User updated:', updatedUser.email, 'Role:', updatedUser.role);
    
    // Step 2: Delete existing notifications for this user
    console.log('🧹 Cleaning existing notifications...');
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', updatedUser.id);
    
    if (deleteError) {
      console.warn('⚠️ Warning deleting notifications:', deleteError.message);
    }
    
    // Step 3: Create teacher-specific notifications
    console.log('📨 Creating teacher notifications...');
    const teacherNotifications = [
      {
        user_id: updatedUser.id,
        title: 'Welcome, Teacher! 👨‍🏫',
        message: 'Explore the teacher dashboard to monitor student progress and assign new challenges.',
        notification_type: 'system',
        data: JSON.stringify({ action_url: '/profile' }),
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: updatedUser.id,
        title: 'Student Submissions Ready 📝',
        message: '5 new student submissions are waiting for your review and feedback.',
        notification_type: 'system',
        data: JSON.stringify({ action_url: '/profile' }),
        is_read: false,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: updatedUser.id,
        title: 'Weekly Progress Report 📊',
        message: 'Your students completed 23 challenges this week with an average score of 85%.',
        notification_type: 'system',
        data: JSON.stringify({ action_url: '/profile' }),
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        user_id: updatedUser.id,
        title: 'New AI Assistant Available 🤖',
        message: 'Try our new conversation practice AI to help students improve their speaking skills.',
        notification_type: 'system',
        data: JSON.stringify({ action_url: '/ai-learning-hub' }),
        is_read: false,
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        user_id: updatedUser.id,
        title: 'Platform Maintenance Complete ✅',
        message: 'We\'ve upgraded our servers for better performance. Enjoy faster loading times!',
        notification_type: 'system',
        data: JSON.stringify({ action_url: '/' }),
        is_read: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ];
    
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .insert(teacherNotifications)
      .select();
    
    if (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
      return;
    }
    
    console.log(`✅ Created ${notifications.length} notifications for teacher`);
    
    // Step 4: Verify the fix
    console.log('🔍 Verifying fix...');
    const { data: verification } = await supabase
      .from('users')
      .select('email, role')
      .eq('email', 'teacher1@university.edu')
      .single();
    
    const { data: notifCount, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', updatedUser.id);
    
    console.log('\n📊 VERIFICATION RESULTS:');
    console.log('=====================================');
    console.log(`Email: ${verification.email}`);
    console.log(`Role: ${verification.role}`);
    console.log(`Notifications: ${notifCount?.length || 0}`);
    console.log('=====================================');
    
    if (verification.role === 'teacher' && (notifCount?.length || 0) > 0) {
      console.log('\n🎉 SUCCESS! Teacher account fixed!');
      console.log('You can now log in with teacher1@university.edu and see notifications.');
    } else {
      console.log('\n❌ Something went wrong. Please check manually.');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();
