import { Loader2 } from "lucide-react"

export default function AdminChallengesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 animate-spin">
            <Loader2 className="h-16 w-16 text-primary" />
          </div>
        </div>
        <p className="text-lg font-medium">Loading challenges...</p>
        <p className="text-sm text-muted-foreground">This may take a moment</p>
      </div>
    </div>
  )
}
