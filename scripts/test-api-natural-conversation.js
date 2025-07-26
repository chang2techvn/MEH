/**
 * Test Natural Conversation System via HTTP API
 * Tests the actual API endpoint that the frontend uses
 */

// Test configuration
const API_BASE_URL = 'http://localhost:3000'; // Change to your dev server URL
const TEST_SESSION_ID = 'test-session-' + Date.now();
const TEST_USER_MESSAGE = 'Hello everyone! What do you think about artificial intelligence in education?';
const SELECTED_AIS = ['ai1', 'ai2', 'ai3']; // Use actual AI IDs from your database

async function testNaturalConversationAPI() {
  console.log('🧪 Testing Natural Conversation API...\n');

  try {
    // Test the natural conversation API endpoint
    console.log('🚀 Sending message to natural conversation API...');
    console.log(`Message: "${TEST_USER_MESSAGE}"`);
    console.log(`Session ID: ${TEST_SESSION_ID}`);
    console.log(`Selected AIs: ${SELECTED_AIS.join(', ')}\n`);

    const response = await fetch(`${API_BASE_URL}/api/natural-group-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: TEST_USER_MESSAGE,
        sessionId: TEST_SESSION_ID,
        selectedAIs: SELECTED_AIS,
        conversationMode: 'natural_group'
      })
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:');
      console.error(`Status: ${response.status}`);
      console.error(`Response: ${errorText}`);
      return;
    }

    // Check if response is streaming
    if (response.headers.get('content-type')?.includes('text/plain')) {
      console.log('✅ Receiving streaming response...\n');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      let messageCount = 0;
      
      while (reader) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split by lines to process individual events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('\n🎉 Streaming completed successfully!');
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              messageCount++;
              
              console.log(`📨 Message ${messageCount}:`);
              console.log(`   AI: ${parsed.ai?.name || 'Unknown'}`);
              console.log(`   Type: ${parsed.type || 'response'}`);
              console.log(`   Content: ${parsed.content || 'No content'}`);
              
              if (parsed.vocabulary && parsed.vocabulary.length > 0) {
                console.log(`   📚 Vocabulary: ${parsed.vocabulary.length} items`);
              }
              
              if (parsed.processing_time) {
                console.log(`   ⏱️ Processing time: ${parsed.processing_time}ms`);
              }
              
              console.log('');
              
            } catch (parseError) {
              console.log(`   Raw data: ${data}`);
            }
          }
        }
      }
      
      console.log(`✅ Test completed! Received ${messageCount} AI responses.`);
      
    } else {
      // Non-streaming response
      const responseText = await response.text();
      console.log('✅ Non-streaming response received:');
      console.log(responseText);
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your development server is running:');
      console.log('   npm run dev');
    }
  }
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - need to install fetch
  console.log('⚠️ This script requires fetch API. Please run in a browser environment or install node-fetch.');
  console.log('For browser testing, open browser console and paste this script.');
} else {
  // Browser environment - run the test
  testNaturalConversationAPI().catch(console.error);
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.testNaturalConversation = testNaturalConversationAPI;
  console.log('🌐 Script loaded! Run testNaturalConversation() to test the API.');
}
