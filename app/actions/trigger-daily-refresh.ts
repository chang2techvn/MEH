"use server"

// Function to trigger daily video refresh when no challenges are found
export async function triggerDailyRefresh(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🚀 Triggering daily refresh manually...")
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error("❌ CRON_SECRET not found in environment")
      return { success: false, message: "Server configuration error" }
    }
    
    const response = await fetch(`${baseUrl}/api/cron/daily-video-refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Daily refresh failed:", errorText)
      return { success: false, message: `Failed to refresh: ${response.status}` }
    }
    
    const data = await response.json()
    console.log("✅ Daily refresh completed:", data)
    
    return { 
      success: true, 
      message: `Successfully generated ${data.data?.challenges?.challengeCount || 0} challenges` 
    }
    
  } catch (error) {
    console.error("❌ Error triggering daily refresh:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
