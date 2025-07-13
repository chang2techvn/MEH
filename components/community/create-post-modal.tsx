"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { format } from "date-fns"
import {
  X,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Smile,
  MapPin,
  CalendarIcon,
  ImageIcon,
  AtSign,
  MoreHorizontal,
  Loader,
  Send,
  Paperclip,
  PlusCircle,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ImageViewer } from "@/components/ui/image-viewer"
import { toast } from "@/hooks/use-toast"
import { useAuthState } from "@/contexts/auth-context"
import type { Contact } from "./types"

interface CreatePostModalProps {
  showNewPostForm: boolean
  setShowNewPostForm: (show: boolean) => void
  newPostContent: string
  setNewPostContent: (content: string) => void
  isPostingContent: boolean
  selectedFeeling: string | null
  setSelectedFeeling: (feeling: string | null) => void
  location: string
  setLocation: (location: string) => void
  taggedPeople: string[]
  setTaggedPeople: (people: string[]) => void
  selectedDate: Date | undefined
  setSelectedDate: (date: Date | undefined) => void
  selectedMedia: File[]
  setSelectedMedia: (media: File[]) => void
  mediaPreviews: string[]
  setMediaPreviews: (previews: string[]) => void
  showEmojiPicker: boolean
  setShowEmojiPicker: (show: boolean) => void
  showLocationPicker: boolean
  setShowLocationPicker: (show: boolean) => void
  showTagPeople: boolean
  setShowTagPeople: (show: boolean) => void
  postFileInputRef: React.RefObject<HTMLInputElement>
  contacts: Contact[]
  handlePostSubmit: () => void
  handleMediaSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeSelectedMedia: (index?: number) => void
  handleFeelingSelect: (feeling: string) => void
  handleLocationSelect: (place: string) => void
  handlePersonTag: (person: string) => void
  removeTaggedPerson: (person: string) => void
}

