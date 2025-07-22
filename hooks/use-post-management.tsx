"use client"

import { useState, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import { uploadVideo, uploadImage, formatFileSize } from "@/lib/file-upload"
import { dbHelpers } from "@/lib/supabase"
import type { Post } from "@/components/community"

export function usePostManagement() {
  // Post creation state
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [isPostingContent, setIsPostingContent] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [location, setLocation] = useState<string>("")
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTagPeople, setShowTagPeople] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [taggedPeople, setTaggedPeople] = useState<string[]>([])
  const postFileInputRef = useRef<HTMLInputElement>(null!)

  // Feed state
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Handle media selection for posts
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Separate images and videos
    const imageFiles = files.filter(file => file.type.startsWith("image/"))
    const videoFiles = files.filter(file => file.type.startsWith("video/"))
    
    // Check if trying to upload multiple videos
    if (videoFiles.length > 1) {
      toast({
        title: "Multiple videos not allowed",
        description: "You can only upload one video per post",
        variant: "destructive",
      })
      return
    }
    
    // Check if trying to mix video with other files
    if (videoFiles.length > 0 && (imageFiles.length > 0 || selectedMedia.length > 0)) {
      toast({
        title: "Cannot mix videos with other files",
        description: "Please upload either one video OR multiple images, not both",
        variant: "destructive",
      })
      return
    }
    
    // Check if already have video and trying to add more files
    const hasExistingVideo = selectedMedia.some(file => file.type.startsWith("video/"))
    if (hasExistingVideo && files.length > 0) {
      toast({
        title: "Cannot add more files",
        description: "You already have a video. Remove it first to add other files",
        variant: "destructive",
      })
      return
    }

    // Combine with existing files
    const allFiles = [...selectedMedia, ...files]
    
    // Check file limits - max 10 images or 1 video
    if (imageFiles.length > 0 && allFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 10 images per post",
        variant: "destructive",
      })
      return
    }

    const validFiles: File[] = []
    const previews: string[] = [...mediaPreviews]

    for (const file of files) {
      // Check file size limits
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")
      
      if (isVideo && file.size > 100 * 1024 * 1024) { // 100MB for videos
        toast({
          title: "Video file too large",
          description: `${file.name} is larger than 100MB`,
          variant: "destructive",
        })
        continue
      }
      
      if (isImage && file.size > 10 * 1024 * 1024) { // 10MB for images
        toast({
          title: "Image file too large", 
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        })
        continue
      }

      // Check file type
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image or video file`,
          variant: "destructive",
        })
        continue
      }

      validFiles.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        previews.push(event.target?.result as string)
        if (previews.length === validFiles.length + mediaPreviews.length) {
          setMediaPreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    }

    if (validFiles.length > 0) {
      setSelectedMedia([...selectedMedia, ...validFiles])

      console.log("📁 Media files selected:", validFiles.map(f => ({
        name: f.name,
        size: formatFileSize(f.size),
        type: f.type
      })))

      toast({
        title: "Media selected",
        description: `${validFiles.length} file(s) added to your post.`,
      })

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  // Remove selected media
  const removeSelectedMedia = (index?: number) => {
    if (index !== undefined) {
      // Remove specific file
      const newMedia = selectedMedia.filter((_, i) => i !== index)
      const newPreviews = mediaPreviews.filter((_, i) => i !== index)
      setSelectedMedia(newMedia)
      setMediaPreviews(newPreviews)
    } else {
      // Remove all files
      setSelectedMedia([])
      setMediaPreviews([])
    }
  }

  // Handle feeling selection
  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling)
    setShowEmojiPicker(false)
  }

  // Handle location selection
  const handleLocationSelect = (place: string) => {
    setLocation(place)
    setShowLocationPicker(false)
  }

  // Handle person tagging
  const handlePersonTag = (person: string) => {
    if (!taggedPeople.includes(person)) {
      setTaggedPeople([...taggedPeople, person])
    }
    setShowTagPeople(false)
  }

  // Remove a tagged person
  const removeTaggedPerson = (person: string) => {
    setTaggedPeople(taggedPeople.filter((p) => p !== person))
  }

  // Handle post submission
  const handlePostSubmit = async () => {
    console.log("🚀 handlePostSubmit called")
    console.log("📝 newPostContent:", newPostContent)
    console.log("🖼️ mediaPreviews:", mediaPreviews)
    
    if (!newPostContent.trim() && mediaPreviews.length === 0) {
      console.log("❌ No content or media, returning early")
      return
    }

    console.log("🔄 Setting isPostingContent to true")
    setIsPostingContent(true)

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }

    try {
      console.log("👤 Getting current user...")
      // Get current user
      const currentUser = await dbHelpers.getCurrentUser()
      console.log("👤 Current user:", currentUser)
      
      if (!currentUser) {
        console.log("❌ No current user found")
        toast({
          title: "Authentication required",
          description: "Please log in to create a post.",
          variant: "destructive",
        })
        setIsPostingContent(false)
        return
      }

      // Prepare post content - CHỈ dùng nội dung chính, không thêm feeling, location, etc.
      let fullContent = newPostContent.trim()

      console.log("📝 Clean content:", fullContent)

      // Determine post type and upload media if present
      let postType = 'text'
      let uploadedMediaUrls: string[] = []

      if (selectedMedia.length > 0) {
        console.log("📁 Uploading media files...", selectedMedia.length)
        
        try {
          for (const file of selectedMedia) {
            const isVideo = file.type.startsWith("video/")
            
            console.log(`📤 Uploading ${isVideo ? 'video' : 'image'}: ${file.name}`)
            
            let uploadedUrl: string
            if (isVideo) {
              const result = await uploadVideo(file)
              uploadedUrl = typeof result === 'string' ? result : (result.url || '')
              postType = 'video'
            } else {
              const result = await uploadImage(file)
              uploadedUrl = typeof result === 'string' ? result : (result.url || '')
              postType = postType === 'video' ? 'video' : 'image' // Keep video if already set
            }
            
            uploadedMediaUrls.push(uploadedUrl)
            console.log(`✅ Uploaded successfully: ${uploadedUrl}`)
          }
        } catch (uploadError: any) {
          console.error("❌ Media upload error:", uploadError)
          toast({
            title: "Upload failed",
            description: uploadError.message || "Failed to upload media files. Please try again.",
            variant: "destructive",
          })
          setIsPostingContent(false)
          return
        }
      }

      console.log("📄 Post type:", postType)
      console.log("📤 Creating post in Supabase...")

      // Create post in Supabase with media URLs
      const postData: any = {
        title: fullContent.substring(0, 100), // Use first 100 chars as title
        content: fullContent,
        user_id: currentUser.id,
        post_type: postType,
        tags: [] // Could extract hashtags from content
      }

      // Handle media URLs - use new media_urls column for multiple files
      if (uploadedMediaUrls.length > 1) {
        // Multiple files: use media_urls array
        postData.media_urls = uploadedMediaUrls
        postData.media_url = uploadedMediaUrls[0] // Keep first one for backward compatibility
      } else if (uploadedMediaUrls.length === 1) {
        // Single file: use traditional media_url
        postData.media_url = uploadedMediaUrls[0]
      }

      const { data: newPost, error } = await dbHelpers.createPost(postData)
      
      console.log("📤 Supabase response - data:", newPost)
      console.log("📤 Supabase response - error:", error)
      
      if (error || !newPost) {
        console.log("❌ Error creating post:", error)
        toast({
          title: "Error creating post",
          description: "There was an error publishing your post. Please try again.",
          variant: "destructive",
        })
        setIsPostingContent(false)
        return
      }      

      console.log("✅ Post created successfully!")
      
      // Add the new post to the feed với thông tin chính xác từ currentUser
      const newPostForFeed = {
        id: newPost.id,
        username: currentUser.name || "Anonymous User", // Từ currentUser
        userImage: currentUser.avatar || "/placeholder.svg?height=40&width=40", // Từ currentUser
        timeAgo: "Just now",
        content: fullContent,
        mediaType: (postType === 'video' ? 'video' : postType === 'image' ? 'image' : 'text') as "video" | "text" | "none" | "ai-submission" | "youtube" | "image",
        mediaUrl: uploadedMediaUrls[0], // First media URL for backward compatibility
        mediaUrls: uploadedMediaUrls, // All media URLs for multiple media support
        youtubeVideoId: undefined,
        textContent: postType === 'text' && uploadedMediaUrls.length === 0 ? fullContent : undefined,
        likes: 0,
        comments: 0,
        title: newPost.title,
        submission: undefined, // Không có AI evaluation cho post thường
        videoEvaluation: undefined, // Không có AI evaluation cho post thường
        isNew: true,
      }

      console.log("🔄 Adding new post to feed...")
      setFeedPosts([newPostForFeed, ...feedPosts])
      
      // Tự động remove "New Post" badge sau 30 giây
      setTimeout(() => {
        setFeedPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === newPost.id ? { ...post, isNew: false } : post
          )
        )
      }, 30000) // 30 seconds
      
      console.log("🧹 Resetting form...")
      // Reset form
      setNewPostContent("")
      setSelectedMedia([])
      setMediaPreviews([])
      setIsPostingContent(false)
      setShowNewPostForm(false)
      setSelectedFeeling(null)
      setLocation("")
      setTaggedPeople([])
      setSelectedDate(undefined)

      console.log("✅ Post published successfully!")
      toast({
        title: "Post published!",
        description: "Your post has been published to the community feed.",
      })

      // Scroll to the top of the feed to see the new post
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }, 300)
    } catch (error) {
      console.log("💥 Catch block error:", error)
      toast({
        title: "Error creating post",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive",
      })
      setIsPostingContent(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters)
  }

  return {
    // Post creation state
    showNewPostForm,
    setShowNewPostForm,
    newPostContent,
    setNewPostContent,
    isPostingContent,
    setIsPostingContent,
    selectedDate,
    setSelectedDate,
    location,
    setLocation,
    showLocationPicker,
    setShowLocationPicker,
    showEmojiPicker,
    setShowEmojiPicker,
    showTagPeople,
    setShowTagPeople,
    selectedFeeling,
    setSelectedFeeling,
    selectedMedia,
    setSelectedMedia,
    mediaPreviews,
    setMediaPreviews,
    taggedPeople,
    setTaggedPeople,
    postFileInputRef,
    
    // Feed state
    feedPosts,
    setFeedPosts,
    activeFilters,
    setActiveFilters,

    // Functions
    handleMediaSelect,
    removeSelectedMedia,
    handleFeelingSelect,
    handleLocationSelect,
    handlePersonTag,
    removeTaggedPerson,
    handlePostSubmit,
    handleFilterChange,
  }
}
