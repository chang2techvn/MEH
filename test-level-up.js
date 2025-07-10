const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qpuwyzbidpvlzatphkoa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdXd5emJpZHB2bHphdHBoa29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjM5MDMsImV4cCI6MjA0ODczOTkwM30.6VWLj74PcMoOCN0oDjKLrUV_yOzLR8B9nxfHHj5pRJ0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions
function getChallengesForLevel(level) {
  return 6 + level
}

function calculateLevelFromChallenges(completedChallenges) {
  if (completedChallenges === 0) return 1
  
  let currentLevel = 1
  let totalChallengesUsed = 0
  
  while (true) {
    const challengesForThisLevel = getChallengesForLevel(currentLevel)
    if (totalChallengesUsed + challengesForThisLevel <= completedChallenges) {
      totalChallengesUsed += challengesForThisLevel
      currentLevel++
    } else {
      break
    }
  }
  
  return currentLevel
}

function shouldLevelUp(completedChallenges, currentLevel) {
  const calculatedLevel = calculateLevelFromChallenges(completedChallenges)
  return calculatedLevel > currentLevel
}

function getChallengesCompletedInCurrentLevel(completedChallenges, currentLevel) {
  let totalPreviousLevelChallenges = 0
  
  for (let level = 1; level < currentLevel; level++) {
    totalPreviousLevelChallenges += getChallengesForLevel(level)
  }
  
  return completedChallenges - totalPreviousLevelChallenges
}

async function testLevelUpLogic() {
  console.log('🔍 Testing Level Up Logic...')
  
  // Test different scenarios
  const testCases = [
    { completed: 0, currentLevel: 1, expectedLevel: 1, expectedChallengesInLevel: 0 },
    { completed: 5, currentLevel: 1, expectedLevel: 1, expectedChallengesInLevel: 5 },
    { completed: 7, currentLevel: 1, expectedLevel: 2, expectedChallengesInLevel: 0 },
    { completed: 10, currentLevel: 2, expectedLevel: 2, expectedChallengesInLevel: 3 },
    { completed: 15, currentLevel: 2, expectedLevel: 3, expectedChallengesInLevel: 0 },
    { completed: 20, currentLevel: 3, expectedLevel: 3, expectedChallengesInLevel: 5 },
    { completed: 24, currentLevel: 3, expectedLevel: 4, expectedChallengesInLevel: 0 },
  ]
  
  console.log('\n📊 Test Cases:')
  console.log('Level 1 needs 7 challenges (7 total)')
  console.log('Level 2 needs 8 challenges (15 total)')
  console.log('Level 3 needs 9 challenges (24 total)')
  console.log('Level 4 needs 10 challenges (34 total)')
  
  testCases.forEach((testCase, index) => {
    const { completed, currentLevel, expectedLevel, expectedChallengesInLevel } = testCase
    
    const shouldLevel = shouldLevelUp(completed, currentLevel)
    const calculatedLevel = calculateLevelFromChallenges(completed)
    const newLevel = Math.max(calculatedLevel, currentLevel)
    const challengesInLevel = getChallengesCompletedInCurrentLevel(completed, newLevel)
    const challengesNeededForLevel = getChallengesForLevel(newLevel)
    
    console.log(`\n${index + 1}. Completed: ${completed}, Current Level: ${currentLevel}`)
    console.log(`   Calculated Level: ${calculatedLevel}`)
    console.log(`   Should Level Up: ${shouldLevel}`)
    console.log(`   New Level: ${newLevel} (expected: ${expectedLevel})`)
    console.log(`   Challenges in Current Level: ${challengesInLevel}/${challengesNeededForLevel} (expected: ${expectedChallengesInLevel})`)
    
    if (newLevel !== expectedLevel) {
      console.log(`   ❌ FAIL: Expected level ${expectedLevel}, got ${newLevel}`)
    } else if (challengesInLevel !== expectedChallengesInLevel) {
      console.log(`   ❌ FAIL: Expected ${expectedChallengesInLevel} challenges in level, got ${challengesInLevel}`)
    } else {
      console.log(`   ✅ PASS`)
    }
  })
}

async function checkRealUserData() {
  console.log('\n🔍 Checking Real User Data...')
  
  try {
    // Get all users with their level and post count
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, level, points')
      .limit(5)
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (Level: ${user.level}, Points: ${user.points})`)
      
      // Count completed posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, score, created_at')
        .eq('user_id', user.id)
        .not('score', 'is', null)
        .gte('score', 70)
        .order('created_at', { ascending: false })
      
      if (postsError) {
        console.error('   Error fetching posts:', postsError)
        continue
      }
      
      const completedChallenges = posts?.length || 0
      const currentLevel = user.level || 1
      
      const shouldLevel = shouldLevelUp(completedChallenges, currentLevel)
      const suggestedLevel = shouldLevel ? currentLevel + 1 : currentLevel
      const challengesInLevel = getChallengesCompletedInCurrentLevel(completedChallenges, suggestedLevel)
      const challengesNeededForLevel = getChallengesForLevel(suggestedLevel)
      
      console.log(`   Completed Posts: ${completedChallenges}`)
      console.log(`   Current Level: ${currentLevel}`)
      console.log(`   Suggested Level: ${suggestedLevel}`)
      console.log(`   Challenges in Current Level: ${challengesInLevel}/${challengesNeededForLevel}`)
      
      if (shouldLevel) {
        console.log(`   🎉 Should level up to Level ${suggestedLevel}!`)
      }
    }
    
  } catch (error) {
    console.error('Error checking real user data:', error)
  }
}

async function main() {
  await testLevelUpLogic()
  await checkRealUserData()
}

main().catch(console.error)
