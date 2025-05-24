import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm shimmer", className)}
      {...props}
    />
  )
}

export { Skeleton }
