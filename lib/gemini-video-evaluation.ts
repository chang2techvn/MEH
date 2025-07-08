"use server"

import { generateGeminiResponse } from "@/lib/gemini-api"
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
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("❌ No Gemini API key found")
      throw new Error("Video evaluation service is not available. Please check API configuration.")
    }

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

    const response = await generateGeminiResponse(evaluationPrompt, systemPrompt)
    
    // Output AI response to terminal for debugging
    console.log("\n" + "=".repeat(80))
    console.log("🎯 GEMINI AI RESPONSE - VIDEO EVALUATION")
    console.log("=".repeat(80))
    console.log(response)
    console.log("=".repeat(80) + "\n")
    
    // Parse the AI response and convert to structured format
    return parseVideoEvaluationResponse(response, videoUrl, caption)
  } catch (error) {
    console.error("❌ Error evaluating video with Gemini AI:", error)
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        throw new Error("Video evaluation service is unavailable. Please contact support.")
      } else if (error.message.includes("parse") || error.message.includes("extract") || error.message.includes("Unable to parse")) {
        throw new Error("Failed to process AI evaluation response. The AI may be experiencing issues. Please try again in a few minutes.")
      } else if (error.message.includes("quota") || error.message.includes("limit") || error.message.includes("rate")) {
        throw new Error("Video evaluation service is temporarily unavailable due to high demand. Please try again in 10-15 minutes.")
      } else if (error.message.includes("network") || error.message.includes("timeout") || error.message.includes("connection")) {
        throw new Error("Network connection issue. Please check your internet connection and try again.")
      } else if (error.message.includes("video") || error.message.includes("URL") || error.message.includes("file")) {
        throw new Error("Unable to access the video file. Please ensure the video was uploaded correctly and try again.")
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
