#!/usr/bin/env node

/**
 * Check users in both auth.users and public.users tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersState() {
    console.log('🚀 Checking users state...\n');
    
    // Check public.users
    console.log('📊 Checking public.users table:');
    const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('id, email, role, is_active');
    
    if (publicError) {
        console.error('❌ Error fetching public.users:', publicError);
    } else {
        console.log(`✅ Found ${publicUsers.length} users in public.users`);
        publicUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.role})`);
        });
    }
    
    // Check profiles
    console.log('\n👤 Checking profiles table:');
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, username, full_name, avatar_url');
    
    if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
    } else {
        console.log(`✅ Found ${profiles.length} profiles`);
        profiles.forEach((profile, index) => {
            console.log(`  ${index + 1}. ${profile.full_name} (@${profile.username}) - user_id: ${profile.user_id}`);
        });
    }
    
    // Check auth.users
    console.log('\n🔐 Checking auth.users table:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
        console.error('❌ Error fetching auth.users:', authError);
    } else {
        console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
        authUsers.users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} - auth_id: ${user.id}`);
        });
    }
}

checkUsersState().catch(console.error);
