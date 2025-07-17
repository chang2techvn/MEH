/**
 * Utility functions for working with the Gemini API
 * Updated to use API Key Manager with automatic failover
 */

import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai"
import { getActiveApiKey, incrementUsage, markKeyAsInactive, rotateToNextKey } from './api-key-manager'
import type { ApiKeyDecrypted, ApiKeyError } from '../types/api-keys.types'

// The base URL for the Gemini API
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"

// The model to use for text generation
export const GEMINI_MODEL = "gemini-2.5-flash"

// Fallback API key from environment (for emergency use)
const FALLBACK_API_KEY = process.env.GEMINI_API_KEY

// Configuration
const API_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000
}

/**
 * Gets an active Gemini API key with automatic failover
 */
async function getGeminiApiKey(): Promise<{ key: string; keyId?: string }> {
  try {
    const activeKey = await getActiveApiKey('gemini')
    return {
      key: activeKey.decrypted_key,
      keyId: activeKey.id
    }
  } catch (error) {
    console.warn('⚠️ Failed to get API key from database, using fallback:', error)
    
    if (!FALLBACK_API_KEY) {
      throw new Error('No API keys available - database unavailable and no fallback configured')
    }
    
    return {
      key: FALLBACK_API_KEY
    }
  }
}

/**
 * Handles API errors and performs automatic failover
 */
async function handleApiError(error: any, keyId?: string): Promise<{ shouldRetry: boolean; newKey?: { key: string; keyId?: string } }> {
  const status = error.status || error.response?.status
  
  if (status === 503) {
    console.log('🔄 Service unavailable (503), attempting key rotation...')
    if (keyId) {
      const rotation = await rotateToNextKey('gemini', keyId, 'Service unavailable (503)')
      if (rotation.success) {
        const newKey = await getGeminiApiKey()
        return { shouldRetry: true, newKey }
      }
    }
  } else if (status === 429) {
    console.log('⚠️ Quota exceeded (429), marking key as inactive...')
    if (keyId) {
      await markKeyAsInactive(keyId, 'Quota exceeded (429)')
      const newKey = await getGeminiApiKey()
      return { shouldRetry: true, newKey }
    }
  } else if (status === 403) {
    console.log('❌ Invalid API key (403), marking as inactive...')
    if (keyId) {
      await markKeyAsInactive(keyId, 'Invalid API key (403)')
      const newKey = await getGeminiApiKey()
      return { shouldRetry: true, newKey }
    }
  }
  
  return { shouldRetry: false }
}

/**
 * Generate a response from the Gemini API (text only) with automatic failover
 * @param prompt The prompt to send to the API
 * @param systemPrompt Optional system prompt to provide context
 * @returns The generated text response
 */
export async function generateGeminiResponse(prompt: string, systemPrompt?: string): Promise<string> {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
  let currentAttempt = 0
  let currentKey = await getGeminiApiKey()

  while (currentAttempt < API_CONFIG.maxRetries) {
    try {
      console.log(`🤖 Generating Gemini response (attempt ${currentAttempt + 1}/${API_CONFIG.maxRetries})`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

      const response = await fetch(`${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${currentKey.key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
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

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Gemini API error:", errorData)
        
        // Handle error and check if we should retry with a different key
        const errorResult = await handleApiError({ status: response.status, response }, currentKey.keyId)
        
        if (errorResult.shouldRetry && errorResult.newKey) {
          console.log('🔄 Retrying with new API key...')
          currentKey = errorResult.newKey
          currentAttempt++
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay))
          continue
        }
        
        throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()

      // Extract the response text from the Gemini API response
      const assistantResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again."

      // Increment usage counter for successful request
      if (currentKey.keyId) {
        await incrementUsage(currentKey.keyId)
      }

      console.log('✅ Gemini response generated successfully')
      return assistantResponse

    } catch (error) {
      console.error(`❌ Attempt ${currentAttempt + 1} failed:`, error)

      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏰ Request timeout, trying with different key...')
        const errorResult = await handleApiError({ status: 408 }, currentKey.keyId)
        if (errorResult.shouldRetry && errorResult.newKey) {
          currentKey = errorResult.newKey
        }
      }

      currentAttempt++

      if (currentAttempt >= API_CONFIG.maxRetries) {
        console.error('❌ All retry attempts exhausted')
        throw new Error(`Failed to generate response after ${API_CONFIG.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * currentAttempt))
    }
  }

  throw new Error('Failed to generate response - maximum retries exceeded')
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
  // Get current API key (no retries - this is handled at higher level)
  const currentKey = await getGeminiApiKey()
  
  console.log(`🎥 Generating Gemini video response`)
  console.log("📁 File URI:", uploadedFile.uri)
  console.log("💬 Prompt length:", prompt.length)

  // Initialize client with current API key
  const client = new GoogleGenAI({ apiKey: currentKey.key })
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

  // Increment usage counter for successful request
  if (currentKey.keyId) {
    await incrementUsage(currentKey.keyId)
  }

  console.log("✅ Received video response from Gemini")
  console.log("📝 Response length:", text.length)

  return text
}

/**
 * Generate a response from Gemini with video file support using a specific API key
 * @param prompt The text prompt
 * @param uploadedFile The uploaded file object from Gemini Files API
 * @param systemPrompt Optional system prompt
 * @param apiKey Specific API key to use
 * @returns The generated response
 */
export async function generateGeminiVideoResponseWithKey(
  prompt: string, 
  uploadedFile: any, 
  systemPrompt: string | undefined,
  apiKey: string
): Promise<string> {
  console.log(`🎥 Generating Gemini video response with provided key`)
  console.log("📁 File URI:", uploadedFile.uri)
  console.log("💬 Prompt length:", prompt.length)

  // Initialize client with provided API key
  const client = new GoogleGenAI({ apiKey })
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

  console.log("✅ Received video response from Gemini")
  console.log("📝 Response length:", text.length)

  return text
}
