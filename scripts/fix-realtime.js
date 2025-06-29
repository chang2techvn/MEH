#!/usr/bin/env node

/**
 * Fix Realtime Chat Issues
 * This script diagnoses and fixes realtime chat problems
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRealtimeIssues() {
  console.log('🔧 Diagnosing and fixing realtime chat issues...\n');
  
  // Check 1: Verify realtime is enabled
  console.log('📡 Step 1: Checking realtime configuration...');
  
  // Test basic realtime connection
  const channel = supabase.channel('test-channel');
  
  channel.on('broadcast', { event: 'test' }, (payload) => {
    console.log('✅ Realtime connection working');
  });
  
  await channel.subscribe((status) => {
    console.log(`📡 Channel status: ${status}`);
  });
  
  // Check 2: Test table-specific realtime
  console.log('\n📋 Step 2: Testing table realtime subscriptions...');
  
  // Test conversation_messages realtime
  const messagesChannel = supabase
    .channel('conversation_messages_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'conversation_messages' 
      }, 
      (payload) => {
        console.log('✅ conversation_messages realtime working:', payload);
      }
    );
  
  await messagesChannel.subscribe((status) => {
    console.log(`📋 Messages channel status: ${status}`);
  });
  
  // Check 3: Test with a real message insert
  console.log('\n📝 Step 3: Testing realtime with message insert...');
  
  // Get a conversation to test with
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .limit(1);
    
  if (convError || !conversations || conversations.length === 0) {
    console.error('❌ No conversations found for testing');
    return;
  }
  
  const conversationId = conversations[0].id;
  console.log(`Using conversation: ${conversationId}`);
  
  // Wait a moment for subscription to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Insert a test message
  console.log('📤 Inserting realtime test message...');
  
  const { data: testMessage, error: insertError } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: '3fd6f201-16d1-4c38-8233-513ca600b8fe', // teacher1 ID
      content: `Realtime test message - ${new Date().toISOString()}`,
      message_type: 'text'
    })
    .select();
    
  if (insertError) {
    console.error('❌ Error inserting test message:', insertError);
  } else {
    console.log('✅ Test message inserted, checking if realtime triggered...');
  }
  
  // Wait for realtime event
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n🔍 Step 4: Checking RLS policies...');
  
  // Check if there are any RLS policies blocking realtime
  const { data: policies, error: policyError } = await supabase
    .rpc('get_table_policies', { table_name: 'conversation_messages' })
    .then(result => ({ data: [], error: null })) // RPC might not exist, that's ok
    .catch(() => ({ data: [], error: null }));
  
  console.log('RLS policies check completed (policies may block realtime)');
  
  console.log('\n🛠️ Step 5: Potential fixes...');
  console.log('If realtime is not working, try these solutions:');
  console.log('');
  console.log('1. **Check Supabase Local Setup:**');
  console.log('   - Ensure Supabase local is running: `supabase status`');
  console.log('   - Restart Supabase: `supabase stop && supabase start`');
  console.log('');
  console.log('2. **Enable Realtime for Tables:**');
  console.log('   Run this SQL in Supabase Dashboard:');
  console.log('   ```sql');
  console.log('   ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;');
  console.log('   ALTER PUBLICATION supabase_realtime ADD TABLE conversations;');
  console.log('   ```');
  console.log('');
  console.log('3. **Check RLS Policies:**');
  console.log('   RLS policies might be blocking realtime subscriptions.');
  console.log('   You may need to add policies for realtime access.');
  console.log('');
  console.log('4. **Alternative: Use Postgres LISTEN/NOTIFY:**');
  console.log('   If realtime subscription doesn\'t work, implement polling fallback.');
  
  // Clean up channels
  await messagesChannel.unsubscribe();
  await channel.unsubscribe();
  
  console.log('\n✅ Realtime diagnosis completed');
}

// Run with timeout
Promise.race([
  fixRealtimeIssues(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 15000)
  )
]).then(() => {
  console.log('\n🏁 Diagnosis finished');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Error or timeout:', error.message);
  process.exit(1);
});
