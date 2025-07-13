const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure(tableName) {
  console.log(`\n🔍 Checking table structure for: ${tableName}`)
  
  try {
    // Get table columns
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      console.error(`❌ Error checking ${tableName}:`, error.message)
      return false
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Table ${tableName} exists with columns:`)
      Object.keys(data[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof data[0][column]}`)
      })
    } else {
      console.log(`⚠️ Table ${tableName} exists but is empty`)
    }
    
    return true
  } catch (err) {
    console.error(`❌ Table ${tableName} might not exist:`, err.message)
    return false
  }
}

async function checkPostsTable() {
  console.log('\n📊 Checking posts table structure...')
  
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, content, user_id, likes_count, comments_count, media_url, media_urls, created_at')
    .limit(3)
  
  if (error) {
    console.error('❌ Error fetching posts:', error)
    return
  }
  
  console.log(`✅ Found ${data?.length || 0} posts`)
  if (data && data.length > 0) {
    console.log('Sample post structure:')
    console.log(JSON.stringify(data[0], null, 2))
  }
}

async function checkLikesTable() {
  console.log('\n❤️ Checking likes table...')
  
  // Try to get likes table structure
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .limit(1)
  
  if (error) {
    console.log('❌ Likes table error:', error.message)
    console.log('🔧 Need to create likes table')
    return false
  }
  
  console.log('✅ Likes table exists')
  if (data && data.length > 0) {
    console.log('Likes table structure:')
    Object.keys(data[0]).forEach(column => {
      console.log(`   - ${column}`)
    })
  }
  
  return true
}

async function checkCommentsTable() {
  console.log('\n💬 Checking comments table...')
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .limit(1)
  
  if (error) {
    console.log('❌ Comments table error:', error.message)
    console.log('🔧 Need to create comments table')
    return false
  }
  
  console.log('✅ Comments table exists')
  if (data && data.length > 0) {
    console.log('Comments table structure:')
    Object.keys(data[0]).forEach(column => {
      console.log(`   - ${column}`)
    })
  }
  
  return true
}

async function checkRLSPolicies() {
  console.log('\n🔐 Checking RLS policies...')
  
  try {
    // Test if we can read from tables
    const likesTest = await supabase.from('likes').select('count', { count: 'exact', head: true })
    const commentsTest = await supabase.from('comments').select('count', { count: 'exact', head: true })
    
    console.log('✅ RLS policies allow read access')
    console.log(`   - Likes table: ${likesTest.error ? 'Error' : 'Accessible'}`)
    console.log(`   - Comments table: ${commentsTest.error ? 'Error' : 'Accessible'}`)
    
    if (likesTest.error) console.log('   Likes error:', likesTest.error.message)
    if (commentsTest.error) console.log('   Comments error:', commentsTest.error.message)
    
  } catch (error) {
    console.error('❌ RLS check failed:', error.message)
  }
}

async function generateCreateTableSQL() {
  console.log('\n📝 Generating SQL for missing tables...')
  
  const likesSQL = `
-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);
`

  const commentsSQL = `
-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
`

  console.log('💾 Save this SQL to create missing tables:')
  console.log('\n--- LIKES TABLE ---')
  console.log(likesSQL)
  console.log('\n--- COMMENTS TABLE ---')
  console.log(commentsSQL)
}

async function main() {
  console.log('🚀 Starting database structure check...')
  
  // Check each table
  const postsExist = await checkTableStructure('posts')
  const likesExist = await checkTableStructure('likes')
  const commentsExist = await checkTableStructure('comments')
  
  if (postsExist) {
    await checkPostsTable()
  }
  
  if (likesExist) {
    await checkLikesTable()
  } else {
    console.log('⚠️ Likes table missing - need to create it')
  }
  
  if (commentsExist) {
    await checkCommentsTable()
  } else {
    console.log('⚠️ Comments table missing - need to create it')
  }
  
  await checkRLSPolicies()
  
  if (!likesExist || !commentsExist) {
    await generateCreateTableSQL()
  }
  
  console.log('\n✅ Database check completed!')
}

main().catch(console.error)
