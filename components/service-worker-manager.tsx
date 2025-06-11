"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function ServiceWorkerManager() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [showReload, setShowReload] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // Register the service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js")

        // Detect if there's a waiting service worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowReload(true)
        }

        // Detect if a new service worker is installed
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing

          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker)
              setShowReload(true)
            }
          })
        })

        // Detect controller change
        let refreshing = false
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        })
      } catch (error) {
        console.error("Service worker registration failed:", error)
      }
    }

    registerServiceWorker()
  }, [])

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (!waitingWorker) return

    waitingWorker.postMessage({ type: "SKIP_WAITING" })
    setShowReload(false)
    toast({
      title: "Updating application",
      description: "The application is updating to the latest version.",
    })
  }

  if (!showReload) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm mb-2">A new version is available!</p>
      <Button onClick={updateServiceWorker} size="sm">
        Update & Reload
      </Button>
    </div>
  )
}
