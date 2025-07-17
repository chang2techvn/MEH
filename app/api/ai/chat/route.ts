import { NextResponse } from 'next/server'
import { getActiveApiKey, incrementUsage, markKeyAsInactive } from '@/lib/api-key-manager'

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"
const GEMINI_MODEL = "gemini-2.5-flash"

export async function POST(request: Request) {
  let apiKeyData = null
  
  try {
    // Get active API key from database
    apiKeyData = await getActiveApiKey('gemini')
    console.log(`🔑 Using API key: ${apiKeyData.key_name} for chat request`)

    const { prompt, systemPrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

    const response = await fetch(`${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKeyData.decrypted_key}`, {
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
      console.error("Gemini API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      // Handle specific error cases for API key management
      if (response.status === 403) {
        console.log(`🚫 API key ${apiKeyData.key_name} is invalid, marking as inactive`)
        await markKeyAsInactive(apiKeyData.id, 'Invalid API key (403 Forbidden)')
      } else if (response.status === 429) {
        console.log(`⚠️ API key ${apiKeyData.key_name} quota exceeded, marking as inactive`)
        await markKeyAsInactive(apiKeyData.id, 'Quota exceeded (429)')
      } else if (response.status >= 500) {
        console.log(`🔄 Server error for ${apiKeyData.key_name}, marking as inactive temporarily`)
        await markKeyAsInactive(apiKeyData.id, `Server error (${response.status})`)
      }
      
      return NextResponse.json(
        { error: `API request failed with status ${response.status}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    // Increment API key usage on successful response
    await incrementUsage(apiKeyData.id)
    console.log(`📊 API key usage incremented for: ${apiKeyData.key_name}`)

    // Extract the response text from the Gemini API response
    const assistantResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again."

    return NextResponse.json({ response: assistantResponse })
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    
    // Handle database connection errors - fallback to .env if available
    if (error instanceof Error && error.message.includes('DATABASE_ERROR') && process.env.GEMINI_API_KEY) {
      console.log('🔄 Database error detected, attempting fallback to .env')
      try {
        const fallbackResponse = await fetch(`${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: await request.json().then(r => r.prompt) }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
          })
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          const fallbackText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || "Fallback response generated"
          console.log('✅ Fallback to .env successful')
          return NextResponse.json({ response: fallbackText })
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
