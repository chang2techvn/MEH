import { supabase } from '../lib/supabase'

async function checkDatabase() {
  console.log('🔍 Checking comment_likes table...')
  
  try {
    // Try to select from comment_likes table
    const { data, error } = await supabase
      .from('comment_likes')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ comment_likes table error:', error.message)
      
      if (error.message.includes('does not exist')) {
        console.log('📝 comment_likes table does not exist. You need to create it manually in Supabase.')
        console.log('SQL to create the table:')
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
      }
    } else {
      console.log('✅ comment_likes table exists and is accessible')
    }
  } catch (err) {
    console.error('❌ Error:', err)
  }
  
  // Test comment functions
  console.log('🧪 Testing comment functions...')
  
  try {
    // Test getting comments
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
    
    if (posts && posts.length > 0) {
      const { getCommentsForPost } = await import('../lib/likes-comments')
      const comments = await getCommentsForPost(posts[0].id)
      console.log('✅ getCommentsForPost works, found', comments.length, 'comments')
    }
  } catch (err) {
    console.error('❌ Error testing functions:', err)
  }
}

checkDatabase()
