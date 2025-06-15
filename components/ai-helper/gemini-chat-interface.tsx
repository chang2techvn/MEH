"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button" 
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

export function GeminiChatInterface() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center">
                AI
              </div>
              <div className="bg-secondary p-3 rounded-lg">
                <p>Hello! I'm your English language assistant. How can I help you practice your English today?</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message here..."
                className="flex-1 min-h-24"
              />
              <Button className="self-end">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This is a placeholder component. The real implementation would connect to the Google Gemini AI API.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
