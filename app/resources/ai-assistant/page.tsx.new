"use client"

import { GeminiChatInterface } from "@/components/gemini-chat-interface"
import PageHeader from "@/components/page-header"

export default function AIAssistantPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="AI Language Assistant"
        description="Practice your English with our AI-powered language assistant powered by Gemini"
        className="mb-8"
      />

      <div className="mb-8">
        <GeminiChatInterface />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-3">Grammar Help</h3>
          <p className="text-muted-foreground mb-4">
            Ask the AI assistant to explain grammar rules, correct your sentences, or provide examples of proper usage.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              "Explain the present perfect tense"
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              "Is this sentence correct: 'I have been to Paris last year'?"
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-3">Vocabulary Building</h3>
          <p className="text-muted-foreground mb-4">
            Expand your vocabulary with synonyms, idioms, and topic-specific language.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              "Give me 5 synonyms for 'important'"
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              "What are common idioms about success?"
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-3">Conversation Practice</h3>
          <p className="text-muted-foreground mb-4">
            Practice real-world conversations for work, travel, or daily situations.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              "Let's practice a job interview"
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              "Help me practice ordering food at a restaurant"
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
