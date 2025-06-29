#!/usr/bin/env node

/**
 * Populate Users Table Script
 * This script creates user records in the users table based on existing profiles
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables. Check .env.local file exists in parent directory.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key to bypass RLS
);

async function populateUsersTable() {
  console.log('🔧 Populating users table from profiles...\n');
  
  // Get all profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles to convert to users`);
  
  // Teacher emails mapping
  const teacherEmails = {
    '3fd6f201-16d1-4c38-8233-513ca600b8fe': 'teacher1@university.edu',
    '727a1f51-57fe-4ce6-b41d-69ae40fb2c5c': 'teacher2@university.edu',
    '8f235ba4-be13-43e4-bcab-8bcb71d17081': 'admin@university.edu'
  };
  
  // Student emails mapping (you can extend this)
  const studentEmails = {
    '8226238d-7946-495d-bac2-7e762c715d5e': 'john.smith@student.edu',
    'e1d4ce7a-b66d-4579-8b95-dac6dbd0dca8': 'maria.garcia@student.edu',
    'f835211d-3bb3-4ce1-89e9-24d9ef6a9671': 'yuki.tanaka@student.edu',
    'a0211337-3122-47a0-9fc2-740ca486db1a': 'ahmed.hassan@student.edu',
    'a7e37cf8-80e5-4556-a8a8-54336ee83aef': 'david.johnson@student.edu'
  };
  
  const allEmails = { ...teacherEmails, ...studentEmails };
  
  // Create users from profiles
  for (const profile of profiles) {
    const email = allEmails[profile.id];
    if (!email) {
      console.log(`⚠️ Skipping ${profile.full_name} - no email mapping found`);
      continue;
    }
    
    // Determine role
    const role = teacherEmails[profile.id] ? 'teacher' : 'student';
    
    const userData = {
      id: profile.id, // Use same ID as profile
      email: email,
      name: profile.full_name,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
      is_active: true,
      level: 1,
      points: 0,
      experience_points: 0,
      streak_days: 0
    };
    
    console.log(`Creating user record for ${profile.full_name} (${email})...`);
    
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select();
      
    if (error) {
      console.error(`❌ Error creating user ${profile.full_name}:`, error.message);
    } else {
      console.log(`✅ Created user: ${profile.full_name} (${role})`);
    }
  }
  
  console.log('\n🔍 Verifying users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
    
  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    console.log(`\n📋 Users table now contains ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
  }
}

populateUsersTable().catch(console.error);
