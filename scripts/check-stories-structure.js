const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkStoriesStructure() {
  console.log('🔍 Checking Stories and Story Views table structures...\n')

  try {
    // Check stories table structure
    console.log('📊 STORIES Table Structure:')
    console.log('=' .repeat(50))
    
    const { data: storiesColumns, error: storiesError } = await supabase
      .rpc('get_table_columns', { table_name: 'stories' })

    if (storiesError) {
      console.log('❌ Error checking stories table:', storiesError.message)
      
      // Try alternative method to check if table exists
      const { data: storiesData, error: storiesQueryError } = await supabase
        .from('stories')
        .select('*')
        .limit(1)

      if (storiesQueryError) {
        console.log('❌ Stories table does not exist or is not accessible')
        console.log('📋 Suggested stories table structure:')
        console.log(`
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  user_image TEXT,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  duration INTEGER DEFAULT 86400, -- 24 hours in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0
);

-- Add indexes
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);
CREATE INDEX idx_stories_active ON stories(is_active);
        `)
      } else {
        console.log('✅ Stories table exists but column info unavailable')
        console.log('Sample data structure:', storiesData?.[0] || 'No data found')
      }
    } else {
      console.log('✅ Stories table structure:')
      storiesColumns?.forEach(column => {
        console.log(`  ${column.column_name}: ${column.data_type} ${column.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`)
      })
    }

    console.log('\n📊 STORY_VIEWS Table Structure:')
    console.log('=' .repeat(50))
    
    const { data: viewsColumns, error: viewsError } = await supabase
      .rpc('get_table_columns', { table_name: 'story_views' })

    if (viewsError) {
      console.log('❌ Error checking story_views table:', viewsError.message)
      
      // Try alternative method
      const { data: viewsData, error: viewsQueryError } = await supabase
        .from('story_views')
        .select('*')
        .limit(1)

      if (viewsQueryError) {
        console.log('❌ Story_views table does not exist or is not accessible')
        console.log('📋 Suggested story_views table structure:')
        console.log(`
CREATE TABLE story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Add indexes
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_user_id ON story_views(user_id);
CREATE INDEX idx_story_views_viewed_at ON story_views(viewed_at);
        `)
      } else {
        console.log('✅ Story_views table exists but column info unavailable')
        console.log('Sample data structure:', viewsData?.[0] || 'No data found')
      }
    } else {
      console.log('✅ Story_views table structure:')
      viewsColumns?.forEach(column => {
        console.log(`  ${column.column_name}: ${column.data_type} ${column.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`)
      })
    }

    // Check existing stories data
    console.log('\n📈 Current Stories Data:')
    console.log('=' .repeat(50))
    
    const { data: existingStories, error: storiesDataError } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (storiesDataError) {
      console.log('❌ Could not fetch stories data:', storiesDataError.message)
    } else {
      console.log(`📊 Found ${existingStories?.length || 0} stories`)
      if (existingStories && existingStories.length > 0) {
        console.log('Recent stories:')
        existingStories.forEach((story, index) => {
          console.log(`  ${index + 1}. ${story.username || 'Unknown'} - ${story.media_type || 'text'} - ${story.created_at}`)
        })
      }
    }

    // Check story views data
    console.log('\n👀 Current Story Views Data:')
    console.log('=' .repeat(50))
    
    const { data: existingViews, error: viewsDataError } = await supabase
      .from('story_views')
      .select('*')
      .order('viewed_at', { ascending: false })
      .limit(5)

    if (viewsDataError) {
      console.log('❌ Could not fetch story views data:', viewsDataError.message)
    } else {
      console.log(`📊 Found ${existingViews?.length || 0} story views`)
      if (existingViews && existingViews.length > 0) {
        console.log('Recent views:')
        existingViews.forEach((view, index) => {
          console.log(`  ${index + 1}. Story ${view.story_id} viewed at ${view.viewed_at}`)
        })
      }
    }

    // Check storage buckets
    console.log('\n🪣 Storage Buckets:')
    console.log('=' .repeat(50))
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      console.log('❌ Could not fetch storage buckets:', bucketsError.message)
    } else {
      console.log('✅ Available buckets:')
      buckets?.forEach(bucket => {
        console.log(`  📁 ${bucket.name} - ${bucket.public ? 'Public' : 'Private'} - Created: ${bucket.created_at}`)
      })
      
      const hasStoriesBucket = buckets?.some(bucket => bucket.name === 'stories')
      if (!hasStoriesBucket) {
        console.log('\n⚠️  "stories" bucket does not exist - needs to be created!')
      } else {
        console.log('\n✅ "stories" bucket already exists')
      }
    }

    console.log('\n✅ Stories structure check completed!')

  } catch (error) {
    console.error('❌ Error during stories structure check:', error)
  }
}

// Run the check
checkStoriesStructure()
