// Script to check the structure of stories and story_views tables
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking stories and story_views table structure...\n');

  try {
    // Check stories table structure
    console.log('📋 STORIES TABLE STRUCTURE:');
    console.log('=' .repeat(50));
    
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .limit(1);

    if (storiesError) {
      console.error('❌ Error fetching stories table:', storiesError.message);
    } else {
      if (storiesData && storiesData.length > 0) {
        console.log('✅ Stories table columns:');
        Object.keys(storiesData[0]).forEach(column => {
          console.log(`  - ${column}`);
        });
      } else {
        console.log('⚠️  Stories table is empty, trying to get table info...');
      }
    }

    // Check story_views table structure
    console.log('\n📋 STORY_VIEWS TABLE STRUCTURE:');
    console.log('=' .repeat(50));
    
    const { data: viewsData, error: viewsError } = await supabase
      .from('story_views')
      .select('*')
      .limit(1);

    if (viewsError) {
      console.error('❌ Error fetching story_views table:', viewsError.message);
      
      // If table doesn't exist, suggest creating it
      if (viewsError.message.includes('relation "story_views" does not exist')) {
        console.log('\n💡 SUGGESTION: story_views table does not exist. Here\'s the SQL to create it:');
        console.log(`
CREATE TABLE story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Add RLS policies
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own views
CREATE POLICY "Users can view their own story views" ON story_views
  FOR SELECT USING (viewer_id = auth.uid());

-- Policy for users to insert their own views
CREATE POLICY "Users can insert their own story views" ON story_views
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- Policy for story authors to see who viewed their stories
CREATE POLICY "Story authors can see views on their stories" ON story_views
  FOR SELECT USING (
    story_id IN (
      SELECT id FROM stories WHERE user_id = auth.uid()
    )
  );
        `);
      }
    } else {
      if (viewsData && viewsData.length > 0) {
        console.log('✅ Story_views table columns:');
        Object.keys(viewsData[0]).forEach(column => {
          console.log(`  - ${column}`);
        });
      } else {
        console.log('⚠️  Story_views table exists but is empty');
      }
    }

    // Check sample stories data
    console.log('\n📊 SAMPLE STORIES DATA:');
    console.log('=' .repeat(50));
    
    const { data: sampleStories, error: sampleError } = await supabase
      .from('stories')
      .select(`
        id,
        content,
        media_url,
        author_id,
        created_at,
        expires_at,
        views_count,
        is_active
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (sampleError) {
      console.error('❌ Error fetching sample stories:', sampleError.message);
    } else {
      console.log(`✅ Found ${sampleStories?.length || 0} stories`);
      sampleStories?.forEach((story, index) => {
        console.log(`\n  Story ${index + 1}:`);
        console.log(`    ID: ${story.id}`);
        console.log(`    Author ID: ${story.author_id}`);
        console.log(`    Content: ${story.content ? story.content.substring(0, 50) + '...' : 'No content'}`);
        console.log(`    Media: ${story.media_url ? 'Yes' : 'No'}`);
        console.log(`    Views: ${story.views_count || 0}`);
        console.log(`    Active: ${story.is_active}`);
        console.log(`    Created: ${new Date(story.created_at).toLocaleString()}`);
        console.log(`    Expires: ${new Date(story.expires_at).toLocaleString()}`);
      });
    }

    // Check sample story views data
    console.log('\n📊 SAMPLE STORY VIEWS DATA:');
    console.log('=' .repeat(50));
    
    const { data: sampleViews, error: viewsSampleError } = await supabase
      .from('story_views')
      .select(`
        id,
        story_id,
        viewer_id,
        viewed_at
      `)
      .order('viewed_at', { ascending: false })
      .limit(5);

    if (viewsSampleError) {
      console.error('❌ Error fetching sample story views:', viewsSampleError.message);
    } else {
      console.log(`✅ Found ${sampleViews?.length || 0} story views`);
      sampleViews?.forEach((view, index) => {
        console.log(`\n  View ${index + 1}:`);
        console.log(`    ID: ${view.id}`);
        console.log(`    Story ID: ${view.story_id}`);
        console.log(`    Viewer ID: ${view.viewer_id}`);
        console.log(`    Viewed at: ${new Date(view.viewed_at).toLocaleString()}`);
      });
    }

    console.log('\n🎉 Table structure check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkTableStructure();
