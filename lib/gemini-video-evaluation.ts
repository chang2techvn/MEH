"use server"

import { generateGeminiVideoResponse, generateGeminiVideoResponseWithKey } from "@/lib/gemini-api"
import { downloadAndUploadToGemini, downloadAndUploadToGeminiWithKey, deleteGeminiFile } from "@/lib/gemini-file-upload"
import { getActiveApiKey, incrementUsage } from "@/lib/api-key-manager"
import { VideoEvaluation } from "./types/video-evaluation.types"
import { generateSystemPrompt, generateEvaluationPrompt } from "./utils/video-evaluation-prompts"
import { parseVideoEvaluationResponse } from "./utils/video-evaluation-response-parser"

// Re-export types for external use
export type { VideoEvaluation } from "./types/video-evaluation.types"

/**
 * Evaluate a video submission comprehensively using Gemini AI
 * @param videoUrl - URL to the video file
 * @param caption - User-written caption for the video
 * @param transcript - Video transcript (if available)
 * @param originalContent - Original content being responded to (if applicable)
 * @returns Comprehensive video evaluation
 */
export async function evaluateVideoSubmission(
  videoUrl: string,
  caption: string,
  transcript?: string,
  originalContent?: string
): Promise<VideoEvaluation> {
  let geminiFileName: string | null = null
  let maxRetries = 3
  let currentAttempt = 0
  
  while (currentAttempt < maxRetries) {
    try {
      currentAttempt++
      
      // Step 1: Get active API key from database for this attempt
      const apiKeyData = await getActiveApiKey('gemini')
      // Step 2: Download video from Supabase and upload to Gemini with the SAME API key
      const geminiUpload = await downloadAndUploadToGeminiWithKey(videoUrl, apiKeyData.decrypted_key)
      geminiFileName = geminiUpload.fileName

      // Increment usage for the upload
      await incrementUsage(apiKeyData.id)

      // Step 3: Generate prompts
      const systemPrompt = generateSystemPrompt()
      const evaluationPrompt = generateEvaluationPrompt(videoUrl, caption, transcript, originalContent)


      // Step 4: Send video and prompt to Gemini for analysis using the SAME API key
      const response = await generateGeminiVideoResponseWithKey(
        evaluationPrompt, 
        geminiUpload.uploadedFile, 
        systemPrompt,
        apiKeyData.decrypted_key
      )
      
      // Step 5: Increment API key usage
      await incrementUsage(apiKeyData.id)
      
      // Step 6: Parse the AI response and convert to structured format
      const evaluation = parseVideoEvaluationResponse(response, videoUrl, caption)
      
      // Step 7: Clean up - delete the file from Gemini
      if (geminiFileName) {
        await deleteGeminiFile(geminiFileName)
      }
      
      return evaluation
      
    } catch (error) {
      console.error(`❌ Video evaluation attempt ${currentAttempt} failed:`, error)
      
      // Clean up uploaded file on error
      if (geminiFileName) {
        try {
          await deleteGeminiFile(geminiFileName)
        } catch (cleanupError) {
          console.error("❌ Failed to cleanup Gemini file:", cleanupError)
        }
        geminiFileName = null // Reset for next attempt
      }
      
      // Check if this is an API key issue that might be resolved with a retry
      if (error instanceof Error && currentAttempt < maxRetries) {
        if (error.message.includes("403") || 
            error.message.includes("permission") || 
            error.message.includes("PERMISSION_DENIED") ||
            error.message.includes("Invalid API key")) {
          continue // Try again with a fresh API key and file upload
        }
      }
      
      // If it's the last attempt or not an API key issue, throw the error
      if (currentAttempt >= maxRetries) {
        console.error("❌ All video evaluation attempts exhausted")
        // Provide more specific error messages based on error type
        if (error instanceof Error) {
          if (error.message.includes("API key") || error.message.includes("authentication")) {
            throw new Error("Video evaluation failed due to API key issues. Please check your API key configuration.")
          } else if (error.message.includes("quota") || error.message.includes("limit")) {
            throw new Error("Video evaluation quota exceeded. Please try again later.")
          } else if (error.message.includes("file") || error.message.includes("upload")) {
            throw new Error("Video upload failed. Please ensure your video is valid and try again.")
          } else {
            throw new Error(`Video evaluation failed: ${error.message}`)
          }
        }
        throw error
      }
    }
  }
  
  throw new Error("Video evaluation failed after all retry attempts")
}

/**
 * Evaluate video and caption together for comprehensive assessment
 * Used by the submit & publish workflow
 */
export async function evaluateSubmissionForPublish(
  videoUrl: string,
  caption: string,
  transcript?: string,
  challengeContext?: string
): Promise<VideoEvaluation> {
  const evaluation = await evaluateVideoSubmission(videoUrl, caption, transcript, challengeContext)
  
  // Add submission-specific processing
  // For example, adjust scores based on challenge difficulty
  if (challengeContext?.includes("beginner")) {
    evaluation.score = Math.min(100, evaluation.score + 5) // Slight boost for beginners
  }
  
  return evaluation
}
