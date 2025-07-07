"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Home, Eye, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface PublishSuccessProps {
  postId: string
  onStartNewChallenge: () => void
}

export default function PublishSuccess({ postId, onStartNewChallenge }: PublishSuccessProps) {
  const router = useRouter()

  // Show success popup when component mounts
  useEffect(() => {
    toast({
      title: "🎉 Post Published Successfully!",
      description: "Your post is now live in the community feed with AI evaluation.",
      duration: 5000,
    })
  }, [])

  const goToHome = () => {
    // Use Next.js router for client-side navigation
    router.push("/")
  }

  const viewPostInFeed = () => {
    // Navigate to community page and scroll to the specific post
    router.push(`/community?highlight=${postId}`)
  }

  const scrollToPostInFeed = () => {
    // Use Next.js router for client-side navigation
    router.push(`/community?highlight=${postId}`)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neo-mint to-purist-blue flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Post Published Successfully!</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Your post has been published to the community feed with AI evaluation. Other members can now view, like, and comment on your content.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2" 
              onClick={goToHome}
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Button>

            <Button
              onClick={viewPostInFeed}
              variant="outline"
              className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:from-green-600 hover:to-emerald-700 text-white border-0 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Post
            </Button>

            <Button
              onClick={onStartNewChallenge}
              className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 flex items-center gap-2"
            >
              New Challenge
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
