/**
 * Test the new strengths and weaknesses extraction
 */

const sampleResponse = `
**LANGUAGE DETECTED:** English - Clear English pronunciation and grammar throughout.

**VIDEO ANALYSIS:** The video is an English lesson demonstrating correct ways to respond to a question.

**OVERALL SCORE:** 85 - Good English performance with some areas for improvement.

**SCORES:**
- Pronunciation: 90
- Grammar: 85
- Vocabulary: 80
- Fluency: 85
- Coherence: 80
- Content: 85

**KEY POINTS:**
- The video uses clear and understandable English.
- The demonstration of correcting a common mistake is a strength.
- Good use of visual aids to support learning.

**STRENGTHS:**
- Excellent pronunciation and clear articulation
- Good grammar accuracy throughout the explanation
- Effective use of examples to illustrate points
- Confident speaking style maintains viewer engagement

**WEAKNESSES:**
- Limited vocabulary range, could use more advanced terms
- Occasional hesitation breaks the flow of speech
- Could improve eye contact with the camera
- Missing clear conclusion or summary at the end

**NEXT STEPS:**
- Practice more advanced vocabulary in context
- Work on maintaining steady speech rhythm
- Improve direct camera engagement techniques
`

// Test bullet point extraction
function testBulletExtraction(text, keyword) {
  const lines = text.split('\n')
  const results = []
  let inSection = false
  
  console.log(`Testing extraction for: ${keyword}`)
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Check if we're entering the relevant section
    if (new RegExp(`\\*\\*\\s*${keyword}\\s*:?\\*\\*`, 'i').test(trimmed)) {
      console.log(`Found section: ${trimmed}`)
      inSection = true
      continue
    }
    
    // If we're in the section, look for bullet points
    if (inSection) {
      // Stop if we hit another major section
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 5) {
        console.log(`End section found: ${trimmed}`)
        break
      }
      
      // Extract bullet points
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const cleanLine = trimmed.replace(/^[-•*\d+\.\s]*/, '').trim()
        if (cleanLine.length > 3) {
          results.push(cleanLine)
          console.log(`  - ${cleanLine}`)
        }
      }
    }
  }
  
  return results
}

console.log("Testing new strengths and weaknesses extraction:")
console.log("=".repeat(60))

const strengths = testBulletExtraction(sampleResponse, "strengths")
console.log(`\nExtracted ${strengths.length} strengths`)

console.log("\n" + "=".repeat(60))

const weaknesses = testBulletExtraction(sampleResponse, "weaknesses") 
console.log(`\nExtracted ${weaknesses.length} weaknesses`)

console.log("\n" + "=".repeat(60))

const keyPoints = testBulletExtraction(sampleResponse, "key.*points")
console.log(`\nExtracted ${keyPoints.length} key points`)

console.log("\n" + "=".repeat(60))

const nextSteps = testBulletExtraction(sampleResponse, "next.*steps")
console.log(`\nExtracted ${nextSteps.length} next steps`)
