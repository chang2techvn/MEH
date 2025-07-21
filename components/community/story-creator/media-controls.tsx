"use client"

import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MediaTransform } from './types'

interface MediaControlsProps {
  mediaTransform: MediaTransform
  onUpdateTransform: (transform: Partial<MediaTransform>) => void
  onReset: () => void
  onDelete: () => void
}

export function MediaControls({
  mediaTransform,
  onUpdateTransform,
  onReset,
  onDelete
}: MediaControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Scale Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
        <div className="text-white text-xs font-medium mb-2 text-center">Scale</div>
        <div className="flex flex-col items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdateTransform({ scale: Math.min(3, mediaTransform.scale + 0.1) })}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          
          <div className="text-white text-xs font-mono bg-black/30 px-1 py-0.5 rounded-full min-w-[35px] text-center">
            {Math.round(mediaTransform.scale * 100)}%
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdateTransform({ scale: Math.max(0.5, mediaTransform.scale - 0.1) })}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Rotation Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
        <div className="text-white text-xs font-medium mb-2 text-center">Rotate</div>
        <div className="flex flex-col items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdateTransform({ rotation: mediaTransform.rotation + 15 })}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
          >
            <RotateCcw className="h-3 w-3 transform rotate-180" />
          </Button>
          
          <div className="text-white text-xs font-mono bg-black/30 px-1 py-0.5 rounded-full min-w-[35px] text-center">
            {mediaTransform.rotation}°
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdateTransform({ rotation: mediaTransform.rotation - 15 })}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 p-0"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onReset}
        className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-md text-xs px-2 py-1 h-8"
      >
        Reset
      </Button>

      {/* Delete Media Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-400/30 rounded-lg backdrop-blur-md text-xs px-2 py-1 h-8"
      >
        Delete
      </Button>
    </div>
  )
}
