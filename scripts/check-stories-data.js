/**
 * Script to check stories table data and structure
 * Run with: node scripts/check-stories-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStoriesData() {
  console.log('📖 Checking Stories Data and Structure\n');
  
  try {
    // 1. Check stories count
    console.log('📊 Stories Statistics:');
    const { count: totalStories, error: countError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting stories count:', countError);
    } else {
      console.log(`Total stories: ${totalStories}`);
    }

    // 2. Check recent stories
    console.log('\n📖 Recent Stories (Last 10):');
    const { data: recentStories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        author_id,
        content,
        media_type,
        background_color,
        is_active,
        expires_at,
        created_at,
        profiles(full_name, username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (storiesError) {
      console.error('Error fetching stories:', storiesError);
    } else {
      if (recentStories && recentStories.length > 0) {
        console.table(recentStories.map(s => ({
          id: s.id.substring(0, 8) + '...',
          author: s.profiles?.full_name || s.profiles?.username || 'Unknown',
          content: s.content ? s.content.substring(0, 40) + '...' : 'No content',
          media_type: s.media_type || 'text',
          active: s.is_active,
          expires: new Date(s.expires_at).toLocaleDateString()
        })));
      } else {
        console.log('No stories found');
      }
    }

    // 3. Check active stories
    console.log('\n✅ Active Stories:');
    const { data: activeStories, error: activeError } = await supabase
      .from('stories')
      .select('id, author_id, content, expires_at')
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (activeError) {
      console.error('Error fetching active stories:', activeError);
    } else {
      console.log(`Active stories count: ${activeStories?.length || 0}`);
      if (activeStories && activeStories.length > 0) {
        console.table(activeStories.map(s => ({
          id: s.id.substring(0, 8) + '...',
          content: s.content ? s.content.substring(0, 50) + '...' : 'No content',
          expires: new Date(s.expires_at).toLocaleString()
        })));
      }
    }

    // 4. Check story views table
    console.log('\n👁️ Story Views Data:');
    const { count: viewsCount, error: viewsCountError } = await supabase
      .from('story_views')
      .select('*', { count: 'exact', head: true });

    if (viewsCountError) {
      console.error('Error getting views count:', viewsCountError);
    } else {
      console.log(`Total story views: ${viewsCount}`);
    }

    // Check story_views table structure with new columns
    const { data: sampleView, error: sampleError } = await supabase
      .from('story_views')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error checking story_views structure:', sampleError);
    } else {
      if (sampleView && sampleView.length > 0) {
        console.log('Story_views columns:', Object.keys(sampleView[0]));
      } else {
        console.log('No story views found, checking table structure...');
        
        // Try to insert a test record to see available columns
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        const { data: stories } = await supabase
          .from('stories')
          .select('id')
          .limit(1);

        if (users && users.length > 0 && stories && stories.length > 0) {
          console.log('Testing story_views insert with new columns...');
          const testView = {
            story_id: stories[0].id,
            viewer_id: users[0].id,
            interaction_type: 'view',
            viewed_at: new Date().toISOString()
          };

          const { data: testResult, error: testError } = await supabase
            .from('story_views')
            .insert([testView])
            .select()
            .single();

          if (testError) {
            console.error('❌ Test insert failed:', testError);
          } else {
            console.log('✅ Test insert successful!');
            console.log('Available columns:', Object.keys(testResult));
            
            // Clean up test record
            await supabase
              .from('story_views')
              .delete()
              .eq('id', testResult.id);
            console.log('🗑️ Test record cleaned up');
          }
        }
      }
    }

    // 5. Check interactions in story_views
    console.log('\n💬 Story Interactions:');
    const { data: interactions, error: interactionsError } = await supabase
      .from('story_views')
      .select('interaction_type')
      .not('interaction_type', 'is', null);

    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError);
    } else {
      const interactionTypes = {};
      interactions?.forEach(i => {
        interactionTypes[i.interaction_type] = (interactionTypes[i.interaction_type] || 0) + 1;
      });
      console.table(interactionTypes);
    }

    // 6. Check reactions
    console.log('\n😍 Story Reactions:');
    const { data: reactions, error: reactionsError } = await supabase
      .from('story_views')
      .select('reaction_type')
      .not('reaction_type', 'is', null);

    if (reactionsError) {
      console.error('Error fetching reactions:', reactionsError);
    } else {
      const reactionTypes = {};
      reactions?.forEach(r => {
        reactionTypes[r.reaction_type] = (reactionTypes[r.reaction_type] || 0) + 1;
      });
      console.table(reactionTypes);
    }

    // 7. Test story interaction features
    if (recentStories && recentStories.length > 0 && totalStories > 0) {
      console.log('\n🧪 Testing Story Interaction Features:');
      
      const testStory = recentStories[0];
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (users && users.length > 0) {
        const testUserId = users[0].id;
        
        // Test reaction
        console.log('Testing reaction insert...');
        const { data: reactionTest, error: reactionError } = await supabase
          .from('story_views')
          .insert({
            story_id: testStory.id,
            viewer_id: testUserId,
            interaction_type: 'reaction',
            reaction_type: '❤️',
            reacted_at: new Date().toISOString(),
            viewed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (reactionError) {
          console.error('❌ Reaction test failed:', reactionError);
        } else {
          console.log('✅ Reaction test successful!');
          
          // Test reply
          console.log('Testing reply insert...');
          const { data: replyTest, error: replyError } = await supabase
            .from('story_views')
            .insert({
              story_id: testStory.id,
              viewer_id: testUserId,
              interaction_type: 'reply',
              reply_content: 'Great story! Thanks for sharing.',
              replied_at: new Date().toISOString(),
              viewed_at: new Date().toISOString()
            })
            .select()
            .single();

          if (replyError) {
            console.error('❌ Reply test failed:', replyError);
          } else {
            console.log('✅ Reply test successful!');
            
            // Clean up test records
            await supabase
              .from('story_views')
              .delete()
              .in('id', [reactionTest.id, replyTest.id]);
            console.log('🗑️ Test records cleaned up');
          }
        }
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkStoriesData().then(() => {
  console.log('\n✅ Stories data check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during check:', error);
  process.exit(1);
});
