require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAllConversationParticipants() {
  console.log('🔍 Testing all conversation participants for teacher1...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  
  // Get conversations for teacher1
  const { data: conversationParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      conversations!inner(
        id,
        title
      )
    `)
    .eq('user_id', currentUserId)
    .limit(5);
  
  if (participantsError) {
    console.error('❌ Error getting conversations:', participantsError);
    return;
  }
  
  console.log(`✅ Found ${conversationParticipants.length} conversations for teacher1`);
  
  for (const convParticipant of conversationParticipants) {
    const conversationId = convParticipant.conversation_id;
    console.log(`\n🔍 Testing conversation: ${conversationId}`);
    
    // Get other participants in this conversation
    const { data: participantIds, error: participantIdsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', currentUserId);
    
    if (participantIds && participantIds.length > 0) {
      for (const p of participantIds) {
        console.log(`  🔍 Testing participant: ${p.user_id}`);
        
        const { data: userWithProfile, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            profiles!inner(
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('id', p.user_id)
          .single();
        
        if (userWithProfile && !userError && userWithProfile.profiles && userWithProfile.profiles.length > 0) {
          const profile = userWithProfile.profiles[0];
          const displayName = profile.full_name || profile.username || userWithProfile.email;
          console.log(`  ✅ Participant name: "${displayName}"`);
        } else {
          console.log(`  ❌ Could not fetch profile for ${p.user_id}:`, userError);
        }
      }
    } else {
      console.log(`  ⚠️ No other participants found in conversation ${conversationId}`);
    }
  }
}

testAllConversationParticipants().catch(console.error);
