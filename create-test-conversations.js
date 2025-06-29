const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestConversations() {
  console.log('🗣️ Creating test conversations for realtime...\n');

  try {
    // Get users
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(4);

    if (!users || users.length < 2) {
      console.log('❌ Need at least 2 users');
      return;
    }

    console.log('👥 Found users:', users.map(u => u.name));

    // Create conversations
    const conversations = [
      {
        title: 'English Study Group',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      },
      {
        title: 'Grammar Help',
        status: 'active', 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      }
    ];

    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert(conversations)
      .select();

    if (convError) {
      console.log('❌ Error creating conversations:', convError.message);
      return;
    }

    console.log('✅ Created conversations:', convData.map(c => c.title));

    // Add participants to conversations
    const participants = [];
    
    // Conversation 1: All users
    convData[0] && users.forEach((user, index) => {
      participants.push({
        conversation_id: convData[0].id,
        user_id: user.id,
        role: index === 0 ? 'moderator' : 'student',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString()
      });
    });

    // Conversation 2: First 2 users
    if (convData[1] && users.length >= 2) {
      participants.push(
        {
          conversation_id: convData[1].id,
          user_id: users[0].id,
          role: 'teacher',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        },
        {
          conversation_id: convData[1].id,
          user_id: users[1].id,
          role: 'student',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        }
      );
    }

    const { data: partData, error: partError } = await supabase
      .from('conversation_participants')
      .insert(participants)
      .select();

    if (partError) {
      console.log('❌ Error adding participants:', partError.message);
      return;
    }

    console.log('✅ Added participants:', partData.length);

    // Add some sample messages
    const messages = [
      {
        conversation_id: convData[0].id,
        sender_id: users[0].id,
        content: 'Welcome to our English study group!',
        message_type: 'text',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        conversation_id: convData[0].id,
        sender_id: users[1].id,
        content: 'Thank you! Looking forward to learning together.',
        message_type: 'text',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    ];

    if (convData[1]) {
      messages.push({
        conversation_id: convData[1].id,
        sender_id: users[0].id,
        content: 'Hi! I can help you with grammar questions.',
        message_type: 'text',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      });
    }

    const { data: msgData, error: msgError } = await supabase
      .from('conversation_messages')
      .insert(messages)
      .select();

    if (msgError) {
      console.log('❌ Error adding messages:', msgError.message);
      return;
    }

    console.log('✅ Added messages:', msgData.length);

    console.log('\n🎉 Test conversations created successfully!');
    console.log('Conversations:');
    convData.forEach(conv => {
      console.log(`- ${conv.title} (${conv.id})`);
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createTestConversations();
