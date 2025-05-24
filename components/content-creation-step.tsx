"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Eye, Save, Pencil, FileText, Loader2 } from "lucide-react"
import RichTextEditor from "./rich-text-editor"
import { toast } from "@/hooks/use-toast"

interface ContentCreationStepProps {
  initialContent?: string
  onContentChange: (content: string) => void
  onSave: () => void
  isSaving?: boolean
}

export default function ContentCreationStep({
  initialContent = "",
  onContentChange,
  onSave,
  isSaving = false,
}: ContentCreationStepProps) {
  const [content, setContent] = useState(initialContent)
  const [activeTab, setActiveTab] = useState("write")

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onContentChange(newContent)
  }

  const handleSave = () => {
    if (content.trim().length < 100) {
      toast({
        title: "Content too short",
        description: "Please write at least 100 characters for your content.",
        variant: "destructive",
      })
      return
    }

    onSave()
  }

  return (
    <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
            <h2 className="text-xl font-bold">Create Content</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0">Step 3</Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Create a blog post or article based on the video content. Use the rich text editor to format your content.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-1 rounded-full">
            <TabsTrigger
              value="write"
              className="rounded-full data-[state=active]:bg-neo-mint data-[state=active]:text-white dark:data-[state=active]:bg-purist-blue"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Write
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-full data-[state=active]:bg-neo-mint data-[state=active]:text-white dark:data-[state=active]:bg-purist-blue"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="mt-0">
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Write your content here. Explain the key points from the video in your own words..."
              minHeight="400px"
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="border rounded-lg p-6 min-h-[400px] bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl prose dark:prose-invert prose-sm sm:prose-base max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>Your content preview will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            {content.length > 0 ? (
              <span>{content.length} characters</span>
            ) : (
              <span>Start writing to see character count</span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || content.trim().length < 100}
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Content
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
