#!/usr/bin/env node

/**
 * Update Teacher 2 ID
 * This script updates Prof. Michael Brown's user record to have the correct auth ID
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateTeacher2ID() {
  console.log('🔧 Updating Prof. Michael Brown ID...\n');
  
  const correctAuthId = '727a1f51-57fe-4ce6-b41d-69ae40fb2c5c';
  const wrongId = '3824bec3-dc3e-4a2e-96df-e72e271b1455';
  
  console.log(`Changing ID from ${wrongId} to ${correctAuthId}`);
  
  // Since we can't update primary keys directly, we need to delete and recreate
  console.log('🗑️ Removing incorrect record...');
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('email', 'teacher2@university.edu');
    
  if (deleteError) {
    console.error('Delete error:', deleteError);
    return;
  }
  
  console.log('✅ Deleted incorrect record');
  
  // Create new record with correct ID
  console.log('➕ Creating record with correct ID...');
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: correctAuthId,
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
    })
    .select();
    
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('✅ Created record with correct ID');
  }
  
  // Verify both teachers
  console.log('\n🔍 Final verification...');
  const { data: teachers, error: verifyError } = await supabase
    .from('users')
    .select('*')
    .in('email', ['teacher1@university.edu', 'teacher2@university.edu'])
    .order('email');
    
  if (verifyError) {
    console.error('Verify error:', verifyError);
  } else {
    console.log('\n📋 Both teachers:');
    teachers.forEach(teacher => {
      console.log(`  - ${teacher.name} (${teacher.email})`);
      console.log(`    ID: ${teacher.id}`);
      console.log(`    Role: ${teacher.role}`);
      console.log('');
    });
    
    if (teachers.length === 2) {
      console.log('✅ Both teachers ready for chat system!');
    }
  }
}

updateTeacher2ID().catch(console.error);
