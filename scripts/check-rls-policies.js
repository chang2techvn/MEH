#!/usr/bin/env node

/**
 * Check RLS Policies Script
 * This script checks the RLS policies for chat-related tables
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to check policies
);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies for chat tables...\n');
  
  // Check conversation_messages table policies
  console.log('📋 CONVERSATION_MESSAGES TABLE POLICIES:');
  const { data: convMsgPolicies, error: convMsgError } = await supabase
    .rpc('get_table_policies', { table_name: 'conversation_messages' })
    .catch(() => null);
    
  if (convMsgError) {
    console.log('⚠️ Could not fetch policies via RPC, checking manually...');
  }
  
  // Check table info
  const { data: tableInfo, error: tableError } = await supabase
    .from('conversation_messages')
    .select('*')
    .limit(1);
    
  if (tableError) {
    console.error('❌ Error accessing conversation_messages:', tableError);
  } else {
    console.log('✅ conversation_messages table accessible');
  }
  
  // Check conversations table
  console.log('\n💬 CONVERSATIONS TABLE:');
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .limit(1);
    
  if (convError) {
    console.error('❌ Error accessing conversations:', convError);
  } else {
    console.log('✅ conversations table accessible');
  }
  
  // Check conversation_participants table
  console.log('\n👥 CONVERSATION_PARTICIPANTS TABLE:');
  const { data: participants, error: partError } = await supabase
    .from('conversation_participants')
    .select('*')
    .limit(1);
    
  if (partError) {
    console.error('❌ Error accessing conversation_participants:', partError);
  } else {
    console.log('✅ conversation_participants table accessible');
  }
  
  // Check users table
  console.log('\n👤 USERS TABLE:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('email', ['teacher1@university.edu', 'teacher2@university.edu']);
    
  if (usersError) {
    console.error('❌ Error accessing users:', usersError);
  } else {
    console.log(`✅ users table accessible - found ${users.length} teachers`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`);
    });
  }
  
  // Test message creation with correct user context
  console.log('\n📝 Testing message creation with user context...');
  
  // Sign in as teacher1
  const teacher1Auth = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123456'
  });
  
  if (teacher1Auth.error) {
    console.error('❌ Teacher 1 auth failed:', teacher1Auth.error);
    return;
  }
  
  // Try to create a message as teacher1
  const { data: testMessage, error: msgError } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: '4856685f-f8d0-434d-8ba7-ecb51ef698a2',
      sender_id: teacher1Auth.data.user.id,
      content: 'RLS test message - ' + new Date().toISOString(),
      message_type: 'text'
    })
    .select();
    
  if (msgError) {
    console.error('❌ Error creating message as teacher1:', msgError);
  } else {
    console.log('✅ Message created successfully as teacher1');
  }
  
  await supabase.auth.signOut();
}

checkRLSPolicies().catch(console.error);
