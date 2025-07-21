"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ImageIcon, Smile } from "lucide-react"
import { useAuthState } from "@/contexts/auth-context"

interface CreatePostCardProps {
  setShowNewPostForm: (show: boolean) => void
  setShowEmojiPicker: (show: boolean) => void
  postFileInputRef: React.RefObject<HTMLInputElement>
}

export function CreatePostCard({
  setShowNewPostForm,
  setShowEmojiPicker,
  postFileInputRef,
}: CreatePostCardProps) {
  const { user } = useAuthState()
  const router = useRouter()

  const handlePostAction = (action?: () => void) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    setShowNewPostForm(true)
    if (action) {
      action()
    }
  }
  
  return (
    <Card className="mb-4 bg-white dark:bg-gray-800 shadow-sm border-0 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="flex-1 justify-start text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-0 rounded-full h-9 sm:h-10 text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handlePostAction()}
          >
            What&apos;s on your mind, {user?.name?.split(' ').pop() || 'there'}?
          </Button>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            className="flex-1 text-xs sm:text-sm p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => handlePostAction(() => {
              setTimeout(() => {
                postFileInputRef.current?.click()
              }, 500)
            })}
          >
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-green-500" />
            <span>Photo/Video</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-xs sm:text-sm p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => handlePostAction(() => {
              setTimeout(() => {
                setShowEmojiPicker(true)
              }, 500)
            })}
          >
            <Smile className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-yellow-500" />
            <span>Feeling</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
