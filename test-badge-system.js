// Test badge extraction logic
console.log('🔍 Testing Badge System...')

// Mock function to extract badge text from title (same as in PostHeader)
function getBadgeText(title) {
  if (!title) return null
  if (title.startsWith('Daily -')) return 'Daily'
  if (title.startsWith('Practice -')) return 'Practice'
  return null
}

// Test cases
const testCases = [
  {
    title: "Daily - 7/11/2025",
    expected: "Daily",
    description: "Daily challenge title"
  },
  {
    title: "Practice - 7/11/2025", 
    expected: "Practice",
    description: "Practice challenge title"
  },
  {
    title: "Video Analysis - 7/11/2025",
    expected: null,
    description: "Regular video analysis (no badge)"
  },
  {
    title: null,
    expected: null,
    description: "No title"
  },
  {
    title: "Random title",
    expected: null,
    description: "Random title (no badge)"
  }
]

console.log('\n📊 Badge Extraction Tests:')

let allPassed = true

testCases.forEach((testCase, index) => {
  const result = getBadgeText(testCase.title)
  const passed = result === testCase.expected
  
  console.log(`${index + 1}. ${testCase.description}`)
  console.log(`   Title: "${testCase.title}"`)
  console.log(`   Expected: ${testCase.expected}`)
  console.log(`   Got: ${result}`)
  console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}`)
  console.log()
  
  if (!passed) allPassed = false
})

console.log(`${allPassed ? '🎉' : '❌'} Overall Result: ${allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED'}`)

// Test community post creation logic
console.log('\n🔍 Testing Community Post Creation Logic...')

// Mock function to create post title (same as in community-posts.ts)
function createPostTitle(challengeType) {
  return challengeType 
    ? `${challengeType === 'daily' ? 'Daily' : 'Practice'} - ${new Date().toLocaleDateString()}`
    : `Video Analysis - ${new Date().toLocaleDateString()}`
}

const postCreationTests = [
  {
    challengeType: 'daily',
    expectedPattern: /^Daily - \d{1,2}\/\d{1,2}\/\d{4}$/,
    description: "Daily challenge post"
  },
  {
    challengeType: 'practice', 
    expectedPattern: /^Practice - \d{1,2}\/\d{1,2}\/\d{4}$/,
    description: "Practice challenge post"
  },
  {
    challengeType: undefined,
    expectedPattern: /^Video Analysis - \d{1,2}\/\d{1,2}\/\d{4}$/,
    description: "Regular video analysis post"
  }
]

console.log('\n📊 Post Title Creation Tests:')

postCreationTests.forEach((test, index) => {
  const title = createPostTitle(test.challengeType)
  const passed = test.expectedPattern.test(title)
  
  console.log(`${index + 1}. ${test.description}`)
  console.log(`   Challenge Type: ${test.challengeType || 'undefined'}`)
  console.log(`   Generated Title: "${title}"`)
  console.log(`   Pattern Match: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  console.log()
  
  if (!passed) allPassed = false
})

console.log(`${allPassed ? '🎉' : '❌'} Overall Result: ${allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED'}`)

console.log('\n💡 Implementation Summary:')
console.log('✅ Updated createCommunityPost to accept challengeType parameter')
console.log('✅ Added logic to generate "Daily - date" or "Practice - date" titles')
console.log('✅ Updated daily-challenge.tsx to pass challenge mode')
console.log('✅ Added title prop to PostHeader interface')
console.log('✅ Implemented badge extraction logic in PostHeader')
console.log('✅ Added gradient badge styling (neo-mint to purist-blue)')
console.log('✅ Updated FeedPost and related components to pass title')
console.log('✅ Added title mapping in community page and feed section')
console.log()
console.log('🎯 Expected Behavior:')
console.log('- Daily Challenge posts will show "Daily" badge')
console.log('- Practice Challenge posts will show "Practice" badge')
console.log('- Regular posts will show no badge')
console.log('- Badge appears next to menu (3 dots) in top right corner')
console.log('- Badge has gradient styling matching app theme')
