#!/usr/bin/env node

/**
 * Fix User-Profile Mapping Script
 * This script fixes the mismatch between auth user IDs and profile IDs
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables. Check .env.local file exists in parent directory.');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixUserMapping() {
  console.log('🔧 Fixing user-profile mapping...');
  
  // Test authentication for known users
  const testUsers = [
    { email: 'teacher1@university.edu', expectedName: 'Prof. Sarah Wilson' },
    { email: 'teacher2@university.edu', expectedName: 'Prof. Michael Brown' },
    { email: 'admin@university.edu', expectedName: 'Dr. Sarah Admin' }
  ];
  
  for (const testUser of testUsers) {
    try {
      console.log(`\n🔍 Testing ${testUser.email}...`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: 'teacher123456'
      });
      
      if (error) {
        console.log(`❌ ${testUser.email}: ${error.message}`);
        continue;
      }
      
      console.log(`✅ Auth successful -> Auth ID: ${data.user.id}`);
      console.log(`   Expected name: ${testUser.expectedName}`);
      
      // Check if profile exists with this auth ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.log(`   ⚠️  No profile found with auth ID: ${data.user.id}`);
        
        // Find profile by name
        const { data: nameProfile, error: nameError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('full_name', testUser.expectedName)
          .single();
          
        if (nameError) {
          console.log(`   ❌ Profile not found by name: ${testUser.expectedName}`);
        } else {
          console.log(`   🔄 Found profile by name: ${nameProfile.full_name} (Current ID: ${nameProfile.id})`);
          console.log(`   📝 Need to update profile ID from ${nameProfile.id} to ${data.user.id}`);
          
          // First, delete the profile with auth ID if it exists
          await supabase.from('profiles').delete().eq('id', data.user.id);
          
          // Then update the profile ID to match auth ID
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ id: data.user.id })
            .eq('id', nameProfile.id);
            
          if (updateError) {
            console.log(`   ❌ Failed to update profile: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated profile ID to match auth ID`);
          }
        }
      } else {
        console.log(`   ✅ Profile found: ${profile.full_name}`);
      }
      
      await supabase.auth.signOut();
      
    } catch (err) {
      console.log(`❌ Error with ${testUser.email}: ${err.message}`);
    }
  }
  
  console.log('\n📋 Checking final state...');
  
  // Check profiles again
  const { data: finalProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name');
    
  console.log('\n👤 Final Profiles:');
  finalProfiles.forEach(profile => {
    console.log(`  - ${profile.full_name} (ID: ${profile.id})`);
  });
}

// Run the script
if (require.main === module) {
  fixUserMapping().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { fixUserMapping };
