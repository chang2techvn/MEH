"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { extractYouTubeTranscript, extractYouTubeTranscriptForDuration } from "@/app/utils/video-processor"
import { getVideoSettings } from "@/app/actions/admin-settings"

// Types for content comparison
export type ContentComparison = {
  similarityScore: number
  isAboveThreshold: boolean
  feedback: string
  keyMatches: string[]
  suggestions: string[]
  detailedAnalysis: {
    originalTranscript: string
    matchedConcepts: string[]
    missedConcepts: string[]
    correctPoints: string[]
    incorrectPoints: string[]
    wordCount: number
    keywordMatches: number
  }
}

// Function to compare video transcript with user's rewritten content
export async function compareVideoContentWithUserContent(
  videoId: string, 
  userContent: string,
  threshold: number = 80
): Promise<ContentComparison> {
  try {
    // Get admin settings to determine minimum watch time
    const videoSettings = await getVideoSettings()
    const minWatchTimeSeconds = videoSettings.minWatchTime

    console.log(`\n🔍 === CONTENT COMPARISON FOR VIDEO ${videoId} ===`)
    console.log(`Admin Min Watch Time: ${minWatchTimeSeconds} seconds (${Math.round(minWatchTimeSeconds / 60)} minutes)`)
    console.log(`User Content Length: ${userContent.length} characters`)
    console.log(`Threshold: ${threshold}%`)

    // Extract only the portion of the video transcript corresponding to the minimum watch time
    const videoTranscript = await extractYouTubeTranscriptForDuration(videoId, minWatchTimeSeconds)
    
    // Print detailed comparison info to terminal
    console.log(`Video Transcript Length (limited): ${videoTranscript.length} characters`)
    console.log(`\n📝 --- USER CONTENT ---`)
    console.log(userContent)
    console.log(`\n📺 --- LIMITED VIDEO TRANSCRIPT (${minWatchTimeSeconds}s) ---`)
    console.log(videoTranscript.substring(0, 2000) + (videoTranscript.length > 2000 ? '...' : ''))
    console.log(`\n⚖️ --- STARTING COMPARISON PROCESS ---`)
    
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.log("No Gemini API key found, using improved mock comparison")
      return getImprovedMockComparison(videoTranscript, userContent, threshold)
    }

    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)    // Create a detailed prompt for Gemini AI to compare the content
    const prompt = `
      You are an expert content evaluator. Compare a YouTube video transcript with a user's rewritten content to determine similarity and understanding.
      
      IMPORTANT NOTE: The transcript provided below represents only the portion of the video that the user was required to watch (based on admin-configured minimum watch time of ${minWatchTimeSeconds} seconds / ${Math.round(minWatchTimeSeconds / 60)} minutes). The user's content should be evaluated based on understanding of this specific portion only.
      
      ORIGINAL VIDEO TRANSCRIPT (First ${minWatchTimeSeconds} seconds only):
      """
      ${videoTranscript}
      """
      
      USER'S REWRITTEN CONTENT:
      """
      ${userContent}
      """
      
      EVALUATION CRITERIA:
      1. Content Understanding (40%): How well does the user understand the main concepts from the watched portion?
      2. Key Information Coverage (30%): Are the important facts and details from the watched portion included?
      3. Accuracy (20%): Is the information from the watched portion correctly represented?
      4. Depth and Detail (10%): Does the content show comprehensive understanding of the watched portion?
      
      SCORING GUIDELINES:
      - 90-100: Excellent understanding, covers all main concepts from watched portion with accurate details
      - 80-89: Good understanding, covers most key concepts from watched portion with minor gaps
      - 70-79: Fair understanding, covers some concepts from watched portion but missing important elements
      - 60-69: Basic understanding, limited coverage of main concepts from watched portion
      - 0-59: Poor understanding, significant gaps or inaccuracies regarding the watched portion
      
      BE STRICT IN EVALUATION: 
      - Generic statements without specific details should score lower
      - Vague or superficial content should not exceed 70%
      - Only award 80%+ for content that demonstrates real understanding of specific concepts from the watched portion
      - Do not penalize for missing information that appears after the ${minWatchTimeSeconds}-second mark
      
      Identify:
      - Specific concepts that match between original (watched portion) and user content
      - Important concepts from the watched portion missed by the user
      - Correct points the user made about the watched portion
      - Any incorrect or inaccurate statements about the watched portion
      - Specific suggestions for improvement based on the watched portion
        Format your response as a JSON object:
      {
        "similarityScore": number,
        "feedback": "detailed explanation of the score",
        "keyMatches": ["specific matching concepts"],
        "suggestions": ["specific improvement suggestions"],
        "detailedAnalysis": {
          "matchedConcepts": ["concepts correctly identified"],
          "missedConcepts": ["important concepts not mentioned"],
          "correctPoints": ["accurate statements made"],
          "incorrectPoints": ["inaccurate or misleading statements"],
          "wordCount": number,
          "keywordMatches": number
        }
      }
    `    // Print the full prompt being sent to Gemini AI
    console.log(`\n🚀 === FULL PROMPT SENT TO GEMINI AI ===`)
    console.log(`Prompt Length: ${prompt.length} characters`)
    console.log(`\n--- START PROMPT ---`)
    console.log(prompt)
    console.log(`--- END PROMPT ---\n`)

    try {
      // Generate content using Gemini AI - Updated to use latest model
      console.log(`🔄 Sending request to Gemini AI (model: gemini-2.0-flash)...`)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      console.log(`\n✅ --- GEMINI AI RESPONSE RECEIVED ---`)
      console.log(`Response Length: ${text.length} characters`)
      console.log(`\n--- START RESPONSE ---`)
      console.log(text)
      console.log(`--- END RESPONSE ---`)      // Parse the JSON response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
      if (jsonMatch && jsonMatch[1]) {
        const comparison = JSON.parse(jsonMatch[1])
        
        const result = {
          ...comparison,
          isAboveThreshold: comparison.similarityScore >= threshold,
          detailedAnalysis: {
            originalTranscript: videoTranscript,
            ...comparison.detailedAnalysis
          }
        } as ContentComparison

        console.log(`\n📊 --- FINAL EVALUATION RESULTS ---`)
        console.log(`Similarity Score: ${result.similarityScore}%`)
        console.log(`Above Threshold (${threshold}%): ${result.isAboveThreshold}`)
        console.log(`Key Matches: ${result.keyMatches.length} items`)
        console.log(`Suggestions: ${result.suggestions.length} items`)
        console.log(`Word Count: ${result.detailedAnalysis.wordCount}`)
        console.log(`Keyword Matches: ${result.detailedAnalysis.keywordMatches}`)
        console.log(`🏁 === END COMPARISON ===\n`)

        return result
      }
    } catch (error) {
      console.error("Error with Gemini API:", error)
      return getImprovedMockComparison(videoTranscript, userContent, threshold)
    }

    // If JSON parsing fails, create a default comparison
    return getImprovedMockComparison(videoTranscript, userContent, threshold)
  } catch (error) {
    console.error("Error comparing content:", error)
    return getImprovedMockComparison("", userContent, threshold)
  }
}

