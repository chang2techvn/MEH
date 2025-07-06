require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdatedUserFetch() {
  console.log('🔍 Testing updated user fetch with profiles...');
  
  // Test the updated getCurrentUser functionality
  console.log('\n1. Testing getCurrentUser with profiles...');
  const { data: firstUserWithProfile, error: fallbackError } = await supabase
    .from('users')
    .select(`
      *,
      profiles!inner(
        full_name,
        username,
        avatar_url
      )
    `)
    .limit(1)
    .single();
  
  if (fallbackError || !firstUserWithProfile) {
    console.error('❌ Error fetching user with profile:', fallbackError);
    return;
  }
  
  const profile = firstUserWithProfile.profiles?.[0];
  const enrichedUser = {
    ...firstUserWithProfile,
    name: profile?.full_name || profile?.username || firstUserWithProfile.email,
    avatar: profile?.avatar_url || firstUserWithProfile.avatar
  };
  
  console.log('✅ Current user with profile:', {
    id: enrichedUser.id,
    name: enrichedUser.name,
    email: enrichedUser.email,
    avatar: enrichedUser.avatar
  });
  
  // Test fetching conversation participants with profiles
  console.log('\n2. Testing conversation participants with profiles...');
  const { data: conversationParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      user_id,
      role,
      conversations!inner(
        id,
        title,
        status,
        last_message_at
      )
    `)
    .eq('user_id', enrichedUser.id)
    .limit(1);
  
  if (participantsError || !conversationParticipants || conversationParticipants.length === 0) {
    console.log('⚠️ No conversations found for user');
    return;
  }
  
  const firstConversation = conversationParticipants[0];
  console.log('✅ Found conversation:', firstConversation.conversation_id);
  
  // Get other participants with profiles
  const { data: participantIds, error: participantIdsError } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', firstConversation.conversation_id)
    .neq('user_id', enrichedUser.id);
  
  if (participantIds && participantIds.length > 0) {
    for (const p of participantIds) {
      console.log(`\n3. Testing participant ${p.user_id} with profile...`);
      
      const { data: userWithProfile, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          last_active,
          profiles!inner(
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('id', p.user_id)
        .single();
      
      if (userWithProfile && !userError && userWithProfile.profiles && userWithProfile.profiles.length > 0) {
        const participantProfile = userWithProfile.profiles[0];
        console.log('✅ Participant with profile:', {
          id: userWithProfile.id,
          name: participantProfile.full_name || participantProfile.username || userWithProfile.email,
          email: userWithProfile.email,
          avatar: participantProfile.avatar_url
        });
      } else {
        console.error('❌ Error fetching participant profile:', userError);
      }
    }
  }
  
  // Test message senders with profiles
  console.log('\n4. Testing message senders with profiles...');
  const { data: messagesData, error: messagesError } = await supabase
    .from('conversation_messages')
    .select(`
      id,
      content,
      sender_id,
      created_at,
      sender:users!sender_id(
        id,
        email,
        profiles!inner(
          full_name,
          username,
          avatar_url
        )
      )
    `)
    .eq('conversation_id', firstConversation.conversation_id)
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (messagesError) {
    console.error('❌ Error fetching messages:', messagesError);
    return;
  }
  
  console.log('✅ Messages with sender profiles:');
  messagesData?.forEach((msg, index) => {
    const senderProfile = msg.sender?.profiles?.[0];
    const senderName = senderProfile?.full_name || senderProfile?.username || msg.sender?.email || 'Unknown';
    console.log(`  Message ${index + 1}: "${msg.content}" by ${senderName}`);
  });
}

testUpdatedUserFetch().catch(console.error);
