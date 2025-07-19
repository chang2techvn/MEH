"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { extractYouTubeTranscript, extractYouTubeTranscriptForDuration } from "@/lib/utils/video-processor"
import { getVideoSettings } from "@/app/actions/admin-settings"
import { supabaseServer } from "@/lib/supabase-server"
import { getActiveApiKey, incrementUsage, markKeyAsInactive } from "@/lib/api-key-manager"

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
    
    // Check unified challenges table for video
    console.log(`🔍 Checking challenges table for video: ${videoId}`)
    const { data: challengeData, error: challengeError } = await supabaseServer
      .from('challenges')
      .select('transcript, id, title, challenge_type')
      .eq('id', videoId)
      .single()
    
    if (challengeData && !challengeError && challengeData.transcript) {
      videoData = challengeData
      error = null
      console.log(`✅ Found transcript in challenges table (type: ${challengeData.challenge_type})`)
      console.log(`📝 Transcript length: ${challengeData.transcript.length} characters`)
    } else {
      error = challengeError
      console.log(`❌ No transcript found in challenges table`)
      console.log(`Error details:`, challengeError)
    }
      if (error || !videoData || !videoData.transcript) {
      return {
        similarityScore: 0,
        isAboveThreshold: false,
        feedback: `Video transcript not found in challenges table for video ${videoId}`,
        keyMatches: [],
        suggestions: ["Please ensure the video has been processed and transcript is available in the challenges table"],
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
    console.log(`Video Transcript Length (from challenges table): ${videoTranscript.length} characters`)
    console.log(`Challenge Type: ${videoData.challenge_type}`)
    console.log(`\n📝 --- USER CONTENT ---`)
    console.log(userContent)
    console.log(`\n📺 --- LIMITED VIDEO TRANSCRIPT (${minWatchTimeSeconds}s) ---`)
    console.log(videoTranscript.substring(0, 2000) + (videoTranscript.length > 2000 ? '...' : ''))
    console.log(`\n⚖️ --- STARTING COMPARISON PROCESS ---`)
    
    // Create a detailed and strict prompt for Gemini AI to evaluate content
    const prompt = `
      You are an EXTREMELY STRICT content evaluator. Compare a YouTube video transcript with a user's rewritten content to determine similarity and understanding.
      
      CRITICAL EVALUATION RULES:
      1. Over 80% is for content that matches word-for-word and position-by-position.
      2. Generic and vague statements should receive very low scores (0–20%).
      3. Content that appears to be guessing or written without watching (the video/lesson) should be scored 0–15%.

      The user was required to watch only the first ${minWatchTimeSeconds} seconds of the video.
      You should evaluate their content against ONLY that limited portion.
      
      ORIGINAL VIDEO TRANSCRIPT (First ${minWatchTimeSeconds} seconds only):
      """
      ${videoTranscript}
      """
      
      USER'S REWRITTEN CONTENT:
      """
      ${userContent}
      """
      
      STRICT SCORING GUIDELINES:
      - 81-100: OVER 80% MATCH — user content matches the transcript word-for-word and in the same order.
      - 21-80: PARTIAL MATCH — content includes correct concepts and phrases but not exact word-for-word order.
      - 1-20: GENERIC/VAGUE — minimal specificity, vague or generic statements (0–20% similarity).
      - 0: NO MATCH — content unrelated, random, or indicates guessing without watching (0% similarity).
      
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
    `

    // Print the full prompt being sent to Gemini AI
    console.log(`\n� === FULL PROMPT SENT TO GEMINI AI ===`)
    console.log(`Prompt Length: ${prompt.length} characters`)
    console.log(`\n--- START PROMPT ---`)
    console.log(prompt)
    console.log(`--- END PROMPT ---\n`)

    // Retry logic with multiple API keys
    let maxRetries = 3
    let currentAttempt = 0
    
    while (currentAttempt < maxRetries) {
      try {
        currentAttempt++
        console.log(`🔄 Content comparison attempt ${currentAttempt}/${maxRetries}`)
        
        // Get active API key for this attempt
        const apiKeyData = await getActiveApiKey('gemini')
        if (!apiKeyData) {
          throw new Error('No active API key found in database')
        }
        
        console.log(`🔑 Using API key: ${apiKeyData.key_name} for attempt ${currentAttempt}`)
        const genAI = new GoogleGenerativeAI(apiKeyData.decrypted_key)

        // Generate content using Gemini AI - Updated to use latest model
        console.log(`🔄 Sending request to Gemini AI (model: gemini-2.5-flash)...`)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Increment API key usage on successful response
        await incrementUsage(apiKeyData.id)
        console.log(`📊 API key usage incremented for: ${apiKeyData.key_name}`)

        console.log(`\n✅ --- GEMINI AI RESPONSE RECEIVED ---`)
        console.log(`Response Length: ${text.length} characters`)
        console.log(`\n--- START RESPONSE ---`)
        console.log(text)
        console.log(`--- END RESPONSE ---`)
        
        // Parse the JSON response
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
        
        throw new Error("Could not parse JSON response from Gemini AI")
        
      } catch (error) {
        console.error(`❌ Content comparison attempt ${currentAttempt} failed:`, error)
        
        // Handle specific error cases for API key management
        if (error instanceof Error && currentAttempt < maxRetries) {
          if (error.message.includes('403') || error.message.includes('Invalid API key')) {
            console.log(`🚫 API key invalid (403), marking as inactive and trying next key`)
            const currentApiKeyData = await getActiveApiKey('gemini').catch(() => null)
            if (currentApiKeyData) {
              await markKeyAsInactive(currentApiKeyData.id, 'Invalid API key (403 Forbidden)')
            }
            continue // Try with next API key
          } else if (error.message.includes('429') || error.message.includes('quota')) {
            console.log(`⚠️ API key quota exceeded (429), marking as inactive and trying next key`)
            const currentApiKeyData = await getActiveApiKey('gemini').catch(() => null)
            if (currentApiKeyData) {
              await markKeyAsInactive(currentApiKeyData.id, 'Quota exceeded (429)')
            }
            continue // Try with next API key
          } else if (error.message.includes('500') || error.message.includes('503') || error.message.includes('overloaded')) {
            console.log(`🔄 Server error (${error.message.includes('503') ? '503' : '500'}), marking key as inactive and trying next key`)
            const currentApiKeyData = await getActiveApiKey('gemini').catch(() => null)
            if (currentApiKeyData) {
              await markKeyAsInactive(currentApiKeyData.id, `Server error (${error.message})`)
            }
            continue // Try with next API key
          }
        }
        
        // If it's the last attempt or not an API key issue, throw the error
        if (currentAttempt >= maxRetries) {
          console.error("❌ All content comparison attempts exhausted")
          throw new Error(`Gemini AI evaluation failed after ${maxRetries} attempts: ${error}`)
        }
      }
    }
    
    throw new Error("Content comparison failed after all retry attempts")
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
  let apiKeyData: any = null;
  
  try {
    // Get admin settings to use the same watch time limit
    const videoSettings = await getVideoSettings()
    const minWatchTimeSeconds = videoSettings.minWatchTime
    // Use the limited transcript just like in the main comparison function
    const videoInfo = await extractYouTubeTranscriptForDuration(videoId, minWatchTimeSeconds)
    const videoTranscript = videoInfo.transcript || ""
    
    // Get active API key from database
    apiKeyData = await getActiveApiKey('gemini')
    console.log(`🔑 Using API key for suggestions: ${apiKeyData.key_name}`)

    const genAI = new GoogleGenerativeAI(apiKeyData.decrypted_key)
    const prompt = `
      Based on the original video transcript (limited to ${minWatchTimeSeconds} seconds that user was required to watch) and the user's content, provide 3-5 specific suggestions for improvement:
      
      Original (First ${minWatchTimeSeconds} seconds only): ${videoTranscript.substring(0, 500)}...
      User Content: ${userContent}
        Focus on what specific information or concepts are missing and how to improve understanding.
      Return as a JSON array of strings.
    `

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    // Increment API key usage on successful response
    await incrementUsage(apiKeyData.id)
    console.log(`📊 API key usage incremented for suggestions: ${apiKeyData.key_name}`)
    
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
    
    // Handle API key errors
    if (apiKeyData && error instanceof Error) {
      if (error.message.includes('403') || error.message.includes('Invalid API key')) {
        await markKeyAsInactive(apiKeyData.id, 'Invalid API key in suggestions')
      } else if (error.message.includes('429') || error.message.includes('quota')) {
        await markKeyAsInactive(apiKeyData.id, 'Quota exceeded in suggestions')
      }
    }
    
    return [
      "Review the video content more carefully",
      "Add more detailed explanations",
      "Include specific examples"
    ]
  }
}