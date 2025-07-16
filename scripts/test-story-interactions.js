/**
 * Test Story Interactions
 * Test script to verify story reply and reaction functionality
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStoryInteractions() {
  console.log('🧪 Testing Story Interactions...\n')
  
  try {
    // 1. Get a test user
    console.log('👤 Getting test user...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found:', usersError)
      return
    }
    
    const testUserId = users[0].id
    console.log('✅ Test user ID:', testUserId)
    
    // 2. Get a test story
    console.log('\n📖 Getting test story...')
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id')
      .limit(1)
    
    if (storiesError || !stories || stories.length === 0) {
      console.error('❌ No stories found:', storiesError)
      return
    }
    
    const testStoryId = stories[0].id
    console.log('✅ Test story ID:', testStoryId)
    
    // 3. Test adding reaction
    console.log('\n💖 Testing reaction addition...')
    const { data: reactionData, error: reactionError } = await supabase
      .from('story_views')
      .upsert({
        story_id: testStoryId,
        viewer_id: testUserId,
        interaction_type: 'reaction',
        reaction_type: '❤️',
        reacted_at: new Date().toISOString(),
        viewed_at: new Date().toISOString()
      }, {
        onConflict: 'story_id,viewer_id'
      })
      .select()
    
    if (reactionError) {
      console.error('❌ Reaction error:', reactionError)
    } else {
      console.log('✅ Reaction added successfully:', reactionData)
    }
    
    // 4. Test getting reactions count
    console.log('\n📊 Testing reactions count...')
    const { data: reactionsCount, error: countError } = await supabase
      .from('story_views')
      .select('reaction_type')
      .eq('story_id', testStoryId)
      .eq('interaction_type', 'reaction')
      .not('reaction_type', 'is', null)
    
    if (countError) {
      console.error('❌ Count error:', countError)
    } else {
      console.log('✅ Reactions found:', reactionsCount)
      
      // Group by reaction type
      const reactionCounts = {}
      reactionsCount.forEach(r => {
        reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1
      })
      console.log('📈 Reaction counts:', reactionCounts)
    }
    
    // 5. Test getting user's current reaction
    console.log('\n🔍 Testing user current reaction...')
    const { data: userReaction, error: userReactionError } = await supabase
      .from('story_views')
      .select('reaction_type')
      .eq('story_id', testStoryId)
      .eq('viewer_id', testUserId)
      .eq('interaction_type', 'reaction')
      .not('reaction_type', 'is', null)
      .single()
    
    if (userReactionError && userReactionError.code !== 'PGRST116') {
      console.error('❌ User reaction error:', userReactionError)
    } else {
      console.log('✅ User current reaction:', userReaction?.reaction_type || 'none')
    }
    
    // 6. Test story reply
    console.log('\n💬 Testing story reply...')
    const { data: replyData, error: replyError } = await supabase
      .from('story_views')
      .upsert({
        story_id: testStoryId,
        viewer_id: testUserId,
        interaction_type: 'reply',
        reply_content: 'Test reply from script!',
        replied_at: new Date().toISOString(),
        viewed_at: new Date().toISOString()
      }, {
        onConflict: 'story_id,viewer_id'
      })
      .select()
    
    if (replyError) {
      console.error('❌ Reply error:', replyError)
    } else {
      console.log('✅ Reply added successfully:', replyData)
    }
    
    console.log('\n🎉 Story interactions test completed!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Run the test
testStoryInteractions()
