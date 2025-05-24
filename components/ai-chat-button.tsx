"use client"

import { useState, useRef, useEffect } from "react"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChatBox } from "@/components/ai-chat-box"

interface AIChatButtonProps {
  onClick?: () => void;
}

export function AIChatButton({ onClick }: AIChatButtonProps = {}) {
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

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => {
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
          // Call the external onClick handler if provided
          if (onClick) {
            onClick()
          }
        }}
        size="icon"
        variant="outline"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-white shadow-lg border-0 z-40"
      >
        <Bot className="h-6 w-6" />
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
