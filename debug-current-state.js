const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function debugCurrentState() {
  console.log('🔍 Debug Current State...\n');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if user is signed in
    console.log('1. Checking current auth session...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session.session) {
      console.log('✅ User is signed in:', session.session.user.email);
      console.log('   User ID:', session.session.user.id);
    } else {
      console.log('❌ No active session');
      
      // Try to sign in
      console.log('\n2. Attempting to sign in as teacher1...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'teacher1@university.edu',
        password: 'teacher123456'
      });

      if (authError) {
        console.log('❌ Sign in failed:', authError.message);
        return;
      }

      console.log('✅ Signed in successfully:', authData.user.email);
    }

    // Check database users
    console.log('\n3. Checking database users...');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(10);

    if (dbError) {
      console.log('❌ Database error:', dbError.message);
    } else {
      console.log('✅ Database users:');
      dbUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id}) - ${user.name}`);
      });
    }

    // Check conversations for teacher1 specifically
    const teacher1Id = '3fd6f201-16d1-4c38-8233-513ca600b8fe'; // From previous test
    console.log(`\n4. Checking conversations for teacher1 (${teacher1Id})...`);
    
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        role,
        conversations!inner(
          id,
          title,
          status
        )
      `)
      .eq('user_id', teacher1Id);

    if (convError) {
      console.log('❌ Conversations error:', convError.message);
    } else {
      console.log(`✅ Found ${conversations?.length || 0} conversations:`);
      conversations?.forEach(conv => {
        const conversation = Array.isArray(conv.conversations) ? conv.conversations[0] : conv.conversations;
        console.log(`   - ${conversation.title} (${conversation.id})`);
      });
    }

    // Check messages
    if (conversations && conversations.length > 0) {
      const firstConv = Array.isArray(conversations[0].conversations) 
        ? conversations[0].conversations[0] 
        : conversations[0].conversations;
      
      console.log(`\n5. Checking messages for: ${firstConv.title}...`);
      const { data: messages, error: msgError } = await supabase
        .from('conversation_messages')
        .select('id, content, sender_id, created_at')
        .eq('conversation_id', firstConv.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (msgError) {
        console.log('❌ Messages error:', msgError.message);
      } else {
        console.log(`✅ Found ${messages?.length || 0} messages:`);
        messages?.forEach(msg => {
          console.log(`   - ${msg.content.substring(0, 50)}... (${msg.sender_id})`);
        });
      }
    }

    console.log('\n📋 Summary:');
    console.log('   - Auth should work: Sign in with teacher1@university.edu / teacher123456');
    console.log('   - Database has users and conversations');
    console.log('   - Check browser console for detailed logs');
    console.log('   - Make sure to refresh the page after signing in');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

debugCurrentState();
