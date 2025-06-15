"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send, Sparkles } from "lucide-react"

export function GeminiIntegration() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse("")

    try {
      // Make a real API call to Gemini
      const apiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyABciaGKcsOTGrELi8PgmJtDteZ77hTuTw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an English language learning assistant. The user is asking: ${prompt}. 
                    Provide a helpful, educational response focused on English language learning.`,
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`)
      }

      const data = await apiResponse.json()

      // Extract the response text from the Gemini API response
      const assistantResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't generate a response. Please try again."

      setResponse(assistantResponse)
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      setResponse("Sorry, there was an error processing your request. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full bg-black/40 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purist-blue" />
          Gemini AI Assistant
        </CardTitle>
        <CardDescription>Ask questions about English grammar, vocabulary, or practice your writing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Type your English question or practice text here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-gray-900 border-gray-700"
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </form>

        {response && (
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-200">{response}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-400">
        Powered by Gemini AI models for English language learning
      </CardFooter>
    </Card>
  )
}
