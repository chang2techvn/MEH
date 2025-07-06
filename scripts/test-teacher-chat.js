#!/usr/bin/env node

/**
 * Test Start New Chat with teacher1@university.edu account specifically
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase CLOUD:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTeacherAccount() {
    console.log('🚀 Testing Start New Chat with teacher1@university.edu...\n');
    
    // Step 1: Login as teacher1
    console.log('🔐 Step 1: Login as teacher1');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'teacher1@university.edu',
        password: 'teacher123456'
    });
    
    if (authError) {
        console.error('❌ Login failed:', authError.message);
        return;
    }
    
    console.log(`✅ Login successful`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    
    // Step 2: Check current user profile
    console.log('\n👤 Step 2: Check current user profile');
    const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
    
    if (profileError) {
        console.error('❌ Profile fetch failed:', profileError);
    } else {
        console.log(`✅ Current user profile: ${currentProfile.full_name} (@${currentProfile.username})`);
    }
    
    // Step 3: Fetch available users (like Start New Chat does)
    console.log('\n📋 Step 3: Fetch available users for chat');
    const { data: availableUsers, error: usersError } = await supabase
        .from('profiles')
        .select(`
            id,
            user_id,
            username,
            full_name,
            avatar_url,
            users!inner(id, email, created_at)
        `)
        .neq('user_id', authData.user.id) // Exclude current user
        .order('users.created_at', { ascending: false })
        .limit(10);
    
    if (usersError) {
        console.error('❌ Available users fetch failed:', usersError);
    } else {
        console.log(`✅ Found ${availableUsers.length} available users:`);
        availableUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.full_name} (@${user.username}) - ${user.users.email}`);
        });
    }
    
    // Step 4: Check existing conversations
    console.log('\n💬 Step 4: Check existing conversations');
    const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`created_by.eq.${authData.user.id}`);
    
    if (conversationsError) {
        console.error('❌ Conversations fetch failed:', conversationsError);
    } else {
        console.log(`✅ Found ${conversations.length} existing conversations`);
        conversations.forEach((conv, index) => {
            console.log(`   ${index + 1}. ${conv.title || 'Untitled'} (created: ${conv.created_at})`);
        });
    }
    
    // Step 5: Check participation
    console.log('\n👥 Step 5: Check conversation participation');
    const { data: participations, error: participationError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('user_id', authData.user.id);
    
    if (participationError) {
        console.error('❌ Participation fetch failed:', participationError);
    } else {
        console.log(`✅ Participating in ${participations.length} conversations`);
    }
    
    // Logout
    await supabase.auth.signOut();
    console.log('\n🚪 Logged out successfully');
}

testTeacherAccount().catch(console.error);
