"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32" />
            <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3.5 sm:h-4 w-full" />
          <Skeleton className="h-3.5 sm:h-4 w-full" />
          <Skeleton className="h-3.5 sm:h-4 w-3/4" />
        </div>
        <Skeleton className="h-32 sm:h-40 w-full rounded-lg mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
          <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
          <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
        </div>
      </div>
    </Card>
  )
}
