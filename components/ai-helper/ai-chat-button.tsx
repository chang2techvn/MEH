"use client"

import { useState, useRef, useEffect } from "react"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChatBox } from "@/components/ai-helper/ai-chat-box"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const pathname = usePathname()

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Don't render if not on home page or on mobile
  if (pathname !== "/" || isMobile) {
    return null
  }

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
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg border-0 z-40 transition-transform overflow-hidden p-0"
        style={{
          backgroundImage: `url('https://sdmntprukwest.oaiusercontent.com/files/00000000-6178-6243-a963-6830a6c5e8c2/raw?se=2025-07-28T23%3A23%3A17Z&sp=r&sv=2024-08-04&sr=b&scid=b32de84c-687b-5e0e-934d-3f0f487f65cc&skoid=04233560-0ad7-493e-8bf0-1347c317d021&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A07%3A47Z&ske=2025-07-29T19%3A07%3A47Z&sks=b&skv=2024-08-04&sig=RDvWMG8dCr2Yeg6CtLJEmMHPt8ZyNu5QwE5jLoPbZnQ%3D')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
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