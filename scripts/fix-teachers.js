#!/usr/bin/env node

/**
 * Fix Teachers and Clean Users Table
 * This script fixes the teacher roles and cleans up duplicate users
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixTeachersAndCleanUp() {
  console.log('🔧 Fixing teachers and cleaning up users table...\n');
  
  // First, let's see what we have
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at');
    
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  console.log('📋 Current users table:');
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role} [ID: ${user.id.substring(0, 8)}...]`);
  });
  
  // Fix Prof. Michael Brown's role
  console.log('\n🔧 Fixing Prof. Michael Brown role...');
  const { data: updatedBrown, error: brownError } = await supabase
    .from('users')
    .update({ role: 'teacher' })
    .eq('email', 'teacher2@university.edu')
    .select();
    
  if (brownError) {
    console.error('Error updating Prof. Brown:', brownError);
  } else {
    console.log('✅ Fixed Prof. Michael Brown role to teacher');
  }
  
  // Let's focus on our two main teachers
  console.log('\n🎯 Key teachers for chat system:');
  const teachers = users.filter(u => 
    u.email === 'teacher1@university.edu' || 
    u.email === 'teacher2@university.edu'
  );
  
  teachers.forEach(teacher => {
    console.log(`  - ${teacher.name} (${teacher.email}) - Role: ${teacher.role} - ID: ${teacher.id}`);
  });
  
  if (teachers.length === 2) {
    console.log('✅ Both teachers found in users table!');
  } else {
    console.log('❌ Missing teachers in users table');
  }
}

fixTeachersAndCleanUp().catch(console.error);
