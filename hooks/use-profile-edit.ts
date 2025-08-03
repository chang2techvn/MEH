import { useState, useEffect } from 'react'
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface EditProfile {
  name: string
  bio: string
  location: string
  role?: string
  major?: string
  class_name?: string
  academic_year?: string
  student_id?: string
}

interface UseProfileEditProps {
  user: any
  updateUser?: (updates: any) => void
  refreshUser?: () => Promise<void>
}

export function useProfileEdit({ user, updateUser, refreshUser }: UseProfileEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editProfile, setEditProfile] = useState<EditProfile>({
    name: '',
    bio: '',
    location: ''
  })

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditProfile({
        name: user.name || '',
        bio: user.bio || '',
        location: '',
        role: user.role || '',
        major: user.major || '',
        class_name: user.className || '', // Map className to class_name for database
        academic_year: user.academicYear || '',
        student_id: user.studentId || ''
      })
    }
  }, [user])

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return

    try {      
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          full_name: editProfile.name,
          bio: editProfile.bio,
          role: editProfile.role,
          major: editProfile.major,
          class_name: editProfile.class_name,
          academic_year: editProfile.academic_year,
          student_id: editProfile.student_id
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      // Update user context with new data
      if (updateUser) {
        updateUser({
          name: editProfile.name,
          bio: editProfile.bio,
          role: editProfile.role,
          major: editProfile.major,
          // Map database fields to user object properties
          academicYear: editProfile.academic_year,
          studentId: editProfile.student_id,
          className: editProfile.class_name
        })
      }

      // Refresh user data to ensure consistency
      if (refreshUser) {
        await refreshUser()
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully.",
        variant: "default"
      })

      setIsEditing(false)

    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  // Handle share profile
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Profile`,
          text: `Check out ${user?.name}'s English learning journey!`,
          url: profileUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl)
        toast({
          title: "Link copied!",
          description: "Profile link copied to clipboard",
          variant: "default"
        })
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form to current user data
    setEditProfile({
      name: user.name || '',
      bio: user.bio || '',
      location: '',
      role: user.role || '',
      major: user.major || '',
      class_name: user.className || '', // Map className to class_name for database
      academic_year: user.academicYear || '',
      student_id: user.studentId || ''
    })
  }

  return {
    isEditing,
    setIsEditing,
    editProfile,
    setEditProfile,
    handleProfileUpdate,
    handleShareProfile,
    handleCancelEdit
  }
}
