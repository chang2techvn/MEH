"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function EventSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-2 sm:p-3">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <Skeleton className="h-3.5 sm:h-5 w-24 sm:w-32" />
          <Skeleton className="h-3.5 sm:h-5 w-12 sm:w-16" />
        </div>
        <Skeleton className="h-3 sm:h-4 w-full mb-1.5 sm:mb-2" />
        <Skeleton className="h-2.5 sm:h-3 w-3/4" />
      </div>
    </Card>
  )
}
