"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, ExternalLink } from "lucide-react"

export function LogoutHelper() {
  const { logout } = useAuth()

  const handleCompleteLogout = async () => {
    // Logout from the app first
    await logout()
    
    // Open Google logout in a new tab to clear Google session
    const googleLogoutUrl = "https://accounts.google.com/logout"
    window.open(googleLogoutUrl, '_blank', 'width=500,height=600')
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCompleteLogout}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Complete Logout
        <ExternalLink className="h-3 w-3" />
      </Button>
      <p className="text-xs text-muted-foreground">
        This will also logout from Google to ensure clean login next time
      </p>
    </div>
  )
}
