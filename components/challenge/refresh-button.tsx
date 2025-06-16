import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useState } from "react"
import { triggerDailyRefresh } from "@/app/actions/trigger-daily-refresh"
import { toast } from "@/hooks/use-toast"

interface RefreshButtonProps {
  onRefreshComplete?: () => void
}

export function RefreshButton({ onRefreshComplete }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const result = await triggerDailyRefresh()
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        if (onRefreshComplete) {
          onRefreshComplete()
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to refresh challenges",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Challenges'}
    </Button>
  )
}

interface NoChallengesMessageProps {
  onRefresh?: () => void
}

export function NoChallengesMessage({ onRefresh }: NoChallengesMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Challenges Available</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        No challenges have been generated for today yet. This typically happens early in the day before the automated refresh runs at 23:59.
      </p>
      <RefreshButton onRefreshComplete={onRefresh} />
    </div>
  )
}
