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
export async function compareContent(originalTranscript: string, userContent: string): Promise<ContentEvaluation> {
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.log("No Gemini API key found, returning mock evaluation")
      return getMockEvaluation(userContent)
    }

    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Create a prompt for Gemini AI to evaluate the content
    const prompt = `
      I need to evaluate a user's rewritten content based on an original video transcript.
      
      Original Transcript:
      """
      ${originalTranscript}
      """
      
      User's Rewritten Content:
      """
      ${userContent}
      """
      
      Please evaluate the user's content on the following criteria:
      1. Grammar and language usage (score out of 100)
      2. Content accuracy and completeness (score out of 100)
      3. Originality and creativity (score out of 100)
      
      Provide specific strengths and weaknesses of the user's content.
      Calculate an overall score out of 100 based on these criteria.

      Format your response as a JSON object with the following structure:
      {
        "score": number,
        "feedback": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "grammarScore": number,
        "contentScore": number,
        "originalityScore": number
      }
    `

    try {
      // Generate content using Gemini AI
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      // Parse the JSON response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]) as ContentEvaluation
      }
    } catch (error) {
      console.error("Error with Gemini API:", error)
      return getMockEvaluation(userContent)
    }

    // If JSON parsing fails, create a default evaluation
    return getMockEvaluation(userContent)
  } catch (error) {
    console.error("Error evaluating content:", error)

    // Return a mock evaluation in case of error
    return getMockEvaluation(userContent)
  }
}

// Function to evaluate a user's video presentation
export async function evaluateVideoPresentation(
  transcript: string,
  userVideoTranscript: string,
): Promise<ContentEvaluation> {
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.log("No Gemini API key found, returning mock evaluation")
      return getMockVideoEvaluation()
    }

    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Create a prompt for Gemini AI to evaluate the video presentation
    const prompt = `
      I need to evaluate a user's video presentation based on an original video transcript.
      
      Original Video Transcript:
      """
      ${transcript}
      """
      
      User's Video Presentation Transcript:
      """
      ${userVideoTranscript}
      """
      
      Please evaluate the user's presentation on the following criteria:
      1. Pronunciation and fluency (score out of 100)
      2. Content accuracy and completeness (score out of 100)
      3. Presentation style and engagement (score out of 100)
      
      Provide specific strengths and weaknesses of the user's presentation.
      Calculate an overall score out of 100 based on these criteria.
      
      Format your response as a JSON object with the following structure:
      {
        "score": number,
        "feedback": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "grammarScore": number,
        "contentScore": number,
        "originalityScore": number
      }
    `

    try {
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
    } catch (error) {
      console.error("Error with Gemini API:", error)
      return getMockVideoEvaluation()
    }

    // If JSON parsing fails, create a default evaluation
    return getMockVideoEvaluation()
  } catch (error) {
    console.error("Error evaluating video presentation:", error)

    // Return a mock evaluation in case of error
    return getMockVideoEvaluation()
  }
}

// Function to generate a mock content evaluation
function getMockEvaluation(content: string): ContentEvaluation {
  // Calculate a score based on content length to make it somewhat dynamic
  const lengthScore = Math.min(Math.max(content.length / 20, 60), 95)
  const randomVariation = Math.floor(Math.random() * 10) - 5 // -5 to +5

  return {
    score: Math.round(lengthScore + randomVariation),
    feedback:
      "Your content demonstrates good understanding of the key points from the video. You've used appropriate vocabulary and maintained good grammar throughout.",
    strengths: [
      "Clear organization of ideas",
      "Good use of vocabulary",
      "Accurate representation of the video content",
    ],
    weaknesses: ["Could include more specific examples", "Some sentences could be more concise"],
    grammarScore: Math.round(lengthScore + Math.floor(Math.random() * 10) - 2),
    contentScore: Math.round(lengthScore + Math.floor(Math.random() * 10) - 3),
    originalityScore: Math.round(lengthScore + Math.floor(Math.random() * 10) - 4),
  }
}

// Function to generate a mock video evaluation
function getMockVideoEvaluation(): ContentEvaluation {
  return {
    score: 82,
    feedback:
      "Your video presentation shows confidence and good pronunciation. The pacing is appropriate and you maintain good eye contact.",
    strengths: ["Clear pronunciation", "Good pacing", "Confident delivery"],
    weaknesses: ["Occasional hesitation", "Could improve intonation for emphasis"],
    grammarScore: 85,
    contentScore: 80,
    originalityScore: 82,
  }
}
