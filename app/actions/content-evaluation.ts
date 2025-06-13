"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Types for content evaluation
export type ContentEvaluation = {
  score: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
  grammarScore: number
  contentScore: number
  originalityScore: number
}

// Function to compare user content with original transcript
export async function compareContent(originalTranscript: string, userContent: string): Promise<ContentEvaluation> {  try {
    // Get API key - required for evaluation
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment variables!")
      throw new Error("Gemini API key is required for content evaluation")
    }

    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Create a strict prompt for Gemini AI to evaluate the content
    const prompt = `
      You are a STRICT content evaluator. Evaluate a user's rewritten content based on an original video transcript.
      
      CRITICAL EVALUATION RULES:
      1. Be VERY STRICT - content should score 0-30% unless it shows GENUINE understanding
      2. Generic, vague statements should receive very low scores (0-20%)
      3. Content that seems to be guessing should score 0-15%
      4. Only content with SPECIFIC details should score above 50%
      5. 80%+ is reserved ONLY for exceptional understanding
      
      Original Transcript:
      """
      ${originalTranscript}
      """
      
      User's Rewritten Content:
      """
      ${userContent}
      """
      
      STRICT SCORING GUIDELINES:
      - 90-100: EXCEPTIONAL - Covers all concepts with specific details and deep understanding
      - 80-89: EXCELLENT - Covers most concepts with good specificity
      - 70-79: GOOD - Shows solid understanding with some specific details
      - 50-69: FAIR - Limited understanding, lacks specificity
      - 30-49: POOR - Minimal understanding, mostly generic statements
      - 0-29: FAILING - No evidence of understanding, generic or irrelevant content
      
      AUTOMATIC PENALTIES:
      - Content under 50 words: Automatic score under 20%
      - No specific terminology: Maximum 40%
      - Generic statements only: Maximum 25%
      
      Evaluate on:
      1. Grammar and language usage (score out of 100)
      2. Content accuracy and completeness (score out of 100) 
      3. Originality and creativity (score out of 100)
      
      Format your response as JSON:
      {
        "score": number,
        "feedback": "specific explanation of the score",
        "strengths": ["specific strengths"],
        "weaknesses": ["specific weaknesses"],
        "grammarScore": number,
        "contentScore": number,
        "originalityScore": number
      }
    `

    // Generate content using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse the JSON response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]) as ContentEvaluation
    }
    
    throw new Error("Could not parse JSON response from Gemini AI")
  } catch (error) {
    console.error("❌ Error evaluating content:", error)
    throw new Error(`Content evaluation failed: ${error}`)
  }
}

// Function to evaluate a user's video presentation
export async function evaluateVideoPresentation(
  transcript: string,
  userVideoTranscript: string,
): Promise<ContentEvaluation> {
  try {
    // Get API key - required for evaluation
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment variables!")
      throw new Error("Gemini API key is required for video presentation evaluation")
    }

    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Create a strict prompt for Gemini AI to evaluate the video presentation
    const prompt = `
      You are a STRICT video presentation evaluator. Evaluate a user's video presentation based on an original video transcript.
      
      CRITICAL EVALUATION RULES:
      1. Be VERY STRICT - presentations should score 0-30% unless they show GENUINE skill
      2. Poor pronunciation or delivery should receive low scores (0-20%)
      3. Generic or copied content should score 0-15%
      4. Only presentations with GOOD delivery and content should score above 50%
      5. 80%+ is reserved ONLY for exceptional presentations
      
      Original Video Transcript:
      """
      ${transcript}
      """
      
      User's Video Presentation Transcript:
      """
      ${userVideoTranscript}
      """
      
      STRICT SCORING GUIDELINES:
      - 90-100: EXCEPTIONAL - Excellent delivery, perfect content, engaging presentation
      - 80-89: EXCELLENT - Good delivery, accurate content, clear presentation
      - 70-79: GOOD - Decent delivery, mostly accurate content
      - 50-69: FAIR - Basic delivery, some content issues
      - 30-49: POOR - Poor delivery, significant content problems
      - 0-29: FAILING - Very poor delivery, inaccurate or irrelevant content
      
      AUTOMATIC PENALTIES:
      - Transcript under 100 words: Automatic score under 20%
      - No clear structure: Maximum 40%
      - Poor grammar/pronunciation: Maximum 30%
      
      Evaluate on:
      1. Pronunciation and fluency (score out of 100)
      2. Content accuracy and completeness (score out of 100)
      3. Presentation style and engagement (score out of 100)
      
      Format your response as JSON:
      {
        "score": number,
        "feedback": "specific explanation of the score",
        "strengths": ["specific strengths"],
        "weaknesses": ["specific weaknesses"],
        "grammarScore": number,
        "contentScore": number,
        "originalityScore": number
      }
    `

    // Generate content using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse the JSON response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]) as ContentEvaluation
    }
    
    throw new Error("Could not parse JSON response from Gemini AI")
  } catch (error) {
    console.error("❌ Error evaluating video presentation:", error)
    throw new Error(`Video presentation evaluation failed: ${error}`)
  }
}
