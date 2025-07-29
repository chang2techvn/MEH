"use client"

import { useState, useRef, useEffect } from "react"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChatBox } from "@/components/ai-helper/ai-chat-box"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const pathname = usePathname()
  
  // States for message bubble
  const [showMessage, setShowMessage] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  
  const messages = [
    "Hi there! I'm Hani",
    "✏️ Use new words in a sentence — 💡 helps you remember them!",
    "📺 Watch cartoons in English — 💡 makes learning fun!",
    "🏷️ Label things in your room — 💡 builds daily vocab!",
    "📓 Keep an English diary — 💡 improves writing skills!",
    "📌 Learn phrases, not just words — 💡 sounds more natural!",
    "🧠 Think in English sometimes — 💡 trains your brain!",
    "💬 Speak even with mistakes — 💡 builds confidence!",
    "🗣️ Read out loud daily — 💡 boosts pronunciation!",
    "🎬 Repeat lines from movies — 💡 improves fluency!",
    "🃏 Use flashcards — 💡 quick memorization!",
    "👫 Practice with a friend — 💡 makes learning social!",
    "📱 Set your phone to English — 💡 full immersion!",
    "🎧 Sing along with songs — 💡 improves listening!",
    "✉️ Write short messages — 💡 sharpens grammar!",
    "🌐 Follow English pages — 💡 learn daily from context!",
    "🚫 Don’t translate in your head — 💡 think faster!",
    "🔍 Guess word meanings — 💡 strengthens comprehension!",
    "🎯 Set tiny goals — 💡 keeps you consistent!",
    "📲 Use learning apps — 💡 makes practice easy!",
    "👤 Shadow native speakers — 💡 matches real speech!",
    "❓ Ask questions in English — 💡 builds curiosity!",
    "📹 Watch short videos — 💡 bite-sized learning!",
    "🎲 Play word games — 💡 fun way to review!",
    "🛍️ Use English in daily life — 💡 real-world practice!",
    "📝 Review your mistakes — 💡 helps you improve!",
    "🎉 Make it fun — 💡 you’ll want to keep going!",
    "🎙️ Record your voice — 💡 track progress!",
    "🗨️ Talk to yourself — 💡 practice anytime!",
    "😊 Smile and speak clearly — 💡 boosts confidence!",
    "⏳ Be patient — 💡 progress takes time!"
  ]

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

  // Show message bubble with typing effect and random message rotation
  useEffect(() => {
    let messageTimer: NodeJS.Timeout
    let typingInterval: NodeJS.Timeout
    let hideTimer: NodeJS.Timeout
    let nextMessageTimer: NodeJS.Timeout

    const showNextMessage = () => {
      const currentMessage = messages[currentMessageIndex]
      
      setShowMessage(true)
      setIsTyping(true)
      setTypedText("")
      
      // Typing effect
      let currentCharIndex = 0
      typingInterval = setInterval(() => {
        if (currentCharIndex <= currentMessage.length) {
          setTypedText(currentMessage.slice(0, currentCharIndex))
          currentCharIndex++
        } else {
          setIsTyping(false)
          clearInterval(typingInterval)
          
          // Hide message after it's fully typed (5 seconds)
          hideTimer = setTimeout(() => {
            setShowMessage(false)
            setTypedText("")
            
            // Schedule next message after 30-60 seconds
            const nextDelay = Math.random() * 10000 + 5000 // 20-35 seconds
            nextMessageTimer = setTimeout(() => {
              // Move to next message (cycle through all messages)
              setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
              showNextMessage()
            }, nextDelay)
          }, 5000)
        }
      }, 80) // Speed of typing (80ms per character)
    }

    // Start first message after 2 seconds
    messageTimer = setTimeout(() => {
      showNextMessage()
    }, 2000)

    // Cleanup function
    return () => {
      clearTimeout(messageTimer)
      clearInterval(typingInterval)
      clearTimeout(hideTimer)
      clearTimeout(nextMessageTimer)
    }
  }, [pathname, currentMessageIndex])

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
      
      // Hide message bubble when chat opens and reset message cycle
      setShowMessage(false)
      setTypedText("")
      setIsTyping(false)
      setCurrentMessageIndex(0)
      
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
      {/* Message Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 max-w-xs"
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 relative">
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {typedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                        className="inline-block ml-1 w-2 h-4 bg-neo-mint dark:bg-purist-blue"
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Button */}
      <Button
        ref={buttonRef}
        onClick={handleClick}
        size="icon"
        variant="outline"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg border-0 z-40 transition-transform overflow-hidden p-0"
      >
        <Image
          src="https://yvsjynosfwyhvisqhasp.supabase.co/storage/v1/object/public/posts/images/825ef58d-31bc-4ad9-9c99-ed7fb15cf8a1.jfif"
          alt="AI Assistant"
          width={120}
          height={120}
          className="h-full w-full rounded-full object-cover"
        />
      
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