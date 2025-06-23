"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ContactSkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5">
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
      <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24 flex-1" />
    </div>
  )
}
