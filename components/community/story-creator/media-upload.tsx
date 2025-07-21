"use client"

import { useRef } from "react"
import { Camera, Upload, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MediaUploadProps {
  isUploading: boolean
  hasVideo: boolean
  hasMaxImages: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function MediaUpload({
  isUploading,
  hasVideo,
  hasMaxImages,
  onFileChange
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const isDisabled = isUploading || (hasVideo) || (hasMaxImages)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-gray-600" />
        <h3 className="font-semibold text-sm">Media</h3>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={onFileChange}
        className="hidden"
        multiple={false}
      />
      
      <Button
        variant="outline"
        onClick={handleUploadClick}
        disabled={isDisabled}
        className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400"
      >
        {isUploading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {!hasVideo && !hasMaxImages
              ? "Add Photo/Video" 
              : hasVideo 
                ? "Video Added" 
                : hasMaxImages 
                  ? "Image Added" 
                  : `Add Image`
            }
          </>
        )}
      </Button>

      {/* Media limits info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Videos: Max 30 seconds, up to 100MB</p>
        <p>• Images: Maximum 1 image, up to 10MB</p>
      </div>
    </div>
  )
}
