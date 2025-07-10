"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { extractYouTubeTranscript, extractYouTubeTranscriptForDuration } from "@/utils/video-processor"
import { getVideoSettings } from "@/app/actions/admin-settings"
import { supabaseServer } from "@/lib/supabase-server"

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

    let videoData: any = null
    let error: any = null
    
    // First try daily_videos table (for daily challenges)
    console.log(`🔍 Checking daily_videos table for video: ${videoId}`)
    const { data: dailyVideoData, error: dailyVideoError } = await supabaseServer
      .from('daily_videos')
      .select('transcript, id, title')
      .eq('id', videoId)
      .single()
    
    if (dailyVideoData && !dailyVideoError && dailyVideoData.transcript) {
      videoData = dailyVideoData
      console.log(`✅ Found transcript in daily_videos table`)
    } else {
      // If not found in daily_videos, try daily_challenges table (for practice challenges)
      console.log(`🔍 Not found in daily_videos, checking daily_challenges table...`)
      const { data: dailyChallengeData, error: dailyChallengeError } = await supabaseServer
        .from('daily_challenges')
        .select('transcript, id, title')
        .eq('id', videoId)
        .single()
      
      if (dailyChallengeData && !dailyChallengeError && dailyChallengeData.transcript) {
        videoData = dailyChallengeData
        error = null
        console.log(`✅ Found transcript in daily_challenges table`)
        console.log(`📝 Transcript length: ${dailyChallengeData.transcript.length} characters`)
      } else {
        error = dailyChallengeError
        console.log(`❌ No transcript found in either table`)
        console.log(`Error details:`, dailyChallengeError)
      }
    }
      if (error || !videoData || !videoData.transcript) {
      return {
        similarityScore: 0,
        isAboveThreshold: false,
        feedback: `Video transcript not found in database for video ${videoId}`,
        keyMatches: [],
        suggestions: ["Please ensure the video has been processed and transcript is available"],
        detailedAnalysis: {
          originalTranscript: "",
          matchedConcepts: [],
          missedConcepts: [],
          correctPoints: [],
          incorrectPoints: [],
          wordCount: 0,
          keywordMatches: 0
        }
      }
    }
    
    const videoTranscript = videoData.transcript
    
    // Print detailed comparison info to terminal
    console.log(`Video Transcript Length (from database): ${videoTranscript.length} characters`)
    console.log(`\n📝 --- USER CONTENT ---`)
    console.log(userContent)
    console.log(`\n📺 --- LIMITED VIDEO TRANSCRIPT (${minWatchTimeSeconds}s) ---`)
    console.log(videoTranscript.substring(0, 2000) + (videoTranscript.length > 2000 ? '...' : ''))
    console.log(`\n⚖️ --- STARTING COMPARISON PROCESS ---`)
      // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment variables!")
      throw new Error("Gemini API key is required for content evaluation")
    }

    console.log(`🔑 Gemini API Key found: ${apiKey.substring(0, 10)}...`)

    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)    // Create a detailed and strict prompt for Gemini AI to evaluate content
    const prompt = `
      You are an EXTREMELY STRICT content evaluator. Compare a YouTube video transcript with a user's rewritten content to determine similarity and understanding.
      
      CRITICAL EVALUATION RULES:
      1. Be VERY STRICT - most content should score between 0-30% unless it shows GENUINE understanding
      2. Generic, vague statements should receive very low scores (0-20%)
      3. Content that seems to be guessing or written without watching should score 0-15%
      4. Only content with SPECIFIC details and concepts should score above 50%
      5. 80%+ is reserved ONLY for exceptional understanding with detailed specifics
      
      ORIGINAL VIDEO TRANSCRIPT (First ${minWatchTimeSeconds} seconds only):
      """
      ${videoTranscript}
      """
      
      USER'S REWRITTEN CONTENT:
      """
      ${userContent}
      """
      
      STRICT SCORING GUIDELINES:
      - 90-100: EXCEPTIONAL - Covers all main concepts with specific details, technical terms, and deep understanding
      - 80-89: EXCELLENT - Covers most key concepts with good specificity and clear understanding  
      - 70-79: GOOD - Shows solid understanding with some specific details and concepts
      - 50-69: FAIR - Limited understanding, some relevant content but lacks specificity
      - 30-49: POOR - Minimal understanding, mostly generic or vague statements
      - 0-29: FAILING - No evidence of watching video, generic content, or completely irrelevant
      
      AUTOMATIC PENALTY CRITERIA:
      - Content under 50 words: Automatic score under 20%
      - No specific terminology from video: Maximum 40%
      - Generic statements only: Maximum 25%
      - Appears to be random text or gibberish: 0-10%
      - No clear connection to video content: 0-15%
      
      EVALUATION FOCUS:
      1. Does the user demonstrate they actually watched the specific portion?
      2. Are specific concepts, terms, or examples from the transcript mentioned?
      3. Is the content substantive and detailed, not just generic statements?
      4. Does it show comprehension beyond surface-level understanding?
      
      Format your response as a JSON object:
      {
        "similarityScore": number,
        "feedback": "specific explanation of why this score was given",
        "keyMatches": ["specific matching concepts found"],
        "suggestions": ["concrete improvement suggestions"],
        "detailedAnalysis": {
          "matchedConcepts": ["specific concepts correctly identified"],
          "missedConcepts": ["important concepts not mentioned"],
          "correctPoints": ["accurate specific statements made"],
          "incorrectPoints": ["inaccurate or vague statements"],
          "wordCount": number,
          "keywordMatches": number
        }
      }
    `// Print the full prompt being sent to Gemini AI
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

        return result      }
      
      throw new Error("Could not parse JSON response from Gemini AI")
    } catch (error) {
      console.error("❌ Error with Gemini API:", error)
      throw new Error(`Gemini AI evaluation failed: ${error}`)
    }
  } catch (error) {
    console.error("❌ Error comparing content:", error)
    throw new Error(`Content comparison failed: ${error}`)
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
    const videoInfo = await extractYouTubeTranscriptForDuration(videoId, minWatchTimeSeconds)
    const videoTranscript = videoInfo.transcript || ""
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