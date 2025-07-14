require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLikesTableStructure() {
  console.log('🔍 Checking likes table structure...')
  
  try {
    // Check if likes table exists by trying to select from it
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('*')
      .limit(1)
    
    if (likesError) {
      if (likesError.code === '42P01') {
        console.log('❌ likes table does not exist')
        console.log('📝 You need to create the likes table')
        return
      }
      console.error('❌ Error reading likes table:', likesError)
      return
    }
    
    console.log('✅ likes table exists and is accessible')
    
    // Try to get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('likes')
      .select('*')
      .limit(5)
    
    if (!sampleError) {
      console.log(`📊 Found ${sampleData?.length || 0} likes in the table`)
      if (sampleData && sampleData.length > 0) {
        console.log('Sample likes data:')
        console.table(sampleData)
        
        // Check what columns exist by looking at the first row
        const columns = Object.keys(sampleData[0])
        console.log('📋 Detected columns:', columns)
        
        if (columns.includes('comment_id')) {
          console.log('✅ likes table has comment_id column - can be used for comment likes')
        } else {
          console.log('❌ likes table does NOT have comment_id column')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking likes table:', error)
  }
}

async function checkCommentLikesTableStructure() {
  console.log('\n🔍 Checking comment_likes table structure...')
  
  try {
    // Check if comment_likes table exists by trying to select from it
    const { data: commentLikesData, error: commentLikesError } = await supabase
      .from('comment_likes')
      .select('*')
      .limit(1)
    
    if (commentLikesError) {
      if (commentLikesError.code === '42P01') {
        console.log('❌ comment_likes table does not exist')
        console.log('📝 You need to create it. Go to your Supabase dashboard > SQL Editor and run:')
        console.log(`
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comment likes" ON comment_likes
  FOR SELECT USING (true);
  
CREATE POLICY "Users can create their own comment likes" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own comment likes" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);
        `)
        return
      }
      console.error('❌ Error reading comment_likes table:', commentLikesError)
      return
    }
    
    console.log('✅ comment_likes table exists and is accessible')
    
    // Try to get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('comment_likes')
      .select('*')
      .limit(5)
    
    if (!sampleError) {
      console.log(`📊 Found ${sampleData?.length || 0} comment likes in the table`)
      if (sampleData && sampleData.length > 0) {
        console.log('Sample comment_likes data:')
        console.table(sampleData)
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking comment_likes table:', error)
  }
}

async function checkCommentsTableStructure() {
  console.log('\n🔍 Checking comments table structure...')
  
  try {
    // Check if comments table has likes_count column
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(1)
    
    if (commentsError) {
      console.error('❌ Error reading comments table:', commentsError)
      return
    }
    
    console.log('✅ comments table exists and is accessible')
    
    if (commentsData && commentsData.length > 0) {
      const columns = Object.keys(commentsData[0])
      console.log('📋 Comments table columns:', columns)
      
      if (columns.includes('likes_count')) {
        console.log('✅ comments table has likes_count column')
      } else {
        console.log('❌ comments table missing likes_count column')
        console.log('📝 You need to add it:')
        console.log('ALTER TABLE comments ADD COLUMN likes_count INTEGER DEFAULT 0;')
      }
    }
    
    // Get sample comments
    const { data: sampleComments } = await supabase
      .from('comments')
      .select('*')
      .limit(3)
    
    if (sampleComments && sampleComments.length > 0) {
      console.log(`📊 Found ${sampleComments.length} sample comments:`)
      console.table(sampleComments)
    }
    
  } catch (error) {
    console.error('❌ Error checking comments table:', error)
  }
}

async function checkIfLikesTableSupportsComments() {
  console.log('\n🔍 Checking if likes table supports comments...')
  
  try {
    // Get likes table structure to see if it has a comment_id column
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'likes')
      .eq('table_schema', 'public')
    
    const columnNames = columns?.map(col => col.column_name) || []
    console.log('📋 Likes table columns:', columnNames)
    
    if (columnNames.includes('comment_id')) {
      console.log('✅ likes table has comment_id column - can be used for comment likes')
      
      // Check if there are any comment likes in the likes table
      const { data: commentLikes, error } = await supabase
        .from('likes')
        .select('*')
        .not('comment_id', 'is', null)
        .limit(5)
      
      if (!error) {
        console.log(`� Found ${commentLikes?.length || 0} comment likes in likes table`)
        if (commentLikes && commentLikes.length > 0) {
          console.log('Sample comment likes:')
          console.table(commentLikes)
        }
      }
    } else {
      console.log('❌ likes table does NOT have comment_id column')
      console.log('📝 You need to add comment_id column or use separate comment_likes table')
    }
    
  } catch (error) {
    console.error('❌ Error checking likes table columns:', error)
  }
}

async function main() {
  console.log('🚀 Starting likes table structure check...\n')
  
  await checkLikesTableStructure()
  await checkCommentsTableStructure()
  await checkCommentLikesTableStructure()
  
  console.log('\n✅ Check completed!')
}

main().catch(console.error)
