// Script to check posts and saved_posts table structure
// File: scripts/check-saved-posts-structure.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = cleanValue;
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials.');
  console.error('Please create .env.local file with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n');

  try {
    // Check posts table structure
    console.log('📊 Posts table structure:');
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ Error checking posts table:', postsError.message);
    } else {
      console.log('✅ Posts table exists');
      if (postsData && postsData.length > 0) {
        console.log('📋 Posts table columns:', Object.keys(postsData[0]));
      }
    }

    // Check saved_posts table structure
    console.log('\n📊 Saved_posts table structure:');
    const { data: savedPostsData, error: savedPostsError } = await supabase
      .from('saved_posts')
      .select('*')
      .limit(1);
    
    if (savedPostsError) {
      console.error('❌ Error checking saved_posts table:', savedPostsError.message);
    } else {
      console.log('✅ Saved_posts table exists');
      if (savedPostsData && savedPostsData.length > 0) {
        console.log('📋 Saved_posts table columns:', Object.keys(savedPostsData[0]));
      } else {
        console.log('📋 Saved_posts table is empty (expected for new table)');
      }
    }

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test if we can query posts with user info
    const { data: postsWithUsers, error: postsWithUsersError } = await supabase
      .from('posts')
      .select(`
        *
      `)
      .limit(3);

    if (postsWithUsersError) {
      console.error('❌ Error querying posts with users:', postsWithUsersError.message);
    } else {
      console.log('✅ Posts with user data query works');
      console.log(`📊 Found ${postsWithUsers?.length || 0} posts`);
    }

    // Test saved_posts join with posts
    const { data: savedPostsJoin, error: savedPostsJoinError } = await supabase
      .from('saved_posts')
      .select(`
        *,
        posts (
          id,
          content,
          created_at,
          username
        )
      `)
      .limit(3);

    if (savedPostsJoinError) {
      console.error('❌ Error querying saved_posts with posts:', savedPostsJoinError.message);
    } else {
      console.log('✅ Saved_posts with posts join query works');
      console.log(`📊 Found ${savedPostsJoin?.length || 0} saved posts`);
    }

    console.log('\n✅ All checks completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function testSavePost() {
  console.log('\n🧪 Testing save/unsave functionality...');
  
  try {
    // Get current user (if authenticated)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('⚠️  No authenticated user - skipping save/unsave test');
      return;
    }

    // Get a post to test with
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (postsError || !posts || posts.length === 0) {
      console.log('⚠️  No posts found - skipping save/unsave test');
      return;
    }

    const testPostId = posts[0].id;
    console.log(`🎯 Testing with post ID: ${testPostId}`);

    // Test save
    const { data: saveData, error: saveError } = await supabase
      .from('saved_posts')
      .insert({
        user_id: user.id,
        post_id: testPostId
      })
      .select();

    if (saveError) {
      console.log('ℹ️  Save test result:', saveError.message);
    } else {
      console.log('✅ Save operation successful');
      
      // Test unsave
      const { error: unsaveError } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', testPostId);

      if (unsaveError) {
        console.log('❌ Unsave operation failed:', unsaveError.message);
      } else {
        console.log('✅ Unsave operation successful');
      }
    }

  } catch (error) {
    console.error('❌ Test save/unsave error:', error.message);
  }
}

// Run the checks
async function main() {
  console.log('🚀 Starting table structure check...\n');
  await checkTableStructure();
  await testSavePost();
  console.log('\n🎉 Script completed!');
}

main().catch(console.error);
