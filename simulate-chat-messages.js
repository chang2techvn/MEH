const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulateRealtimeMessages() {
  console.log('🔍 Simulating Realtime Messages for Frontend Testing...\n');

  try {
    // Get conversation and users
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, title')
      .limit(1)
      .single();

    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .limit(2);

    if (!conversation || !users || users.length < 2) {
      console.log('❌ Need conversation and users');
      return;
    }

    console.log('✅ Using conversation:', conversation.title);
    console.log('✅ Users:', users.map(u => u.name).join(', '));

    // Send messages every 3 seconds
    let messageCount = 0;
    const maxMessages = 5;

    const interval = setInterval(async () => {
      messageCount++;
      
      const sender = users[messageCount % 2]; // Alternate between users
      const content = `Auto message ${messageCount} from ${sender.name} - ${new Date().toISOString()}`;

      console.log(`\n📨 Sending message ${messageCount}/${maxMessages}:`);
      console.log(`From: ${sender.name}`);
      console.log(`Content: ${content}`);

      const { data: result, error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: sender.id,
          content: content,
          message_type: 'text'
        })
        .select();

      if (error) {
        console.log('❌ Error:', error.message);
      } else {
        console.log('✅ Message sent successfully');
      }

      if (messageCount >= maxMessages) {
        clearInterval(interval);
        console.log('\n✅ Finished sending test messages');
        console.log('👀 Check your frontend to see if realtime messages appear!');
        process.exit(0);
      }
    }, 3000);

    console.log('⏳ Will send 1 message every 3 seconds...');
    console.log('🚀 Open your frontend app and check the chat to see realtime updates!');

  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
}

simulateRealtimeMessages();
