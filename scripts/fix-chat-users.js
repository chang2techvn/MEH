#!/usr/bin/env node

/**
 * Fix Chat System Users
 * This script ensures the users table has the correct auth user IDs for the chat system
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixChatSystemUsers() {
  console.log('🔧 Fixing chat system users to match auth IDs...\n');
  
  // First, let's get the correct auth IDs by signing in
  const teacher1Auth = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123456'
  });
  
  const teacher2Auth = await supabase.auth.signInWithPassword({
    email: 'teacher2@university.edu', 
    password: 'teacher123456'
  });
  
  if (teacher1Auth.error || teacher2Auth.error) {
    console.error('Authentication failed:', { teacher1Auth: teacher1Auth.error, teacher2Auth: teacher2Auth.error });
    return;
  }
  
  const teacher1AuthId = teacher1Auth.data.user.id;
  const teacher2AuthId = teacher2Auth.data.user.id;
  
  console.log(`Teacher 1 Auth ID: ${teacher1AuthId}`);
  console.log(`Teacher 2 Auth ID: ${teacher2AuthId}`);
  
  // Clean up and create the correct user records
  console.log('\n🧹 Cleaning up existing users...');
  
  // Delete all users with teacher emails
  await supabase
    .from('users')
    .delete()
    .in('email', ['teacher1@university.edu', 'teacher2@university.edu']);
    
  console.log('✅ Cleaned up existing teacher users');
  
  // Create correct user records with matching auth IDs
  console.log('\n👤 Creating correct user records...');
  
  const correctUsers = [
    {
      id: teacher1AuthId,
      email: 'teacher1@university.edu',
      name: 'Prof. Sarah Wilson',
      role: 'teacher',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
      is_active: true,
      level: 1,
      points: 0,
      experience_points: 0,
      streak_days: 0
    },
    {
      id: teacher2AuthId,
      email: 'teacher2@university.edu',
      name: 'Prof. Michael Brown',
      role: 'teacher',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
      is_active: true,
      level: 1,
      points: 0,
      experience_points: 0,
      streak_days: 0
    }
  ];
  
  for (const user of correctUsers) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select();
      
    if (error) {
      console.error(`❌ Error creating user ${user.name}:`, error.message);
    } else {
      console.log(`✅ Created user: ${user.name} with ID ${user.id}`);
    }
  }
  
  // Verify the final state
  console.log('\n🔍 Final verification...');
  const { data: finalUsers, error: finalError } = await supabase
    .from('users')
    .select('*')
    .in('email', ['teacher1@university.edu', 'teacher2@university.edu']);
    
  if (finalError) {
    console.error('Error verifying users:', finalError);
  } else {
    console.log('\n📋 Final teacher users:');
    finalUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });
  }
  
  // Clean up auth sessions
  await supabase.auth.signOut();
}

fixChatSystemUsers().catch(console.error);
