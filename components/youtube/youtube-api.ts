// ✅ Global YouTube API loader để tránh load nhiều lần
let youtubeAPIPromise: Promise<any> | null = null

export const getYouTubeAPI = () => {
  if (youtubeAPIPromise) return youtubeAPIPromise
  
  youtubeAPIPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }

    window.onYouTubeIframeAPIReady = () => resolve(window.YT)
    
    if (!document.getElementById("youtube-api")) {
      const script = document.createElement("script")
      script.id = "youtube-api"
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })
  
  return youtubeAPIPromise
}

// Utility function to format time
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
