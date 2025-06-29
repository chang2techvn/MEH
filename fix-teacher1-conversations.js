const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserAndCreateConversations() {
  console.log('🔍 Checking and fixing user data...\n');

  try {
    // 1. Check auth users
    console.log('1. Checking auth users:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error getting auth users:', authError.message);
      return;
    }

    console.log('✅ Auth users found:');
    authUsers.users.forEach(user => {
      console.log(`   - ${user.email} (${user.id}) - ${user.user_metadata?.role || 'no role'}`);
    });

    // 2. Check database users
    console.log('\n2. Checking database users:');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(10);
      
    if (dbError) {
      console.log('❌ Error getting database users:', dbError.message);
      return;
    }

    console.log('✅ Database users found:');
    dbUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.id}) - ${user.name}`);
    });

    // 3. Find teacher1@university.edu in auth
    const teacher1Auth = authUsers.users.find(u => u.email === 'teacher1@university.edu');
    if (!teacher1Auth) {
      console.log('❌ teacher1@university.edu not found in auth');
      return;
    }

    console.log(`\n3. Found teacher1@university.edu in auth: ${teacher1Auth.id}`);

    // 4. Check if this user exists in database
    const { data: teacher1Db, error: teacher1Error } = await supabase
      .from('users')
      .select('*')
      .eq('id', teacher1Auth.id)
      .single();

    if (teacher1Error || !teacher1Db) {
      console.log('❌ teacher1@university.edu not found in database, creating...');
      
      // Create user in database
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: teacher1Auth.id,
          email: 'teacher1@university.edu',
          name: teacher1Auth.user_metadata?.full_name || 'Prof. Sarah Wilson',
          avatar: teacher1Auth.user_metadata?.avatar_url || 'https://avatar.iran.liara.run/public/2',
          role: 'teacher',
          is_active: true,
          last_active: new Date().toISOString(),
          points: 2800,
          level: 42,
          streak_days: 33
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creating user in database:', createError.message);
        return;
      }

      console.log('✅ Created user in database:', newUser.email);
    } else {
      console.log('✅ teacher1@university.edu found in database:', teacher1Db.email);
    }

    // 5. Get other users for conversations
    const otherUsers = dbUsers.filter(u => u.email !== 'teacher1@university.edu').slice(0, 3);
    
    if (otherUsers.length === 0) {
      console.log('❌ No other users found for conversations');
      return;
    }

    console.log('\n4. Creating conversations for teacher1@university.edu...');

    // Create conversations
    for (let i = 0; i < Math.min(3, otherUsers.length); i++) {
      const otherUser = otherUsers[i];
      
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: `Chat: Prof. Sarah Wilson & ${otherUser.name}`,
          status: 'active'
        })
        .select()
        .single();

      if (convError) {
        console.log(`❌ Error creating conversation with ${otherUser.name}:`, convError.message);
        continue;
      }

      // Add participants
      const participants = [
        {
          conversation_id: conversation.id,
          user_id: teacher1Auth.id,
          role: 'teacher',
          joined_at: new Date().toISOString(),
          last_read_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          conversation_id: conversation.id,
          user_id: otherUser.id,
          role: otherUser.email.includes('teacher') ? 'teacher' : 'student',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        }
      ];

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (partError) {
        console.log(`❌ Error adding participants:`, partError.message);
        continue;
      }

      // Add some messages
      const messages = [
        {
          conversation_id: conversation.id,
          sender_id: otherUser.id,
          content: `Hi Prof. Wilson! I need help with my English studies.`,
          message_type: 'text',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          conversation_id: conversation.id,
          sender_id: teacher1Auth.id,
          content: `Hello ${otherUser.name}! I'd be happy to help. What specific area would you like to work on?`,
          message_type: 'text',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          conversation_id: conversation.id,
          sender_id: otherUser.id,
          content: `I'm struggling with grammar, especially present perfect tense. Could you explain it?`,
          message_type: 'text',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 min ago
        }
      ];

      const { error: msgError } = await supabase
        .from('conversation_messages')
        .insert(messages);

      if (msgError) {
        console.log(`❌ Error adding messages:`, msgError.message);
        continue;
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      console.log(`✅ Created conversation with ${otherUser.name} and added 3 messages`);
    }

    console.log('\n✅ Setup completed! teacher1@university.edu should now see conversations.');
    console.log('\n📋 Login credentials:');
    console.log('   Email: teacher1@university.edu');
    console.log('   Password: teacher123456');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

fixUserAndCreateConversations();
