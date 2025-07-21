"use client"

import { Palette } from "lucide-react"
import { backgroundOptions } from './constants'

interface BackgroundSelectorProps {
  backgroundColor: string
  backgroundImage: string | null
  onBackgroundChange: (color: string) => void
  onBackgroundImageChange: (image: string | null) => void
}

export function BackgroundSelector({
  backgroundColor,
  backgroundImage,
  onBackgroundChange,
  onBackgroundImageChange
}: BackgroundSelectorProps) {
  const handleBackgroundSelect = (value: string) => {
    onBackgroundChange(value)
    onBackgroundImageChange(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-gray-600" />
        <h3 className="font-semibold text-sm">Background</h3>
      </div>
      
      {/* Solid Colors */}
      <div className="grid grid-cols-6 gap-2">
        {backgroundOptions.filter(bg => bg.type === 'color').map((bg) => (
          <button
            key={bg.id}
            onClick={() => handleBackgroundSelect(bg.value)}
            className={`w-full h-10 rounded-lg border-2 transition-all ${
              backgroundColor === bg.value && !backgroundImage 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ backgroundColor: bg.value }}
            title={bg.name}
          />
        ))}
      </div>

      {/* Gradients */}
      <div className="grid grid-cols-6 gap-2">
        {backgroundOptions.filter(bg => bg.type === 'gradient').map((bg) => (
          <button
            key={bg.id}
            onClick={() => handleBackgroundSelect(bg.value)}
            className={`w-full h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
              backgroundColor === bg.value && !backgroundImage 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ background: bg.value }}
            title={bg.name}
          >
            <span className="text-white text-xs font-medium drop-shadow-md">
              {bg.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