// Improved mock comparison for when API is not available
function getImprovedMockComparison(videoTranscript: string, userContent: string, threshold: number): ContentComparison {
  // Analyze content more strictly
  const userWords = userContent.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  const transcriptWords = videoTranscript.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  
  // Calculate keyword matches
  const keywordMatches = userWords.filter(word => 
    transcriptWords.some(tWord => tWord.includes(word) || word.includes(tWord))
  ).length
  
  const keywordMatchRatio = transcriptWords.length > 0 ? keywordMatches / transcriptWords.length : 0
  
  // Analyze content quality
  const wordCount = userWords.length
  const hasGoodStructure = userContent.includes('.') && userContent.includes(',')
  const hasSpecificTerms = /\b(because|however|therefore|furthermore|moreover|specifically|particularly|especially)\b/i.test(userContent)
  const hasTechnicalContent = keywordMatchRatio > 0.1
  
  // Stricter scoring logic
  let mockScore = 30 // Lower base score
  
  // Word count scoring (max 15 points)
  if (wordCount >= 50) mockScore += 5
  if (wordCount >= 100) mockScore += 5
  if (wordCount >= 150) mockScore += 5
  
  // Structure scoring (max 10 points)
  if (hasGoodStructure) mockScore += 10
  
  // Content quality scoring (max 15 points)
  if (hasSpecificTerms) mockScore += 10
  if (hasTechnicalContent) mockScore += 5
  
  // Keyword matching scoring (max 30 points)
  mockScore += Math.floor(keywordMatchRatio * 100 * 0.3)
  
  // Cap at realistic maximum
  mockScore = Math.min(mockScore, 85)
  
  // Determine analysis details
  const matchedConcepts = keywordMatches > 5 ? 
    ["General topic understanding", "Some key terminology"] : 
    ["Basic topic recognition"]
    
  const missedConcepts = mockScore < 70 ? 
    ["Specific details", "Technical accuracy", "Comprehensive coverage", "Supporting examples"] :
    mockScore < 80 ? 
    ["Some technical details", "Additional examples"] :
    ["Minor supplementary information"]
    
  const correctPoints = mockScore > 60 ? 
    ["Basic understanding demonstrated", "Appropriate length"] : 
    ["Attempted to address the topic"]
    
  const incorrectPoints = mockScore < 50 ? 
    ["Insufficient detail", "Generic statements", "Limited understanding"] :
    mockScore < 70 ?
    ["Some vague statements", "Could be more specific"] :
    []
  
  const isAboveThreshold = mockScore >= threshold
  
  console.log(`\n--- MOCK EVALUATION DETAILS ---`)
  console.log(`Word Count: ${wordCount}`)
  console.log(`Keyword Matches: ${keywordMatches}/${transcriptWords.length} (${(keywordMatchRatio * 100).toFixed(1)}%)`)
  console.log(`Has Structure: ${hasGoodStructure}`)
  console.log(`Has Specific Terms: ${hasSpecificTerms}`)
  console.log(`Technical Content: ${hasTechnicalContent}`)
  console.log(`Final Score: ${mockScore}%`)
  console.log(`Above Threshold: ${isAboveThreshold}`)
  
  return {
    similarityScore: mockScore,
    isAboveThreshold,
    feedback: isAboveThreshold 
      ? `Good job! Your content demonstrates solid understanding with a similarity score of ${mockScore}%. You've captured the main concepts and shown good comprehension of the video content.`
      : `Your content needs significant improvement. Current similarity score is ${mockScore}%, which is below the required ${threshold}%. The content appears too generic or lacks specific details from the video. Please watch the video again and focus on capturing specific concepts, examples, and technical details mentioned.`,
    keyMatches: [
      `${keywordMatches} keyword matches found`,
      `${wordCount} words written`,
      `Content structure: ${hasGoodStructure ? 'Good' : 'Needs improvement'}`
    ],
    suggestions: isAboveThreshold 
      ? [
          "Consider adding more specific examples from the video",
          "Include technical terms and definitions mentioned",
          "Expand on the implications and conclusions discussed"
        ]
      : [
          "Watch the video multiple times and take detailed notes",
          "Focus on specific terminology and concepts mentioned",
          "Include concrete examples and facts from the video",
          "Aim for at least 150-200 words with specific details",
          "Use technical vocabulary from the video topic",
          "Structure your content with clear connections to the original"
        ],
    detailedAnalysis: {
      originalTranscript: videoTranscript,
      matchedConcepts,
      missedConcepts,
      correctPoints,
      incorrectPoints,
      wordCount,
      keywordMatches
    }
  }
}

