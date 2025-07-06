#!/usr/bin/env node

/**
 * Check teacher1 ID mismatch between auth.users and profiles
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTeacher1IDs() {
    console.log('🔍 Checking teacher1 IDs across tables...\n');
    
    // Check auth.users
    console.log('🔐 Checking auth.users:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
        console.error('❌ Error fetching auth.users:', authError);
        return;
    }
    
    const teacher1Auth = authUsers.users.find(user => user.email === 'teacher1@university.edu');
    if (teacher1Auth) {
        console.log(`✅ teacher1 in auth.users: ${teacher1Auth.id}`);
    } else {
        console.log('❌ teacher1 NOT found in auth.users');
    }
    
    // Check public.users
    console.log('\n👤 Checking public.users:');
    const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', 'teacher1@university.edu');
    
    if (publicError) {
        console.error('❌ Error fetching public.users:', publicError);
    } else if (publicUsers.length > 0) {
        console.log(`✅ teacher1 in public.users: ${publicUsers[0].id}`);
    } else {
        console.log('❌ teacher1 NOT found in public.users');
    }
    
    // Check profiles
    console.log('\n📋 Checking profiles:');
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, username, full_name')
        .eq('username', 'prof_sarah');
    
    if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
    } else if (profiles.length > 0) {
        console.log(`✅ teacher1 profile found: user_id=${profiles[0].user_id}, profile_id=${profiles[0].id}`);
        console.log(`   Full name: ${profiles[0].full_name}`);
    } else {
        console.log('❌ teacher1 profile NOT found');
        
        // Check all profiles to see what's available
        const { data: allProfiles } = await supabase
            .from('profiles')
            .select('username, full_name, user_id');
        
        console.log('\n📊 All available profiles:');
        allProfiles.forEach(profile => {
            console.log(`   ${profile.username} (${profile.full_name}) - user_id: ${profile.user_id}`);
        });
    }
    
    // Compare IDs
    console.log('\n🔀 ID Comparison:');
    if (teacher1Auth && publicUsers.length > 0) {
        const authId = teacher1Auth.id;
        const publicId = publicUsers[0].id;
        
        console.log(`Auth ID:   ${authId}`);
        console.log(`Public ID: ${publicId}`);
        console.log(`Match: ${authId === publicId ? '✅ YES' : '❌ NO - THIS IS THE PROBLEM!'}`);
        
        if (profiles.length > 0) {
            const profileUserId = profiles[0].user_id;
            console.log(`Profile user_id: ${profileUserId}`);
            console.log(`Auth matches Profile: ${authId === profileUserId ? '✅ YES' : '❌ NO'}`);
            console.log(`Public matches Profile: ${publicId === profileUserId ? '✅ YES' : '❌ NO'}`);
        }
    }
}

checkTeacher1IDs().catch(console.error);
