require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Connecting to:', supabaseUrl);
console.log('🔑 Using key:', supabaseKey?.slice(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('\n📡 Testing basic connection...');
    
    // Test users table
    console.log('\n👥 Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Users query failed:', usersError);
    } else {
      console.log('✅ Found', users?.length || 0, 'users');
      users?.forEach(user => console.log(' -', user.name, '(' + user.email + ')'));
    }
    
    // Test conversations table
    console.log('\n💬 Testing conversations table...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, title, status')
      .limit(5);
    
    if (convError) {
      console.error('❌ Conversations query failed:', convError);
    } else {
      console.log('✅ Found', conversations?.length || 0, 'conversations');
      conversations?.forEach(conv => console.log(' -', conv.id, conv.title || 'No title'));
    }
    
    // Test conversation_participants table
    console.log('\n👤 Testing conversation_participants table...');
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select('user_id, conversation_id, role')
      .limit(5);
    
    if (partError) {
      console.error('❌ Participants query failed:', partError);
    } else {
      console.log('✅ Found', participants?.length || 0, 'participants');
      participants?.forEach(part => console.log(' -', part.user_id, 'in', part.conversation_id, 'as', part.role));
    }

    // Test the exact query from chat-context.tsx
    console.log('\n🔍 Testing chat context query...');
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      console.log('Testing with user ID:', testUserId);

      const { data: conversationParticipants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          role,
          joined_at,
          last_read_at,
          conversations!inner(
            id,
            title,
            status,
            last_message_at,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', testUserId)
        .order('last_read_at', { ascending: false });

      if (participantsError) {
        console.error('❌ Chat context query failed:', participantsError);
      } else {
        console.log('✅ Chat context query successful!');
        console.log('Found', conversationParticipants?.length || 0, 'conversation participants');
        conversationParticipants?.forEach(part => {
          const conv = Array.isArray(part.conversations) ? part.conversations[0] : part.conversations;
          console.log(' -', conv?.id, conv?.title || 'No title');
        });
      }
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
    console.error('Stack:', err.stack);
  }
})();
