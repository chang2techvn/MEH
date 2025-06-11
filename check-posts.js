const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkPostsData() {
  console.log('🔍 Checking posts table...')
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (postsError) {
    console.error('❌ Posts error:', postsError)
  } else {
    console.log(`✅ Found ${posts?.length || 0} posts`)
    posts?.forEach((post, index) => {
      console.log(`  ${index + 1}. "${post.title}" by user ${post.user_id} (${post.post_type})`)
    })
  }
  
  console.log('\n🔍 Checking users table...')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email')
    .limit(10)
  
  if (usersError) {
    console.error('❌ Users error:', usersError)
  } else {
    console.log(`✅ Found ${users?.length || 0} users`)
    users?.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name || user.email} (${user.id})`)
    })
  }
  
  console.log('\n🔍 Checking comments table...')
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .limit(10)
  
  if (commentsError) {
    console.error('❌ Comments error:', commentsError)
  } else {
    console.log(`✅ Found ${comments?.length || 0} comments`)
  }
}

checkPostsData()