export function CreatePostModal(props: CreatePostModalProps) {
  const { user } = useAuthState()
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const {
    showNewPostForm,
    setShowNewPostForm,
    newPostContent,
    setNewPostContent,
    isPostingContent,
    selectedFeeling,
    setSelectedFeeling,
    location,
    setLocation,
    taggedPeople,
    setTaggedPeople,
    selectedDate,
    setSelectedDate,
    selectedMedia,
    setSelectedMedia,
    mediaPreviews,
    setMediaPreviews,
    showEmojiPicker,
    setShowEmojiPicker,
    showLocationPicker,
    setShowLocationPicker,
    showTagPeople,
    setShowTagPeople,
    postFileInputRef,
    contacts,
    handlePostSubmit,
    handleMediaSelect,
    removeSelectedMedia,
    handleFeelingSelect,
    handleLocationSelect,
    handlePersonTag,
    removeTaggedPerson,
  } = props

  const resetForm = () => {
    setShowNewPostForm(false)
    setNewPostContent("")
    setSelectedFeeling(null)
    setLocation("")
    setTaggedPeople([])
    setSelectedDate(undefined)
    setSelectedMedia([])
    setMediaPreviews([])
  }

  return (
    <>
      <AnimatePresence>
      {showNewPostForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              resetForm()
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-xl border border-white/20 dark:border-gray-700/30"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
              <div className="w-8">{/* Spacer for alignment */}</div>
              <motion.h3
                className="text-base sm:text-lg font-semibold text-center gradient-text"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Create Post
              </motion.h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 h-8 w-8"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 sm:p-5">
              {/* User Info */}
              <motion.div
                className="flex items-start gap-3 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white dark:border-gray-800 shadow-md">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex flex-col">
                  <p className="font-semibold text-base sm:text-lg">{user?.name || 'User'}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 h-7 sm:h-8 text-xs rounded-full border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                      >
                        <Globe className="h-3 w-3 mr-1 text-neo-mint dark:text-purist-blue" />
                        Public
                        <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                      <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
                        <Globe className="h-4 w-4 mr-2 text-neo-mint dark:text-purist-blue" />
                        Public
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        Friends
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
                        <Lock className="h-4 w-4 mr-2 text-gray-500" />
                        Only Me
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>

              {/* Text Area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <Textarea
                  placeholder={`What's on your mind, ${user?.name?.split(' ').pop() || 'there'}?`}
                  className="min-h-[120px] sm:min-h-[150px] resize-none border-0 focus-visible:ring-1 focus-visible:ring-neo-mint dark:focus-visible:ring-purist-blue text-base sm:text-lg p-0 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:bg-transparent focus:bg-transparent"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  aria-label="Post content"
                />

                {newPostContent.length > 0 && (
                  <motion.div
                    className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {newPostContent.length} characters
                  </motion.div>
                )}
              </motion.div>

              {/* Tags Container */}
              <motion.div
                className="mt-3 flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {/* Display selected feeling */}
                {selectedFeeling && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <Smile className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-sm">Feeling {selectedFeeling}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setSelectedFeeling(null)}
                      aria-label={`Remove feeling ${selectedFeeling}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}

                {/* Display selected location */}
                {location && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-sm">at {location}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setLocation("")}
                      aria-label={`Remove location ${location}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}

                {/* Display selected date */}
                {selectedDate && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-sm">{format(selectedDate, "PPP")}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setSelectedDate(undefined)}
                      aria-label={`Remove date ${format(selectedDate, "PPP")}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}

                {/* Display tagged people */}
                {taggedPeople.map((person) => (
                  <motion.div
                    key={person}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <AtSign className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-sm">{person}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => removeTaggedPerson(person)}
                      aria-label={`Remove tag ${person}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>

              {/* Media previews */}
              <AnimatePresence>
                {mediaPreviews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="mt-4 space-y-3"
                  >
                    {/* Display in 2 rows x 3 columns for multiple images */}
                    {mediaPreviews.length === 1 ? (
                      // Single media - show normally
                      <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
                        <div className="relative aspect-video">
                          {selectedMedia[0]?.type.startsWith("video/") ? (
                            <video 
                              src={mediaPreviews[0]} 
                              className="w-full h-full object-cover" 
                              muted
                              playsInline
                            />
                          ) : (
                            <Image
                              src={mediaPreviews[0]}
                              alt="Media preview"
                              width={400}
                              height={300}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedMedia(0)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {selectedMedia[0]?.type.startsWith("video/") && (
                            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                              Video
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Multiple images - 2 rows x 3 columns layout
                      <div className="grid grid-cols-3 grid-rows-2 gap-2 max-h-80">
                        {mediaPreviews.slice(0, 5).map((preview, index) => (
                          <div 
                            key={index} 
                            className={`relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 ${
                              index === 0 ? 'row-span-2' : '' // First image spans 2 rows
                            }`}
                          >                          <div className="relative h-full">
                            <Image
                              src={preview}
                              alt={`Image preview ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => {
                                setImageViewerIndex(index)
                                setImageViewerOpen(true)
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelectedMedia(index)}
                              className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full bg-black/50 hover:bg-black/70 text-white"
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </div>
                          </div>
                        ))}
                        
                        {/* Show "+X more" overlay if there are more than 5 images */}
                        {mediaPreviews.length > 5 && (
                          <div 
                            className="relative bg-black/60 rounded-xl flex flex-col items-center justify-center text-white font-semibold cursor-pointer hover:bg-black/70 transition-colors"
                            onClick={() => {
                              setImageViewerIndex(5)
                              setImageViewerOpen(true)
                            }}
                          >
                            <span className="text-lg font-bold">+{mediaPreviews.length - 5}</span>
                            <span className="text-xs">more</span>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedMedia.length > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        {selectedMedia.some(file => file.type.startsWith("video/")) 
                          ? `1 video selected` 
                          : `${selectedMedia.length}/10 images selected`
                        }
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add to post section */}
              <motion.div
                className="mt-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm sm:text-base">Add to your post</h4>
                  <div className="flex gap-1 sm:gap-2">
                    {/* Photo/Video Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                            onClick={() => postFileInputRef.current?.click()}
                            aria-label="Add photo or video"
                          >
                            <ImageIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-green-500" />
                            <input
                              type="file"
                              ref={postFileInputRef}
                              accept="image/*,video/*"
                              multiple
                              className="hidden"
                              onChange={handleMediaSelect}
                              aria-hidden="true"
                            />
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <p>Photos (up to 10) or 1 Video</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Tag People Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Popover open={showTagPeople} onOpenChange={setShowTagPeople}>
                            <PopoverTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                aria-label="Tag people"
                              >
                                <Users className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-blue-500" />
                              </motion.button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[220px] p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                              align="end"
                            >
                              <Command>
                                <CommandInput placeholder="Search people..." className="border-none focus:ring-0" />
                                <CommandList>
                                  <CommandEmpty>No people found.</CommandEmpty>
                                  <CommandGroup heading="Suggestions">
                                    {contacts.map((contact) => (
                                      <CommandItem
                                        key={contact.id}
                                        onSelect={() => handlePersonTag(contact.name)}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={contact.image || "/placeholder.svg"} />
                                          <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <span>{contact.name}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <p>Tag People</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Feeling/Activity Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                aria-label="Add feeling or activity"
                              >
                                <Smile className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-yellow-500" />
                              </motion.button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[220px] p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                              align="end"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search feelings..."
                                  className="border-none focus:ring-0"
                                />
                                <CommandList>
                                  <CommandEmpty>No feelings found.</CommandEmpty>
                                  <CommandGroup heading="Feelings">
                                    {[
                                      "Happy",
                                      "Excited",
                                      "Loved",
                                      "Sad",
                                      "Thankful",
                                      "Blessed",
                                      "Grateful",
                                      "Motivated",
                                      "Inspired",
                                    ].map((feeling) => (
                                      <CommandItem
                                        key={feeling}
                                        onSelect={() => handleFeelingSelect(feeling.toLowerCase())}
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 flex items-center justify-center">
                                            {feeling === "Happy" && "😊"}
                                            {feeling === "Excited" && "🎉"}
                                            {feeling === "Loved" && "❤️"}
                                            {feeling === "Sad" && "😢"}
                                            {feeling === "Thankful" && "🙏"}
                                            {feeling === "Blessed" && "✨"}
                                            {feeling === "Grateful" && "🌟"}
                                            {feeling === "Motivated" && "💪"}
                                            {feeling === "Inspired" && "💡"}
                                          </div>
                                          <span>{feeling}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <p>Feeling/Activity</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Check in Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Popover open={showLocationPicker} onOpenChange={setShowLocationPicker}>
                            <PopoverTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                aria-label="Check in location"
                              >
                                <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-red-500" />
                              </motion.button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[220px] p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                              align="end"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search locations..."
                                  className="border-none focus:ring-0"
                                />
                                <CommandList>
                                  <CommandEmpty>No locations found.</CommandEmpty>
                                  <CommandGroup heading="Suggestions">
                                    {[
                                      "Coffee Shop",
                                      "Library",
                                      "University",
                                      "Home",
                                      "Work",
                                      "Gym",
                                      "Restaurant",
                                      "Park",
                                      "Airport",
                                    ].map((place) => (
                                      <CommandItem
                                        key={place}
                                        onSelect={() => handleLocationSelect(place)}
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-red-500" />
                                          <span>{place}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <p>Check in</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Calendar Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Popover>
                            <PopoverTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                aria-label="Add date"
                              >
                                <CalendarIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-purple-500" />
                              </motion.button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                              align="end"
                            >
                              <div className="p-3">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  initialFocus
                                  className="rounded-lg border-0"
                                  disabled={(date) => date < new Date("1900-01-01")}
                                  fromYear={1900}
                                  toYear={2100}
                                  classNames={{
                                    day_selected:
                                      "bg-neo-mint text-white hover:bg-neo-mint hover:text-white focus:bg-neo-mint focus:text-white",
                                    day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50",
                                    day: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                                    head_cell: "text-gray-500 dark:text-gray-400 font-normal text-xs",
                                    caption: "text-sm font-medium text-gray-900 dark:text-gray-100",
                                    nav_button:
                                      "text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400",
                                    table: "border-collapse space-y-1",
                                    cell: "p-0 relative",
                                    button: "h-9 w-9 p-0 font-normal",
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                  }}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <p>Add Date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* More Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                aria-label="More options"
                              >
                                <MoreHorizontal className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                              </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700"
                                onClick={() => {
                                  toast({
                                    title: "GIF Feature",
                                    description: "GIF selection will be available soon!",
                                  })
                                }}
                              >
                                <Gift className="h-4 w-4 mr-2 text-pink-500" />
                                Add GIF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700"
                                onClick={() => {
                                  toast({
                                    title: "File Attachment",
                                    description: "File attachment feature will be available soon!",
                                  })
                                }}
                              >
                                <Paperclip className="h-4 w-4 mr-2 text-orange-500" />
                                Attach File
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700"
                                onClick={() => {
                                  toast({
                                    title: "Poll Creation",
                                    description: "Poll creation feature will be available soon!",
                                  })
                                }}
                              >
                                <PlusCircle className="h-4 w-4 mr-2 text-blue-500" />
                                Create Poll
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <p>More</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </motion.div>

              {/* Post Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4"
              >
                <Button
                  className="w-full py-2 h-auto text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handlePostSubmit}
                  disabled={(!newPostContent.trim() && mediaPreviews.length === 0) || isPostingContent}
                  style={{
                    background: "linear-gradient(to right, hsl(var(--neo-mint)), hsl(var(--purist-blue)))",
                  }}
                >
                  {isPostingContent ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Publishing...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      <span>Publish Post</span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Image Viewer for previews */}
    <ImageViewer
      images={mediaPreviews.filter((_, index) => !selectedMedia[index]?.type.startsWith("video/"))}
      initialIndex={imageViewerIndex}
      isOpen={imageViewerOpen}
      onClose={() => setImageViewerOpen(false)}
      title="Image Preview"
    />
    </>
  )
}
