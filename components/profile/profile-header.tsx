"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Camera, Edit3, Share2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name?: string
  background_url?: string
}

interface ProfileHeaderProps {
  user: User
  isUploadingBackground: boolean
  onBackgroundUploadClick: () => void
  onBackgroundEditClick: () => void
  onShareProfile: () => void
  onBackgroundUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileHeader({
  user,
  isUploadingBackground,
  onBackgroundUploadClick,
  onBackgroundEditClick,
  onShareProfile,
  onBackgroundUpload
}: ProfileHeaderProps) {
  const router = useRouter()
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  const handleBackgroundUploadClick = () => {
    backgroundInputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-96 md:h-[450px] bg-gradient-to-r from-neo-mint/30 to-purist-blue/30 dark:from-purist-blue/20 dark:to-cassis/20 overflow-hidden mx-8 md:mx-16 lg:mx-24 xl:mx-48 2xl:mx-72 rounded-xl shadow-2xl"
    >
      {/* Background Image */}
      {user?.background_url ? (
        <img 
          src={user.background_url}
          alt="Profile background"
          className="absolute inset-0 w-full h-full object-cover object-center rounded-xl"
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          onError={(e) => console.error('Background image failed to load:', e)}
        />
      ) : (
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] bg-cover bg-center opacity-20 rounded-xl"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-xl"></div>

      <div className="absolute top-4 right-4 flex gap-2">
        {/* Upload new background */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={handleBackgroundUploadClick}
          disabled={isUploadingBackground}
          title="Upload new background"
        >
          {isUploadingBackground ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
        
        {/* Edit current background - only show if background exists */}
        {user?.background_url && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={onBackgroundEditClick}
            disabled={isUploadingBackground}
            title="Edit current background"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={onShareProfile}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={() => router.push('/settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden background input */}
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        onChange={onBackgroundUpload}
        className="hidden"
      />
    </motion.div>
  )
}
