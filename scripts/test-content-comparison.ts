/**
 * Test script for content comparison functionality
 * This script tests the content comparison feature with mock data
 */

import { compareVideoContentWithUserContent } from "../app/actions/content-comparison"

async function testContentComparison() {
  console.log("🧪 Testing Content Comparison Functionality...")
  
  // Test data
  const testVideoId = "test_video_123"
  const testUserContent1 = `
    This video discusses the important topic of climate change and its impact on our planet. 
    The speaker explains how global temperatures are rising due to increased greenhouse gas emissions. 
    They provide examples of melting ice caps, changing weather patterns, and the effects on wildlife. 
    The video emphasizes the need for sustainable practices and renewable energy sources to combat this issue.
    It's clear that immediate action is required to prevent further environmental damage.
  `
  
  const testUserContent2 = `
    Nice video about weather.
  `
  
  try {
    // Test 1: High-quality content (should pass 80% threshold)
    console.log("\n📝 Test 1: High-quality content")
    const result1 = await compareVideoContentWithUserContent(testVideoId, testUserContent1, 80)
    console.log("✅ Similarity Score:", result1.similarityScore)
    console.log("✅ Above Threshold:", result1.isAboveThreshold)
    console.log("✅ Feedback:", result1.feedback)
    console.log("✅ Key Matches:", result1.keyMatches)
    
    // Test 2: Low-quality content (should fail 80% threshold)
    console.log("\n📝 Test 2: Low-quality content")
    const result2 = await compareVideoContentWithUserContent(testVideoId, testUserContent2, 80)
    console.log("❌ Similarity Score:", result2.similarityScore)
    console.log("❌ Above Threshold:", result2.isAboveThreshold)
    console.log("❌ Feedback:", result2.feedback)
    console.log("❌ Suggestions:", result2.suggestions)
    
    console.log("\n🎉 Content comparison tests completed successfully!")
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testContentComparison()
}

export { testContentComparison }
