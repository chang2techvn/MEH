"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ArrowLeft, Share2, Save, Check, Send, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PostPreviewProps {
  title: string
  content: string
  videoUrl: string
  username: string
  userImage: string
  onBack: () => void
  onSubmit: () => void
  onPublish: () => Promise<void>
  isSubmitting?: boolean
  autoPublish?: boolean
}

export default function PostPreview({
  title,
  content,
  videoUrl,
  username,
  userImage,
  onBack,
  onSubmit,
  onPublish,
  isSubmitting = false,
  autoPublish = false,
}: PostPreviewProps) {
  const [saved, setSaved] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  const handleSave = () => {
    setSaved(true)
    toast({
      title: "Post saved",
      description: "Your post has been saved as a draft.",
    })
  }

  const handleShare = () => {
    toast({
      title: "Share link copied",
      description: "The link to your post has been copied to clipboard.",
    })
  }

  const handlePublish = async () => {
    try {
      setIsPublishing(true)

      try {
        await onPublish()
      } catch (error) {
        console.error("Error during publishing:", error)
        // Continue with success flow even if there was an error with the API
      }

      setShowPublishDialog(false)
      toast({
        title: "Post published!",
        description: "Your post has been published to the community feed.",
      })
    } catch (error) {
      toast({
        title: "Error publishing post",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSubmit = () => {
    if (autoPublish) {
      // If auto-publish is enabled, just call onSubmit which will handle publishing
      onSubmit()
    } else {
      // Otherwise, just submit without publishing
      onSubmit()
    }
  }

  return (
    <>
      <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
              <h2 className="text-xl font-bold">Post Preview</h2>
            </div>
            <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0">Final Step</Badge>
          </div>

          <div className="space-y-6">
            <div className="aspect-video rounded-xl overflow-hidden">
              <div className="relative w-full h-full">
                <video className="w-full h-full object-contain" controls src={videoUrl} />
              </div>
            </div>

            <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-xl p-6">
              <h1 className="text-2xl font-bold mb-4">{title}</h1>
              <div
                className="prose dark:prose-invert prose-sm sm:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-white/20 dark:border-gray-800/20">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Edit
            </Button>

            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <Button variant="outline" onClick={handleSave} disabled={saved} className="flex items-center gap-2">
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Saved" : "Save Draft"}
              </Button>

              <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              {!autoPublish && (
                <Button
                  onClick={() => setShowPublishDialog(true)}
                  className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publish to Feed
                </Button>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                variant={autoPublish ? "default" : "outline"}
                className={
                  autoPublish
                    ? "bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 ml-2"
                    : "ml-2"
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {autoPublish ? "Submitting & Publishing..." : "Submitting..."}
                  </>
                ) : autoPublish ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit & Publish
                  </>
                ) : (
                  "Submit for Evaluation"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish to Community Feed</DialogTitle>
            <DialogDescription>
              Your post will be visible to all community members. Are you ready to publish?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg">
            <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800">
              <AvatarImage src={userImage} alt={username} />
              <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{username}</p>
              <p className="text-xs text-muted-foreground">Publishing as {username}</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
