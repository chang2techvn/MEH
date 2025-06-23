"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function StoryCardSkeleton() {
  return (
    <div className="w-[90px] sm:w-[110px] h-[160px] sm:h-[200px] rounded-xl relative overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
      <div className="absolute top-2 left-2">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
      </div>
      <div className="absolute bottom-2 left-2 right-2">
        <Skeleton className="h-3 sm:h-4 w-full" />
      </div>
    </div>
  )
}
