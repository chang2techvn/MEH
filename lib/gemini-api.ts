/**
 * Utility functions for working with the Gemini API
 */

import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai"

// The API key for Google AI Studio (from environment variable)
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// The base URL for the Gemini API
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"

// The model to use for text generation
export const GEMINI_MODEL = "gemini-2.0-flash"

// Initialize Gemini AI client
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" })

/**
 * Generate a response from the Gemini API (text only)
 * @param prompt The prompt to send to the API
 * @param systemPrompt Optional system prompt to provide context
 * @returns The generated text response
 */
export async function generateGeminiResponse(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

    const response = await fetch(`${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Gemini API error:", errorData)
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Extract the response text from the Gemini API response
    const assistantResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again."

    return assistantResponse
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}

/**
 * Generate a response from Gemini with video file support
 * @param prompt The text prompt
 * @param uploadedFile The uploaded file object from Gemini Files API
 * @param systemPrompt Optional system prompt
 * @returns The generated response
 */
export async function generateGeminiVideoResponse(
  prompt: string, 
  uploadedFile: any, 
  systemPrompt?: string
): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required")
    }

    console.log("🤖 Sending video to Gemini for analysis...")
    console.log("📁 File URI:", uploadedFile.uri)
    console.log("💬 Prompt length:", prompt.length)

    // Prepare the content using the correct format from documentation
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

    // Use the correct SDK format with createUserContent and createPartFromUri
    const result = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType || "video/mp4"),
        fullPrompt
      ])
    })

    const text = result.text || ""

    console.log("✅ Received response from Gemini")
    console.log("📝 Response length:", text.length)

    return text

  } catch (error) {
    console.error("❌ Error calling Gemini Video API:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error("Video analysis quota exceeded. Please try again later.")
      } else if (error.message.includes("file") || error.message.includes("uri")) {
        throw new Error("Video file could not be accessed. Please upload the video again.")
      } else {
        throw new Error(`Video analysis failed: ${error.message}`)
      }
    }
    
    throw error
  }
}
