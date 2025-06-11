const { generateDailyChallenges } = require('./app/actions/challenge-videos.ts')

async function testChallenges() {
  console.log('🧪 Testing challenge generation...')
  const startTime = Date.now()
  
  try {
    const challenges = await generateDailyChallenges()
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ Generated ${challenges.length} challenges in ${duration}ms (${(duration/1000).toFixed(1)}s)`)
    console.log('Challenge IDs:', challenges.map(c => c.id))
    console.log('Unique IDs:', [...new Set(challenges.map(c => c.id))].length)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testChallenges()
