#!/usr/bin/env node

/**
 * Test Start New Chat functionality with authenticated context
 * This simulates what the component actually does
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase with ANON KEY (like frontend):', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStartNewChat() {
    console.log('🚀 Testing Start New Chat functionality...\n');
    
    // Simulate login with john.smith
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'john.smith@university.edu',
        password: 'student123456'
    });
    
    if (authError) {
        console.error('❌ Login failed:', authError);
        return;
    }
    
    console.log('✅ Logged in as:', authData.user.email);
    console.log('🆔 Auth user ID:', authData.user.id);
    
    // Test 1: Fetch users like the component does
    console.log('\n📋 Test 1: Fetch available users for chat');
    
    // This is the exact query from the component
    const { data: availableUsers, error: usersError } = await supabase
        .from('profiles')
        .select(`
            id,
            user_id,
            username,
            full_name,
            avatar_url,
            users!inner(
                id,
                email,
                last_login,
                created_at
            )
        `)
        .neq('user_id', authData.user.id) // Exclude current user
        .limit(10);
    
    if (usersError) {
        console.error('❌ Error fetching users:', usersError);
    } else {
        console.log(`✅ Found ${availableUsers.length} available users`);
        availableUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.full_name} (@${user.username}) - ${user.users.email}`);
        });
    }
    
    // Test 2: Check current user's profile
    console.log('\n👤 Test 2: Check current user profile');
    const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
    
    if (profileError) {
        console.error('❌ Error fetching current user profile:', profileError);
    } else {
        console.log('✅ Current user profile:', currentProfile.full_name, '@' + currentProfile.username);
    }
    
    // Test 3: Check existing conversations
    console.log('\n💬 Test 3: Check existing conversations');
    const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
            id,
            title,
            conversation_participants(
                user_id,
                role
            )
        `)
        .limit(5);
    
    if (convError) {
        console.error('❌ Error fetching conversations:', convError);
    } else {
        console.log(`✅ Found ${conversations.length} existing conversations`);
        conversations.forEach((conv, index) => {
            console.log(`  ${index + 1}. ${conv.title || 'Untitled'} (${conv.conversation_participants.length} participants)`);
        });
    }
    
    // Clean up - sign out
    await supabase.auth.signOut();
    console.log('\n🚪 Signed out');
}

testStartNewChat().catch(console.error);
