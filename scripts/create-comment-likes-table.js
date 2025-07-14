import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createCommentLikesTable() {
  console.log('🔍 Checking if comment_likes table exists...')
  
  // Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'comment_likes')
  
  if (tablesError) {
    console.error('❌ Error checking tables:', tablesError)
    return
  }
  
  if (tables && tables.length > 0) {
    console.log('✅ comment_likes table already exists')
    return
  }
  
  console.log('📤 Creating comment_likes table...')
  
  // Create the table using RPC call
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE comment_likes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(comment_id, user_id)
      );
      
      -- Create indexes for better performance
      CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
      CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
      
      -- Enable RLS
      ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies
      CREATE POLICY "Users can view all comment likes" ON comment_likes
        FOR SELECT USING (true);
        
      CREATE POLICY "Users can create their own comment likes" ON comment_likes
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
      CREATE POLICY "Users can delete their own comment likes" ON comment_likes
        FOR DELETE USING (auth.uid() = user_id);
    `
  })
  
  if (error) {
    console.error('❌ Error creating comment_likes table:', error)
  } else {
    console.log('✅ comment_likes table created successfully')
  }
}

async function checkCommentLikesStructure() {
  console.log('🔍 Checking comment_likes table structure...')
  
  const { data, error } = await supabase
    .from('comment_likes')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Error accessing comment_likes table:', error.message)
    if (error.message.includes('does not exist')) {
      await createCommentLikesTable()
    }
  } else {
    console.log('✅ comment_likes table structure is correct')
    console.log('📊 Sample data:', data)
  }
}

async function main() {
  try {
    await checkCommentLikesStructure()
    console.log('✅ All checks completed')
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

main()
