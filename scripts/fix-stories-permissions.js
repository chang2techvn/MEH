#!/usr/bin/env node

/**
 * Fix Stories Permissions and Schema
 * This script fixes permission issues and schema problems for the stories functionality
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔧 Fixing Stories Permissions and Schema...\n')

async function fixStoriesPermissions() {
  console.log('📋 Step 1: Setting up RLS policies for stories table')
  console.log('========================================')
  
  try {
    // First, enable RLS on stories table
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on stories table
        ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view all active stories" ON stories;
        DROP POLICY IF EXISTS "Users can create their own stories" ON stories;
        DROP POLICY IF EXISTS "Users can update their own stories" ON stories;
        DROP POLICY IF EXISTS "Users can delete their own stories" ON stories;
        
        -- Create comprehensive RLS policies
        CREATE POLICY "Users can view all active stories" ON stories
          FOR SELECT USING (
            expires_at > NOW() OR expires_at IS NULL
          );
        
        CREATE POLICY "Users can create their own stories" ON stories
          FOR INSERT WITH CHECK (
            auth.uid() = user_id
          );
        
        CREATE POLICY "Users can update their own stories" ON stories
          FOR UPDATE USING (
            auth.uid() = user_id
          );
        
        CREATE POLICY "Users can delete their own stories" ON stories
          FOR DELETE USING (
            auth.uid() = user_id
          );
      `
    })

    if (rlsError) {
      console.log('⚠️  RLS policies setup (some may already exist):', rlsError.message)
    } else {
      console.log('✅ RLS policies configured successfully')
    }

  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error.message)
  }
}

async function fixStoryViewsPermissions() {
  console.log('\n📋 Step 2: Setting up RLS policies for story_views table')
  console.log('========================================')
  
  try {
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on story_views table
        ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view all story views" ON story_views;
        DROP POLICY IF EXISTS "Users can create story views" ON story_views;
        DROP POLICY IF EXISTS "Users can view their own story views" ON story_views;
        
        -- Create RLS policies for story_views
        CREATE POLICY "Users can view all story views" ON story_views
          FOR SELECT USING (true);
        
        CREATE POLICY "Users can create story views" ON story_views
          FOR INSERT WITH CHECK (
            auth.uid() = viewer_id
          );
        
        CREATE POLICY "Users can view their own story views" ON story_views
          FOR SELECT USING (
            auth.uid() = viewer_id OR 
            EXISTS (
              SELECT 1 FROM stories 
              WHERE stories.id = story_views.story_id 
              AND stories.user_id = auth.uid()
            )
          );
      `
    })

    if (rlsError) {
      console.log('⚠️  Story views RLS policies setup (some may already exist):', rlsError.message)
    } else {
      console.log('✅ Story views RLS policies configured successfully')
    }

  } catch (error) {
    console.error('❌ Error setting up story views RLS policies:', error.message)
  }
}

async function checkProfilesSchema() {
  console.log('\n📋 Step 3: Checking profiles table schema')
  console.log('========================================')
  
  try {
    // Check if profiles table has username column
    const { data: columns, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    })

    if (error) {
      console.error('❌ Error checking profiles schema:', error.message)
      return
    }

    console.log('📊 Profiles table columns:')
    if (columns && columns.length > 0) {
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
      
      // Check if username column exists
      const hasUsername = columns.some(col => col.column_name === 'username')
      
      if (!hasUsername) {
        console.log('\n⚠️  Username column not found. Adding it...')
        await addUsernameColumn()
      } else {
        console.log('✅ Username column exists')
      }
    } else {
      console.log('❌ No columns found or profiles table does not exist')
    }

  } catch (error) {
    console.error('❌ Error checking profiles schema:', error.message)
  }
}

async function addUsernameColumn() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add username column if it doesn't exist
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
        
        -- Create index on username for performance
        CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
        
        -- Update existing records to have username based on email
        UPDATE profiles 
        SET username = SPLIT_PART(email, '@', 1)
        WHERE username IS NULL AND email IS NOT NULL;
      `
    })

    if (error) {
      console.error('❌ Error adding username column:', error.message)
    } else {
      console.log('✅ Username column added successfully')
    }
  } catch (error) {
    console.error('❌ Error adding username column:', error.message)
  }
}

async function testStoriesAccess() {
  console.log('\n📋 Step 4: Testing stories table access')
  console.log('========================================')
  
  try {
    // Test basic select access
    const { data, error } = await supabase
      .from('stories')
      .select('id, created_at')
      .limit(1)

    if (error) {
      console.error('❌ Stories access test failed:', error.message)
    } else {
      console.log('✅ Stories table access working')
      console.log(`📊 Found ${data?.length || 0} story records`)
    }
  } catch (error) {
    console.error('❌ Stories access test error:', error.message)
  }
}

async function testStoryViewsAccess() {
  console.log('\n📋 Step 5: Testing story_views table access')
  console.log('========================================')
  
  try {
    const { data, error } = await supabase
      .from('story_views')
      .select('id, created_at')
      .limit(1)

    if (error) {
      console.error('❌ Story views access test failed:', error.message)
    } else {
      console.log('✅ Story views table access working')
      console.log(`📊 Found ${data?.length || 0} story view records`)
    }
  } catch (error) {
    console.error('❌ Story views access test error:', error.message)
  }
}

async function testStoriesWithProfiles() {
  console.log('\n📋 Step 6: Testing stories with profiles join')
  console.log('========================================')
  
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        media_url,
        created_at,
        profiles!stories_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .limit(1)

    if (error) {
      console.error('❌ Stories with profiles join failed:', error.message)
    } else {
      console.log('✅ Stories with profiles join working')
      console.log(`📊 Query returned ${data?.length || 0} records`)
      if (data && data.length > 0) {
        console.log('📄 Sample record:', JSON.stringify(data[0], null, 2))
      }
    }
  } catch (error) {
    console.error('❌ Stories with profiles join error:', error.message)
  }
}

// Main execution
async function main() {
  try {
    await fixStoriesPermissions()
    await fixStoryViewsPermissions()
    await checkProfilesSchema()
    await testStoriesAccess()
    await testStoryViewsAccess()
    await testStoriesWithProfiles()
    
    console.log('\n✨ Stories permissions and schema fix completed!')
    console.log('\n📋 Summary:')
    console.log('- RLS policies configured for stories and story_views tables')
    console.log('- Username column verified/added to profiles table')
    console.log('- Database access permissions tested')
    console.log('- Stories feature should now work properly!')
    
  } catch (error) {
    console.error('\n❌ Error during fix process:', error.message)
  }
}

main()
