require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConversationParticipants() {
  console.log('🔍 Testing conversation participants data...');
  
  // Get first user as current user
  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .single();
  
  if (currentUserError || !currentUser) {
    console.error('❌ Error getting current user:', currentUserError);
    return;
  }
  
  console.log('✅ Current user:', currentUser.name, currentUser.email);
  
  // Get conversation participants for this user
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
    .eq('user_id', currentUser.id)
    .limit(1);
  
  if (participantsError) {
    console.error('❌ Error getting conversation participants:', participantsError);
    return;
  }
  
  if (!conversationParticipants || conversationParticipants.length === 0) {
    console.log('⚠️ No conversation participants found');
    return;
  }
  
  console.log('✅ Found conversation participants:', conversationParticipants.length);
  
  // Get the first conversation
  const firstConversation = conversationParticipants[0];
  console.log('🔍 Testing first conversation:', firstConversation.conversation_id);
  
  // Get other participants in this conversation
  const { data: participantIds, error: participantIdsError } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', firstConversation.conversation_id)
    .neq('user_id', currentUser.id);
  
  if (participantIdsError) {
    console.error('❌ Error getting participant IDs:', participantIdsError);
    return;
  }
  
  console.log('✅ Other participants:', participantIds);
  
  // Test fetching user data for each participant
  if (participantIds && participantIds.length > 0) {
    for (const p of participantIds) {
      console.log(`🔍 Testing user data for participant: ${p.user_id}`);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, avatar, last_active')
        .eq('id', p.user_id)
        .single();
      
      if (userError) {
        console.error(`❌ Error fetching user ${p.user_id}:`, userError);
      } else {
        console.log(`✅ User data for ${p.user_id}:`, userData);
      }
      
      // Test the EXACT query that the chat context now uses
      const { data: userWithProfile, error: profileError } = await supabase
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
      
      if (profileError) {
        console.error(`❌ Error fetching user with profile ${p.user_id}:`, profileError);
      } else {
        console.log(`✅ User with profile data for ${p.user_id}:`, userWithProfile);
        if (userWithProfile.profiles && userWithProfile.profiles.length > 0) {
          const profile = userWithProfile.profiles[0];
          const displayName = profile.full_name || profile.username || userWithProfile.email;
          console.log(`✅ Display name would be: "${displayName}"`);
        }
      }
    }
  }
}

testConversationParticipants().catch(console.error);
