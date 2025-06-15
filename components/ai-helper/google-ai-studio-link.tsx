"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface GoogleAIStudioLinkProps {
  autoOpen?: boolean
}

export function GoogleAIStudioLink({ autoOpen = false }: GoogleAIStudioLinkProps) {
  const [popupBlocked, setPopupBlocked] = useState(false)

  useEffect(() => {
    if (autoOpen) {
      // Small delay to ensure browser doesn't block it as part of page load
      const timer = setTimeout(() => {
        openGoogleAIStudio()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [autoOpen])

  const openGoogleAIStudio = () => {
    try {
      // Try to open the popup with specific dimensions and features
      const popup = window.open(
        "https://aistudio.google.com",
        "googleAIStudio",
        "width=1200,height=800,menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes,status=no",
      )

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        console.log("Popup blocked by browser")
        setPopupBlocked(true)
      } else {
        setPopupBlocked(false)

        // Focus the popup window
        popup.focus()

        // Optional: Add event listener to detect when popup is closed
        const checkIfClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkIfClosed)
            console.log("Popup was closed")
          }
        }, 1000)
      }
    } catch (error) {
      console.error("Error opening popup:", error)
      setPopupBlocked(true)
    }
  }

  const handleDirectLink = () => {
    // Fallback method: open in new tab
    window.open("https://aistudio.google.com", "_blank")
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={openGoogleAIStudio}
        className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 px-6 py-2 text-lg flex items-center gap-2"
      >
        Open Google AI Studio <ExternalLink className="h-4 w-4" />
      </Button>

      {popupBlocked && (
        <div className="text-amber-400 text-sm bg-amber-950/30 p-3 rounded-md">
          <p>Popup was blocked. Please allow popups for this site or use the direct link below:</p>
          <Button variant="link" onClick={handleDirectLink} className="text-amber-400 underline p-0 h-auto mt-1">
            Open in new tab instead
          </Button>
        </div>
      )}
    </div>
  )
}
