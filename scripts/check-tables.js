#!/usr/bin/env node

/**
 * Check Tables Script
 * This script checks all relevant tables for chat system debugging
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

async function checkTables() {
  console.log('🔍 Checking all tables for chat system...\n');
  
  // Check auth.users
  console.log('📋 AUTH USERS:');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (Auth ID: ${user.id})`);
    });
  }
  
  console.log('\n📋 PROFILES TABLE:');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name} (ID: ${profile.id}, Email: ${profile.email || 'N/A'})`);
    });
  }
  
  console.log('\n📋 USERS TABLE:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    if (users.length === 0) {
      console.log('  ⚠️ No users found in users table!');
    } else {
      users.forEach(user => {
        console.log(`  - ${user.full_name} (ID: ${user.id}, Email: ${user.email})`);
      });
    }
  }
  
  console.log('\n📋 CONVERSATIONS TABLE:');
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*');
  if (convError) {
    console.error('Error fetching conversations:', convError);
  } else {
    if (conversations.length === 0) {
      console.log('  ⚠️ No conversations found!');
    } else {
      conversations.forEach(conv => {
        console.log(`  - Conversation ${conv.id}: ${conv.title || 'Untitled'} (Participants: ${conv.participants?.length || 0})`);
      });
    }
  }
  
  console.log('\n📋 MESSAGES TABLE:');
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*');
  if (msgError) {
    console.error('Error fetching messages:', msgError);
  } else {
    if (messages.length === 0) {
      console.log('  ⚠️ No messages found!');
    } else {
      messages.forEach(msg => {
        console.log(`  - Message ${msg.id}: "${msg.content.substring(0, 50)}..." by User ${msg.user_id} in Conv ${msg.conversation_id}`);
      });
    }
  }
  
  console.log('\n🔍 MAPPING ANALYSIS:');
  console.log('Auth Users with matching Profiles:');
  if (authUsers && profiles) {
    authUsers.users.forEach(authUser => {
      const matchingProfile = profiles.find(p => p.id === authUser.id);
      if (matchingProfile) {
        console.log(`✅ ${authUser.email} -> Profile: ${matchingProfile.full_name}`);
      } else {
        console.log(`❌ ${authUser.email} -> No matching profile`);
      }
    });
  }
  
  console.log('\nAuth Users with matching Users table entries:');
  if (authUsers && users) {
    authUsers.users.forEach(authUser => {
      const matchingUser = users.find(u => u.id === authUser.id);
      if (matchingUser) {
        console.log(`✅ ${authUser.email} -> Users table: ${matchingUser.full_name}`);
      } else {
        console.log(`❌ ${authUser.email} -> No matching users table entry`);
      }
    });
  }
}

checkTables().catch(console.error);
