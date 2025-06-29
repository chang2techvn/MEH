const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncAuthAndDatabaseUsers() {
  console.log('🔧 Syncing auth and database users...\n');

  try {
    const authUserId = '3fd6f201-16d1-4c38-8233-513ca600b8fe'; // Auth ID
    const dbUserId = '4bfefa38-468c-441b-9181-4f4e433236b7';   // Database ID

    console.log('1. Updating database user ID to match auth...');
    
    // Update all references to the old user ID
    const tables = [
      'conversation_participants',
      'conversation_messages',
      'user_progress',
      'challenge_submissions',
      'posts',
      'comments',
      'messages',
      'follows',
      'likes',
      'notifications',
      'user_achievements'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .update({ user_id: authUserId })
        .eq('user_id', dbUserId);

      if (error && !error.message.includes('column "user_id" does not exist')) {
        console.log(`⚠️ Warning updating ${table}:`, error.message);
      }

      // Also try sender_id and receiver_id for messages tables
      if (table === 'conversation_messages' || table === 'messages') {
        await supabase.from(table).update({ sender_id: authUserId }).eq('sender_id', dbUserId);
        if (table === 'messages') {
          await supabase.from(table).update({ receiver_id: authUserId }).eq('receiver_id', dbUserId);
        }
      }
    }

    // Update the users table
    const { error: userError } = await supabase
      .from('users')
      .update({ id: authUserId })
      .eq('id', dbUserId);

    if (userError) {
      console.log('❌ Error updating user ID:', userError.message);
      
      // Alternative: Delete old user and create new one
      console.log('2. Trying alternative approach: recreate user...');
      
      // Get old user data
      const { data: oldUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', dbUserId)
        .single();

      if (oldUser) {
        // Delete old user
        await supabase.from('users').delete().eq('id', dbUserId);
        
        // Create new user with auth ID
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            ...oldUser,
            id: authUserId
          })
          .select()
          .single();

        if (createError) {
          console.log('❌ Error creating new user:', createError.message);
          return;
        }

        console.log('✅ Recreated user with correct ID');
      }
    } else {
      console.log('✅ Updated user ID successfully');
    }

    // 3. Create conversations for teacher1
    console.log('\n3. Creating conversations for teacher1...');
    
    const { data: otherUsers } = await supabase
      .from('users')
      .select('id, name, email')
      .neq('id', authUserId)
      .limit(3);

    if (!otherUsers || otherUsers.length === 0) {
      console.log('❌ No other users found');
      return;
    }

    // Create 2 conversations
    for (let i = 0; i < Math.min(2, otherUsers.length); i++) {
      const otherUser = otherUsers[i];
      
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', authUserId);

      if (existingConv && existingConv.length > 0) {
        console.log('✅ Conversations already exist for this user');
        break;
      }

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: `Chat: Prof. Sarah Wilson & ${otherUser.name}`,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (convError) {
        console.log(`❌ Error creating conversation:`, convError.message);
        continue;
      }

      // Add participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: authUserId,
            role: 'teacher',
            joined_at: new Date().toISOString(),
            last_read_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          },
          {
            conversation_id: conversation.id,
            user_id: otherUser.id,
            role: 'student',
            joined_at: new Date().toISOString(),
            last_read_at: new Date().toISOString()
          }
        ]);

      if (partError) {
        console.log(`❌ Error adding participants:`, partError.message);
        continue;
      }

      // Add messages
      const messages = [
        {
          conversation_id: conversation.id,
          sender_id: otherUser.id,
          content: `Hi Prof. Wilson! I need help with my English studies. Could you help me with grammar?`,
          message_type: 'text',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          conversation_id: conversation.id,
          sender_id: authUserId,
          content: `Hello ${otherUser.name}! Of course, I'd be happy to help. What specific grammar topic are you struggling with?`,
          message_type: 'text',
          created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString()
        },
        {
          conversation_id: conversation.id,
          sender_id: otherUser.id,
          content: `I'm having trouble with past perfect tense. When should I use it?`,
          message_type: 'text',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];

      const { error: msgError } = await supabase
        .from('conversation_messages')
        .insert(messages);

      if (msgError) {
        console.log(`❌ Error adding messages:`, msgError.message);
        continue;
      }

      console.log(`✅ Created conversation with ${otherUser.name} (${otherUser.email})`);
    }

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Email: teacher1@university.edu');
    console.log('   Password: teacher123456');
    console.log('\n🔄 Please refresh the page and check Messages section.');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('Stack:', error.stack);
  }
}

syncAuthAndDatabaseUsers();
