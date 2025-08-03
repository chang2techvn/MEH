import { useState } from 'react'
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  avatar?: string
  background_url?: string
}

interface UseProfileUploadsProps {
  user: User | null
  updateUser?: (updates: any) => void
  refreshUser?: () => Promise<void>
}

export function useProfileUploads({ user, updateUser, refreshUser }: UseProfileUploadsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [showBackgroundCropper, setShowBackgroundCropper] = useState(false)
  const [selectedBackgroundFile, setSelectedBackgroundFile] = useState<File | null>(null)
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    // Show cropper dialog
    setSelectedAvatarFile(file)
    setShowAvatarCropper(true)
  }

  const handleAvatarCropComplete = async (croppedBlob: Blob) => {
    if (!user) return

    try {
      setIsUploading(true)

      // Delete old avatar if exists
      if (user.avatar && user.avatar.includes('supabase')) {
        const oldPath = user.avatar.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('profile')
            .remove([`${user.id}/avatar/${oldPath}`])
        }
      }

      // Upload cropped image to Supabase Storage
      const fileExt = selectedAvatarFile?.name.split('.').pop() || 'jpg'
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/avatar/${fileName}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, croppedBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Update user context
      if (updateUser) {
        updateUser({ avatar: publicUrl })
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
        variant: "default"
      })

    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setShowAvatarCropper(false)
      setSelectedAvatarFile(null)
    }
  }

  // Handle background upload
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for background
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    // Show cropper dialog
    setSelectedBackgroundFile(file)
    setShowBackgroundCropper(true)
  }

  const handleBackgroundCropComplete = async (croppedBlob: Blob) => {
    if (!user) return

    try {
      setIsUploadingBackground(true)

      // Delete old background if exists
      if (user.background_url && user.background_url.includes('supabase')) {
        const oldPath = user.background_url.split('/').slice(-3).join('/') // Get user_id/background/filename
        await supabase.storage
          .from('profile')
          .remove([oldPath])
      }

      // Upload cropped image to Supabase Storage
      const fileExt = selectedBackgroundFile?.name.split('.').pop() || 'jpg'
      const fileName = `background-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/background/${fileName}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, croppedBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(filePath)

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ background_url: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Refresh user data from database
      if (refreshUser) {
        await refreshUser()
      }

      toast({
        title: "Success",
        description: "Background image updated successfully!",
        variant: "default"
      })

    } catch (error) {
      console.error('Error uploading background:', error)
      toast({
        title: "Upload failed",
        description: "Failed to update background image",
        variant: "destructive"
      })
    } finally {
      setIsUploadingBackground(false)
      setShowBackgroundCropper(false)
      setSelectedBackgroundFile(null)
    }
  }

  return {
    // States
    isUploading,
    isUploadingBackground,
    showBackgroundCropper,
    selectedBackgroundFile,
    showAvatarCropper,
    selectedAvatarFile,
    
    // Handlers
    handleAvatarUpload,
    handleAvatarCropComplete,
    handleBackgroundUpload,
    handleBackgroundCropComplete,
    
    // State setters for external control
    setShowBackgroundCropper,
    setSelectedBackgroundFile,
    setShowAvatarCropper,
    setSelectedAvatarFile
  }
}
