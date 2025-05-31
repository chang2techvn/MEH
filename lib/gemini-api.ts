/**
 * Utility functions for working with the Gemini API
 */

// The API key for Google AI Studio (from environment variable)
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// The base URL for the Gemini API
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"

// The model to use for text generation
export const GEMINI_MODEL = "gemini-2.0-flash"

/**
 * Generate a response from the Gemini API
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
