"use client"

import { ImageCropper } from "@/components/ui/image-cropper"

interface User {
  id: string
  background_url?: string
  avatar?: string
}

interface ImageCroppersManagerProps {
  // Background cropper props
  showBackgroundCropper: boolean
  selectedBackgroundFile: File | null
  onBackgroundClose: () => void
  onBackgroundCropComplete: (blob: Blob) => void
  
  // Avatar cropper props
  showAvatarCropper: boolean
  selectedAvatarFile: File | null
  onAvatarClose: () => void
  onAvatarCropComplete: (blob: Blob) => void
  
  // User data
  user: User
}

export function ImageCroppersManager({
  showBackgroundCropper,
  selectedBackgroundFile,
  onBackgroundClose,
  onBackgroundCropComplete,
  showAvatarCropper,
  selectedAvatarFile,
  onAvatarClose,
  onAvatarCropComplete,
  user
}: ImageCroppersManagerProps) {
  return (
    <>
      {/* Background Image Cropper */}
      <ImageCropper
        isOpen={showBackgroundCropper}
        onClose={() => {
          onBackgroundClose()
        }}
        onCropComplete={onBackgroundCropComplete}
        imageFile={selectedBackgroundFile}
        currentImageUrl={user?.background_url}
        aspectRatio={2.5} // Adjusted to match the actual container aspect ratio (wider than 16:9)
        title="Crop Background Image"
      />

      {/* Avatar Image Cropper */}
      <ImageCropper
        isOpen={showAvatarCropper}
        onClose={() => {
          onAvatarClose()
        }}
        onCropComplete={onAvatarCropComplete}
        imageFile={selectedAvatarFile}
        currentImageUrl={user?.avatar}
        aspectRatio={1} // Square aspect ratio for avatar
        title="Crop Profile Picture"
      />
    </>
  )
}