// Function to get detailed feedback for content improvement
export async function getContentImprovementSuggestions(
  videoId: string,
  userContent: string
): Promise<string[]> {
  try {
    // Get admin settings to use the same watch time limit
    const videoSettings = await getVideoSettings()
    const minWatchTimeSeconds = videoSettings.minWatchTime
    
    // Use the limited transcript just like in the main comparison function
    const videoTranscript = await extractYouTubeTranscriptForDuration(videoId, minWatchTimeSeconds)
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return [
        "Add more specific details from the video",
        "Include key examples mentioned",
        "Expand on the main concepts",
        "Ensure proper structure and flow"
      ]
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const prompt = `
      Based on the original video transcript (limited to ${minWatchTimeSeconds} seconds that user was required to watch) and the user's content, provide 3-5 specific suggestions for improvement:
      
      Original (First ${minWatchTimeSeconds} seconds only): ${videoTranscript.substring(0, 500)}...
      User Content: ${userContent}
        Focus on what specific information or concepts are missing and how to improve understanding.
      Return as a JSON array of strings.
    `

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    const jsonMatch = text.match(/\[([\s\S]*?)\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return [
      "Add more specific details from the video",
      "Include key examples mentioned",
      "Expand on the main concepts"
    ]
  } catch (error) {
    console.error("Error getting improvement suggestions:", error)
    return [
      "Review the video content more carefully",
      "Add more detailed explanations",
      "Include specific examples"
    ]
  }
}