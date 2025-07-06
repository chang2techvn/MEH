#!/usr/bin/env node

/**
 * Test Start New Chat functionality with authenticated context
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

async function testStartNewChat() {
    console.log('🚀 Testing Start New Chat functionality...\n');
    
    // First, try to simulate login with a test user
    console.log('🔐 Step 1: Login with test user');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'john.smith@university.edu',
        password: 'student123456'
    });
    
    if (authError) {
        console.error('❌ Login failed:', authError.message);
        console.log('⚠️ Continuing with anonymous context...\n');
    } else {
        console.log(`✅ Logged in as: ${authData.user.email}`);
        console.log(`🆔 Auth ID: ${authData.user.id}\n`);
    }
    
    // Get current user context
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    console.log('👤 Step 2: Check current user context');
    if (currentUserId) {
        console.log(`✅ Current user ID: ${currentUserId}`);
        console.log(`📧 Current user email: ${user.email}`);
    } else {
        console.log('⚠️ No authenticated user');
    }
    
    // Test fetching users for chat (excluding current user)
    console.log('\n📋 Step 3: Fetch users for Start New Chat');
    const { data: chatUsers, error: chatError } = await supabase
        .from('users')
        .select(`
            id,
            email,
            role,
            profiles (
                username,
                full_name,
                avatar_url
            )
        `)
        .neq('role', 'admin') // Usually exclude admin
        .neq('id', currentUserId || 'none') // Exclude current user
        .eq('is_active', true);
    
    if (chatError) {
        console.error('❌ Error fetching chat users:', chatError);
    } else {
        console.log(`✅ Found ${chatUsers.length} users available for chat`);
        chatUsers.forEach((user, index) => {
            const profile = user.profiles?.[0] || {};
            console.log(`  ${index + 1}. ${profile.full_name || user.email} (@${profile.username || 'no-username'}) - Role: ${user.role}`);
        });
    }
    
    // Test with profiles-first approach (like some components might use)
    console.log('\n👥 Step 4: Alternative - Fetch via profiles table');
    const { data: profileUsers, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id,
            user_id,
            username,
            full_name,
            avatar_url,
            users!inner (
                id,
                email,
                role,
                is_active
            )
        `)
        .neq('users.role', 'admin')
        .neq('user_id', currentUserId || 'none')
        .eq('users.is_active', true);
    
    if (profileError) {
        console.error('❌ Error fetching via profiles:', profileError);
    } else {
        console.log(`✅ Found ${profileUsers.length} profiles available for chat`);
        profileUsers.forEach((profile, index) => {
            console.log(`  ${index + 1}. ${profile.full_name} (@${profile.username}) - Email: ${profile.users.email}`);
        });
    }
    
    // Test simple users query without auth context
    console.log('\n🔓 Step 5: Test without authentication filter');
    const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('is_active', true)
        .limit(5);
    
    if (allError) {
        console.error('❌ Error fetching all users:', allError);
    } else {
        console.log(`✅ Found ${allUsers.length} active users (no auth filter)`);
        allUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.role})`);
        });
    }
}

testStartNewChat().catch(console.error);
