#!/usr/bin/env node

/**
 * Create missing profile for teacher1@university.edu
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTeacherProfile() {
    console.log('👤 Creating missing profile for teacher1...\n');
    
    // Get teacher1 auth user ID
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const teacher1 = authUsers.users.find(u => u.email === 'teacher1@university.edu');
    
    if (!teacher1) {
        console.error('❌ Teacher1 not found in auth.users');
        return;
    }
    
    console.log(`✅ Found teacher1 in auth: ${teacher1.id}`);
    
    // Create profile
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            user_id: teacher1.id,
            username: 'prof_sarah',
            full_name: 'Prof. Sarah Wilson',
            avatar_url: 'https://avatar.iran.liara.run/public/2',
            bio: 'ESL instructor specializing in grammar',
            native_language: 'English',
            target_language: 'English',
            proficiency_level: 'advanced',
            timezone: 'America/Los_Angeles'
        })
        .select()
        .single();
    
    if (error) {
        console.error('❌ Error creating profile:', error);
    } else {
        console.log('✅ Profile created successfully:', data.full_name);
    }
}

createTeacherProfile().catch(console.error);
