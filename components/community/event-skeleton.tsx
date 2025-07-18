"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function EventSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-2 sm:p-3 2xl:p-4">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2 2xl:mb-3">
          <Skeleton className="h-3.5 sm:h-5 2xl:h-6 w-24 sm:w-32 2xl:w-40" />
          <Skeleton className="h-3.5 sm:h-5 2xl:h-6 w-12 sm:w-16 2xl:w-20" />
        </div>
        <Skeleton className="h-3 sm:h-4 2xl:h-5 w-full mb-1.5 sm:mb-2 2xl:mb-3" />
        <Skeleton className="h-2.5 sm:h-3 2xl:h-4 w-3/4" />
      </div>
    </Card>
  )
}
