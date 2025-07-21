"use client"

import { Type, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TextElement } from './types'

interface TextElementsListProps {
  textElements: TextElement[]
  selectedTextId: string | null
  onAddText: () => void
  onSelectText: (id: string) => void
  onDeleteText: (id: string) => void
}

export function TextElementsList({
  textElements,
  selectedTextId,
  onAddText,
  onSelectText,
  onDeleteText
}: TextElementsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-gray-600" />
        <h3 className="font-semibold text-sm">Text</h3>
      </div>
      
      <Button
        onClick={onAddText}
        className="w-full bg-gradient-to-r from-neo-mint to-purist-blue"
      >
        <Type className="mr-2 h-4 w-4" />
        Add Text Element
      </Button>

      {textElements.length > 0 && (
        <div className="space-y-2">
          {textElements.map((textElement) => (
            <div
              key={textElement.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedTextId === textElement.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              onClick={() => onSelectText(textElement.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm truncate font-medium">
                  {textElement.text || "Empty text"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteText(textElement.id)
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
