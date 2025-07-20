"use client"

import { useState, useRef, useEffect } from "react"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChatBox } from "@/components/ai-helper/ai-chat-box"

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })

  // Update button position when window is resized
  useEffect(() => {
    const updateButtonPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setButtonPosition({
          x: rect.left,
          y: rect.top,
        })
      }
    }

    updateButtonPosition()
    window.addEventListener("resize", updateButtonPosition)
    return () => window.removeEventListener("resize", updateButtonPosition)
  }, [])

  const handleClick = () => {
    console.log('Chat button clicked, current isOpen:', isOpen)
    
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
      
      // Update position when button is clicked
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setButtonPosition({
          x: rect.left,
          y: rect.top,
        })
      }
    }
  }

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={handleClick}
        size="icon"
        variant="outline"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-white shadow-lg border-0 z-40 hover:scale-105 transition-transform"
      >
        <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      {isOpen && (
        <AIChatBox
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsMinimized(true)}
          buttonPosition={buttonPosition}
        />
      )}
    </>
  )
}