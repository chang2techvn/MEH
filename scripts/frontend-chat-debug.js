// Frontend Debug Script for Chat Component
// Run this in browser console while logged in as teacher1 or teacher2

console.log('🔍 Starting Frontend Chat Debug Script...');

// Check if we're in the right context
if (typeof window === 'undefined') {
  console.error('❌ This script must be run in a browser');
} else {
  console.log('✅ Running in browser context');
}

// Function to debug chat state
function debugChatState() {
  console.log('\n📊 Current Chat State:');
  
  // Check if React DevTools is available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
  } else {
    console.log('⚠️ React DevTools not detected');
  }
  
  // Try to find chat context in window
  console.log('\n🔍 Looking for chat context...');
  
  // Check for common React patterns
  const reactFiber = document.querySelector('#__next')._reactInternalInstance ||
                    document.querySelector('#__next')._reactInternals;
  
  if (reactFiber) {
    console.log('✅ Found React Fiber');
  } else {
    console.log('❌ No React Fiber found');
  }
}

// Function to test Supabase client in browser
async function testSupabaseClient() {
  console.log('\n🔍 Testing Supabase Client in Browser...');
  
  // Check if Supabase is available
  if (typeof window.supabase !== 'undefined') {
    console.log('✅ Supabase client found in window');
    return window.supabase;
  }
  
  // Try to find it in modules
  console.log('🔍 Looking for Supabase in modules...');
  
  // Check if we can import it
  try {
    const { createClient } = await import('@supabase/supabase-js');
    console.log('✅ Supabase module available');
    
    // Get config from environment or meta tags
    const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content ||
                       'https://qjtxrfvejnjghmacpcny.supabase.co';
    const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content ||
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdHhyZnZlam5qZ2htYWNwY255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0Mjg0NDYsImV4cCI6MjA1MDAwNDQ0Nn0.DgBD1Uj6YkMN4IaFT34n5p6Q8pS4-yGDh1LNqJrqIV8';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Created Supabase client');
    
    // Test authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ User authenticated:', user.email);
      return { supabase, user };
    } else {
      console.log('❌ No authenticated user');
      return { supabase, user: null };
    }
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    return null;
  }
}

// Function to test realtime subscription
async function testRealtimeSubscription() {
  console.log('\n🔔 Testing Realtime Subscription...');
  
  const result = await testSupabaseClient();
  if (!result || !result.user) {
    console.log('❌ Cannot test realtime without authenticated user');
    return;
  }
  
  const { supabase, user } = result;
  
  // Get user's conversations
  console.log('🔍 Getting user conversations...');
  const { data: participants, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)
    .limit(1);
    
  if (error || !participants || participants.length === 0) {
    console.error('❌ No conversations found:', error);
    return;
  }
  
  const conversationId = participants[0].conversation_id;
  console.log('💬 Using conversation:', conversationId);
  
  // Set up realtime subscription
  let messageReceived = false;
  const channel = supabase
    .channel(`test-frontend-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('📨 FRONTEND REALTIME MESSAGE:', payload.new);
        messageReceived = true;
      }
    )
    .subscribe((status) => {
      console.log('🔔 Frontend subscription status:', status);
    });
  
  // Wait for subscription
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Send a test message
  const testMessage = `Frontend test - ${new Date().toLocaleTimeString()}`;
  console.log('📤 Sending test message:', testMessage);
  
  const { data, error: sendError } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: testMessage,
      message_type: 'text'
    })
    .select()
    .single();
    
  if (sendError) {
    console.error('❌ Failed to send message:', sendError);
    return;
  }
  
  console.log('✅ Message sent:', data.id);
  
  // Wait for realtime
  console.log('⏳ Waiting for realtime event...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (messageReceived) {
    console.log('✅ FRONTEND REALTIME WORKING');
  } else {
    console.log('❌ FRONTEND REALTIME NOT WORKING');
  }
  
  // Cleanup
  supabase.removeChannel(channel);
}

// Function to inspect React component state
function inspectReactState() {
  console.log('\n🔍 Inspecting React Component State...');
  
  // Look for chat-related elements
  const chatElements = document.querySelectorAll('[class*="chat"], [id*="chat"]');
  console.log(`🔍 Found ${chatElements.length} chat-related elements`);
  
  chatElements.forEach((element, index) => {
    console.log(`  ${index + 1}. ${element.tagName} - ${element.className || element.id}`);
    
    // Try to get React properties
    const reactKey = Object.keys(element).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternals'));
    if (reactKey) {
      console.log(`    ✅ React props found on element ${index + 1}`);
    }
  });
  
  // Look for message elements
  const messageElements = document.querySelectorAll('[class*="message"], [data-testid*="message"]');
  console.log(`📨 Found ${messageElements.length} message elements`);
  
  // Look for conversation elements
  const conversationElements = document.querySelectorAll('[class*="conversation"], [class*="chat-window"]');
  console.log(`💬 Found ${conversationElements.length} conversation elements`);
}

// Main debug function
async function runChatDebug() {
  console.log('🚀 Running Complete Chat Debug...\n');
  
  debugChatState();
  inspectReactState();
  await testRealtimeSubscription();
  
  console.log('\n✅ Chat debug completed');
  console.log('\n📋 Summary:');
  console.log('1. Copy this entire output');
  console.log('2. Check browser network tab for WebSocket connections');
  console.log('3. Check React DevTools for component state');
  console.log('4. Look for any console errors during message sending');
}

// Run the debug
runChatDebug().catch(error => {
  console.error('❌ Debug failed:', error);
});

// Export for manual use
window.chatDebug = {
  debugChatState,
  testSupabaseClient,
  testRealtimeSubscription,
  inspectReactState,
  runChatDebug
};

console.log('\n💡 Debug functions available:');
console.log('- window.chatDebug.runChatDebug() - Run full debug');
console.log('- window.chatDebug.testRealtimeSubscription() - Test realtime only');
console.log('- window.chatDebug.inspectReactState() - Inspect React state');
