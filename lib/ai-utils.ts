// Utility functions for AI interactions

export async function sendMessageToAI(message: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        systemPrompt: 'You are a helpful AI assistant. Respond clearly and concisely.'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.response || data.message || 'No response received from AI'
  } catch (error) {
    console.error('Error sending message to AI:', error)
    throw new Error('Failed to get AI response')
  }
}

// Utility function for the create character modal
export async function analyzeCharacterWithAI(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        systemPrompt: 'You are an expert character analyst. Analyze the given character and respond only with valid JSON format as requested.'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.response || data.message || 'Analysis completed but no response received'
  } catch (error) {
    console.error('Error analyzing character:', error)
    throw error
  }
}
