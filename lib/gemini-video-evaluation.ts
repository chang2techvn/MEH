"use server"

import { generateGeminiVideoResponse } from "@/lib/gemini-api"
import { downloadAndUploadToGemini, deleteGeminiFile } from "@/lib/gemini-file-upload"
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
  
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("❌ No Gemini API key found")
      throw new Error("Video evaluation service is not available. Please check API configuration.")
    }

    // Step 1: Download video from Supabase and upload to Gemini
    console.log("🔄 Step 1: Uploading video to Gemini for analysis...")
    const geminiUpload = await downloadAndUploadToGemini(videoUrl)
    geminiFileName = geminiUpload.fileName

    console.log("✅ Video uploaded to Gemini successfully")
    console.log("📁 File URI:", geminiUpload.fileUri)
    console.log("📁 File size:", geminiUpload.sizeBytes, "bytes")

    // Step 2: Generate prompts
    const systemPrompt = generateSystemPrompt()
    const evaluationPrompt = generateEvaluationPrompt(videoUrl, caption, transcript, originalContent)

    // Output prompts to terminal for debugging
    console.log("\n" + "=".repeat(80))
    console.log("🤖 GEMINI AI VIDEO EVALUATION - SYSTEM PROMPT")
    console.log("=".repeat(80))
    console.log(systemPrompt)
    console.log("\n" + "=".repeat(80))
    console.log("🎯 GEMINI AI VIDEO EVALUATION - EVALUATION PROMPT")
    console.log("=".repeat(80))
    console.log(evaluationPrompt)
    console.log("=".repeat(80) + "\n")

    // Step 3: Send video and prompt to Gemini for analysis
    console.log("🔄 Step 3: Analyzing video with Gemini AI...")
    const response = await generateGeminiVideoResponse(evaluationPrompt, geminiUpload.uploadedFile, systemPrompt)
    
    // Output AI response to terminal for debugging
    console.log("\n" + "=".repeat(80))
    console.log("🎯 GEMINI AI RESPONSE - VIDEO EVALUATION")
    console.log("=".repeat(80))
    console.log(response)
    console.log("=".repeat(80) + "\n")
    
    // Step 4: Parse the AI response and convert to structured format
    const evaluation = parseVideoEvaluationResponse(response, videoUrl, caption)
    
    // Step 5: Clean up - delete the file from Gemini
    if (geminiFileName) {
      console.log("🗑️ Cleaning up: deleting video from Gemini...")
      await deleteGeminiFile(geminiFileName)
    }
    
    return evaluation
    
  } catch (error) {
    console.error("❌ Error evaluating video with Gemini AI:", error)
    
    // Clean up uploaded file on error
    if (geminiFileName) {
      try {
        console.log("🗑️ Error cleanup: deleting video from Gemini...")
        await deleteGeminiFile(geminiFileName)
      } catch (cleanupError) {
        console.error("❌ Failed to cleanup Gemini file:", cleanupError)
      }
    }
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        throw new Error("Video evaluation service is unavailable. Please contact support.")
      } else if (error.message.includes("download") || error.message.includes("fetch") || error.message.includes("network")) {
        throw new Error("Unable to access the video file. Please ensure the video was uploaded correctly and try again.")
      } else if (error.message.includes("upload") || error.message.includes("Gemini")) {
        throw new Error("Failed to process video for analysis. Please try uploading the video again.")
      } else if (error.message.includes("parse") || error.message.includes("extract") || error.message.includes("Unable to parse")) {
        throw new Error("Failed to process AI evaluation response. The AI may be experiencing issues. Please try again in a few minutes.")
      } else if (error.message.includes("quota") || error.message.includes("limit") || error.message.includes("rate")) {
        throw new Error("Video evaluation service is temporarily unavailable due to high demand. Please try again in 10-15 minutes.")
      } else if (error.message.includes("language") || error.message.includes("English")) {
        throw new Error("Video evaluation failed. Please ensure your video contains clear English speech and try again.")
      } else {
        throw new Error(`Video evaluation failed: ${error.message}`)
      }
    }
    
    throw new Error("Video evaluation failed due to an unexpected error. Please try again later.")
  }
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
