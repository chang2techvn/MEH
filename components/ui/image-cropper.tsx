"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { ZoomIn, ZoomOut, RotateCw, Move } from 'lucide-react'

interface ImageCropperProps {
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedImageBlob: Blob) => void
  imageFile: File | null
  currentImageUrl?: string // URL of current background image
  aspectRatio?: number
  cropShape?: 'rect' | 'round'
  title?: string
}

export function ImageCropper({
  isOpen,
  onClose,
  onCropComplete,
  imageFile,
  currentImageUrl,
  aspectRatio = 16 / 9, // Default to 16:9 for background images
  cropShape = 'rect',
  title = 'Crop Image'
}: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState('')
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isEditingCurrent, setIsEditingCurrent] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fixed crop area dimensions based on aspect ratio
  const cropWidth = 600 // Fixed width for preview
  const cropHeight = cropWidth / aspectRatio

  // Load image when file changes or current image URL is provided
  useEffect(() => {
    if (imageFile) {
      // Load new file
      setIsEditingCurrent(false)
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
        // Reset transform
        setScale(1)
        setPosition({ x: 0, y: 0 })
      })
      reader.readAsDataURL(imageFile)
    } else if (currentImageUrl && !imageFile) {
      // Load current background image
      setIsEditingCurrent(true)
      setImgSrc(currentImageUrl)
      // Reset transform
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [imageFile, currentImageUrl])

  // Auto-fit image when loaded
  const handleImageLoad = useCallback(() => {
    if (!imgRef.current) return
    
    const img = imgRef.current
    const imgAspect = img.naturalWidth / img.naturalHeight
    const cropAspect = aspectRatio

    // Calculate scale to fit image in crop area (showing full image by default)
    let newScale = 1
    if (imgAspect > cropAspect) {
      // Image is wider than crop area
      newScale = cropHeight / img.naturalHeight
    } else {
      // Image is taller than crop area
      newScale = cropWidth / img.naturalWidth
    }
    
    setScale(newScale)
    setPosition({ x: 0, y: 0 })
  }, [aspectRatio, cropWidth, cropHeight])

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    handleImageLoad()
  }

  // Generate cropped image - handle both file and URL sources
  const getCroppedImage = useCallback(async () => {
    if (!imgRef.current || !canvasRef.current) return

    const img = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to desired output size
    canvas.width = cropWidth
    canvas.height = cropHeight

    // For URL images, we need to handle CORS
    if (isEditingCurrent && currentImageUrl) {
      // Create a new image element to ensure proper loading
      const sourceImg = new Image()
      sourceImg.crossOrigin = 'anonymous'
      
      return new Promise<Blob>((resolve, reject) => {
        sourceImg.onload = () => {
          // Calculate the source rectangle on the original image
          const scaleRatio = sourceImg.naturalWidth / (img.width * scale)
          const sourceX = (-position.x) * scaleRatio
          const sourceY = (-position.y) * scaleRatio
          const sourceWidth = cropWidth * scaleRatio
          const sourceHeight = cropHeight * scaleRatio

          // Draw the cropped portion
          ctx.drawImage(
            sourceImg,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            cropWidth,
            cropHeight
          )

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          }, 'image/jpeg', 0.9)
        }
        
        sourceImg.onerror = () => reject(new Error('Failed to load image'))
        sourceImg.src = currentImageUrl
      })
    } else {
      // Handle file-based images (original logic)
      const scaleRatio = img.naturalWidth / (img.width * scale)
      const sourceX = (-position.x) * scaleRatio
      const sourceY = (-position.y) * scaleRatio
      const sourceWidth = cropWidth * scaleRatio
      const sourceHeight = cropHeight * scaleRatio

      // Draw the cropped portion
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        cropWidth,
        cropHeight
      )

      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          }
        }, 'image/jpeg', 0.9)
      })
    }
  }, [scale, position, cropWidth, cropHeight, isEditingCurrent, currentImageUrl])

  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImage()
      if (croppedBlob) {
        onCropComplete(croppedBlob)
        onClose()
      }
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }

  const handleCancel = () => {
    setImgSrc('')
    setScale(1)  
    setPosition({ x: 0, y: 0 })
    setIsEditingCurrent(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditingCurrent ? 'Edit Current Background' : title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditingCurrent 
              ? 'Adjust your current background image position and zoom'
              : 'Drag to move the image, use zoom controls to adjust size'
            }
          </p>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {imgSrc && (
            <>
              {/* Crop Controls */}
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.1}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <div className="w-px h-6 bg-border mx-2" />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Move className="w-3 h-3" />
                  <span>Drag to move</span>
                </div>
              </div>

              {/* Crop Preview */}
              <div 
                ref={containerRef}
                className="relative border-2 border-dashed border-primary/50 bg-muted/20"
                style={{ 
                  width: cropWidth, 
                  height: cropHeight,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Crop preview"
                    onLoad={handleImageLoad}
                    className="absolute pointer-events-none select-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                      transformOrigin: '0 0',
                      maxWidth: 'none',
                      width: 'auto',
                      height: 'auto'
                    }}
                    draggable={false}
                  />
                </div>
                
                {/* Crop frame overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full border-2 border-white/50 shadow-lg">
                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                  </div>
                </div>
              </div>

              {/* Aspect ratio info */}
              <p className="text-xs text-muted-foreground">
                Crop size: {cropWidth} × {cropHeight} pixels (Aspect ratio: {aspectRatio.toFixed(2)}:1)
              </p>
            </>
          )}
          
          {/* Hidden canvas for processing */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleCropComplete}
            disabled={!imgSrc}
          >
            {isEditingCurrent ? 'Save Changes' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
