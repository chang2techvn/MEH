#!/usr/bin/env node

/**
 * Debug Message Persistence and Realtime
 * This script checks why messages disappear and realtime doesn't work
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugMessageIssues() {
  console.log('🔍 Debugging message persistence and realtime issues...\n');
  
  // Check message count before and after
  console.log('📊 Current message count:');
  const { data: messagesBefore, error: beforeError } = await supabase
    .from('conversation_messages')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (beforeError) {
    console.error('Error fetching messages:', beforeError);
    return;
  }
  
  console.log(`Total messages: ${messagesBefore.length}`);
  console.log('Recent messages:');
  messagesBefore.slice(0, 5).forEach((msg, index) => {
    console.log(`  ${index + 1}. "${msg.content.substring(0, 50)}..." (${new Date(msg.created_at).toLocaleString()})`);
  });
  
  // Check RLS policies that might affect message visibility
  console.log('\n🔐 Checking RLS policies...');
  
  // Test as teacher1
  console.log('\n👤 Testing as teacher1...');
  const teacher1Auth = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123456'
  });
  
  if (teacher1Auth.error) {
    console.error('Teacher1 auth failed:', teacher1Auth.error);
    return;
  }
  
  // Create anon client to simulate browser behavior
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Set session manually
  await anonSupabase.auth.setSession({
    access_token: teacher1Auth.data.session.access_token,
    refresh_token: teacher1Auth.data.session.refresh_token
  });
  
  const { data: teacher1Messages, error: teacher1Error } = await anonSupabase
    .from('conversation_messages')
    .select('*')
    .order('created_at', { ascending: false });
    
  console.log(`Teacher1 can see ${teacher1Messages?.length || 0} messages`);
  if (teacher1Error) {
    console.error('Teacher1 RLS error:', teacher1Error);
  }
  
  // Test as teacher2
  console.log('\n👤 Testing as teacher2...');
  await supabase.auth.signOut();
  await anonSupabase.auth.signOut();
  
  const teacher2Auth = await supabase.auth.signInWithPassword({
    email: 'teacher2@university.edu',
    password: 'teacher123456'
  });
  
  if (teacher2Auth.error) {
    console.error('Teacher2 auth failed:', teacher2Auth.error);
    return;
  }
  
  await anonSupabase.auth.setSession({
    access_token: teacher2Auth.data.session.access_token,
    refresh_token: teacher2Auth.data.session.refresh_token
  });
  
  const { data: teacher2Messages, error: teacher2Error } = await anonSupabase
    .from('conversation_messages')
    .select('*')
    .order('created_at', { ascending: false });
    
  console.log(`Teacher2 can see ${teacher2Messages?.length || 0} messages`);
  if (teacher2Error) {
    console.error('Teacher2 RLS error:', teacher2Error);
  }
  
  // Test message sending with proper RLS
  console.log('\n📝 Testing message sending with RLS...');
  const testConvId = '4856685f-f8d0-434d-8ba7-ecb51ef698a2';
  
  const { data: newMessage, error: sendError } = await anonSupabase
    .from('conversation_messages')
    .insert({
      conversation_id: testConvId,
      sender_id: teacher2Auth.data.user.id,
      content: 'RLS test message - ' + new Date().toISOString(),
      message_type: 'text'
    })
    .select();
    
  if (sendError) {
    console.error('❌ Message sending failed with RLS:', sendError);
  } else {
    console.log('✅ Message sent successfully with RLS');
    
    // Verify message persists
    setTimeout(async () => {
      const { data: verifyMessages, error: verifyError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('id', newMessage[0].id);
        
      if (verifyError || !verifyMessages || verifyMessages.length === 0) {
        console.log('❌ Message disappeared from database!');
        console.error('Verify error:', verifyError);
      } else {
        console.log('✅ Message persisted in database');
      }
    }, 2000);
  }
  
  // Test realtime subscription
  console.log('\n📡 Testing realtime subscription...');
  let realtimeWorking = false;
  
  const channel = anonSupabase
    .channel('debug-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${testConvId}`
      },
      (payload) => {
        console.log('🎉 REALTIME WORKING! Received:', payload.new.content);
        realtimeWorking = true;
      }
    )
    .subscribe();
    
  // Wait for subscription to be ready
  setTimeout(async () => {
    console.log('Sending realtime test message...');
    await anonSupabase
      .from('conversation_messages')
      .insert({
        conversation_id: testConvId,
        sender_id: teacher2Auth.data.user.id,
        content: 'Realtime debug test - ' + new Date().toISOString(),
        message_type: 'text'
      });
      
    // Check realtime result
    setTimeout(() => {
      if (realtimeWorking) {
        console.log('✅ Realtime is working!');
      } else {
        console.log('❌ Realtime not working');
        console.log('🔧 Possible solutions:');
        console.log('   1. Check if realtime is enabled for conversation_messages table');
        console.log('   2. Verify RLS policies allow realtime subscriptions');
        console.log('   3. Check Supabase local setup');
      }
      
      console.log('\n📋 SUMMARY:');
      console.log('===========');
      console.log(`- Total messages in DB: ${messagesBefore.length}`);
      console.log(`- Teacher1 can see: ${teacher1Messages?.length || 0} messages`);
      console.log(`- Teacher2 can see: ${teacher2Messages?.length || 0} messages`);
      console.log(`- Message sending: ${sendError ? 'Failed' : 'Working'}`);
      console.log(`- Realtime: ${realtimeWorking ? 'Working' : 'Not working'}`);
      
      channel.unsubscribe();
      process.exit(0);
    }, 3000);
  }, 2000);
}

debugMessageIssues().catch(console.error);
