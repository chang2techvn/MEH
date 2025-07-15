// Test the new query logic for story viewers
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewQueryLogic() {
  console.log('🧪 Testing new story viewers query logic...\n');

  try {
    // Use a real story ID from our previous test
    const testStoryId = '306eb631-12d1-4bca-8ed7-2d7776b4f25d';
    
    console.log(`Testing with story ID: ${testStoryId}`);
    
    // Step 1: Get story views
    console.log('\n📋 Step 1: Fetching story views...');
    const { data: viewsData, error: viewsError } = await supabase
      .from('story_views')
      .select('id, viewer_id, viewed_at')
      .eq('story_id', testStoryId)
      .order('viewed_at', { ascending: false })

    if (viewsError) throw viewsError

    console.log('✅ Views data:', viewsData);

    if (!viewsData || viewsData.length === 0) {
      console.log('ℹ️  No views found for this story');
      return
    }

    // Step 2: Get viewer IDs
    const viewerIds = viewsData.map(view => view.viewer_id)
    console.log('\n📋 Step 2: Viewer IDs:', viewerIds);

    // Step 3: Fetch profiles
    console.log('\n📋 Step 3: Fetching profiles...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, avatar_url')
      .in('user_id', viewerIds)

    if (profilesError) throw profilesError

    console.log('✅ Profiles data:', profilesData);

    // Step 4: Combine data
    console.log('\n📋 Step 4: Combining data...');
    const transformedViewers = viewsData.map((view) => {
      const profile = profilesData?.find(p => p.user_id === view.viewer_id)
      return {
        id: view.id,
        viewer_id: view.viewer_id,
        viewed_at: view.viewed_at,
        profiles: {
          username: profile?.username || '',
          full_name: profile?.full_name || '',
          avatar_url: profile?.avatar_url
        }
      }
    })

    console.log('✅ Final transformed data:');
    transformedViewers.forEach((viewer, index) => {
      console.log(`\n  Viewer ${index + 1}:`);
      console.log(`    ID: ${viewer.id}`);
      console.log(`    Viewer ID: ${viewer.viewer_id}`);
      console.log(`    Username: ${viewer.profiles.username}`);
      console.log(`    Full Name: ${viewer.profiles.full_name}`);
      console.log(`    Avatar: ${viewer.profiles.avatar_url ? 'Yes' : 'No'}`);
      console.log(`    Viewed at: ${new Date(viewer.viewed_at).toLocaleString()}`);
    });

    console.log('\n🎉 New query logic test completed successfully!');

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testNewQueryLogic();
