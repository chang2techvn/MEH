require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSampleMessages() {
  console.log('🔄 Creating sample messages...');
  
  // Get some conversations first
  const { data: conversations, error: conversationError } = await supabase
    .from('conversations')
    .select('id')
    .limit(3);
  
  if (conversationError || !conversations || conversations.length === 0) {
    console.error('❌ Error getting conversations:', conversationError);
    return;
  }
  
  console.log(`✅ Found ${conversations.length} conversations`);
  
  // Get some users to send messages
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email')
    .limit(5);
  
  if (usersError || !users || users.length === 0) {
    console.error('❌ Error getting users:', usersError);
    return;
  }
  
  console.log(`✅ Found ${users.length} users`);
  
  // Create sample messages
  const sampleMessages = [
    {
      conversation_id: conversations[0].id,
      sender_id: users[0].id,
      content: 'Hello! How are you doing today?',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      conversation_id: conversations[0].id,
      sender_id: users[1].id,
      content: 'Hi there! I\'m doing well, thanks for asking. How about you?',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
    },
    {
      conversation_id: conversations[0].id,
      sender_id: users[0].id,
      content: 'I\'m great! Just working on some English practice.',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    },
    {
      conversation_id: conversations[1].id,
      sender_id: users[1].id,
      content: 'Hey! Did you complete today\'s challenge?',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    },
    {
      conversation_id: conversations[1].id,
      sender_id: users[2].id,
      content: 'Yes! It was quite challenging but fun.',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
    },
    {
      conversation_id: conversations[2].id,
      sender_id: users[3].id,
      content: 'Good morning everyone! Ready for today\'s lesson?',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
    }
  ];
  
  console.log('📝 Inserting sample messages...');
  
  for (const message of sampleMessages) {
    console.log(`  Creating message: "${message.content}" by ${message.sender_id}`);
    
    const { error: insertError } = await supabase
      .from('conversation_messages')
      .insert([message]);
    
    if (insertError) {
      console.error(`❌ Error inserting message:`, insertError);
    } else {
      console.log(`✅ Message inserted successfully`);
    }
  }
  
  console.log('✅ Sample messages created! Check the Messages interface now.');
}

createSampleMessages().catch(console.error);
