"use client"

import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { fontFamilies, colorPalette } from './constants'
import type { TextElement } from './types'

interface TextEditorProps {
  textElement: TextElement
  onUpdate: (updates: Partial<TextElement>) => void
  onDelete: () => void
}

export function TextEditor({ textElement, onUpdate, onDelete }: TextEditorProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <h4 className="font-medium text-sm">Edit Text</h4>
      
      {/* Text Content */}
      <Textarea
        value={textElement.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Enter your text..."
        className="min-h-[60px] resize-none"
      />

      {/* Font Controls Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Font</label>
          <select
            value={textElement.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font}>
                {font.split(',')[0]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Size: {textElement.fontSize}px</label>
          <Slider
            value={[textElement.fontSize]}
            onValueChange={([value]) => onUpdate({ fontSize: value })}
            min={12}
            max={72}
            step={2}
            className="w-full"
          />
        </div>
      </div>

      {/* Style Controls */}
      <div className="flex justify-between">
        <div className="flex gap-1">
          <Button
            variant={textElement.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate({ 
              fontWeight: textElement.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant={textElement.fontStyle === 'italic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate({ 
              fontStyle: textElement.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
          >
            <Italic className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant={textElement.textAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate({ textAlign: 'left' })}
          >
            <AlignLeft className="h-3 w-3" />
          </Button>
          <Button
            variant={textElement.textAlign === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate({ textAlign: 'center' })}
          >
            <AlignCenter className="h-3 w-3" />
          </Button>
          <Button
            variant={textElement.textAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate({ textAlign: 'right' })}
          >
            <AlignRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Text Color</label>
          <div className="flex gap-1 flex-wrap">
            {colorPalette.slice(0, 8).map((color) => (
              <button
                key={color}
                onClick={() => onUpdate({ color })}
                className={`w-6 h-6 rounded-full border-2 ${
                  textElement.color === color ? 'border-gray-400 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Background</label>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => onUpdate({ backgroundColor: 'transparent' })}
              className={`w-6 h-6 rounded-full border-2 bg-gradient-to-br from-white to-gray-100 flex items-center justify-center ${
                textElement.backgroundColor === 'transparent' ? 'border-gray-400 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
            {colorPalette.slice(0, 7).map((color) => (
              <button
                key={color}
                onClick={() => onUpdate({ backgroundColor: color })}
                className={`w-6 h-6 rounded-full border-2 ${
                  textElement.backgroundColor === color ? 'border-gray-400 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="w-full"
      >
        Delete Text
      </Button>
    </div>
  )
}
