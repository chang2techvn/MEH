"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ContactSkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4 p-2 sm:p-2.5 2xl:p-3">
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 2xl:h-12 2xl:w-12 rounded-full flex-shrink-0" />
      <Skeleton className="h-3.5 sm:h-4 2xl:h-5 w-20 sm:w-24 2xl:w-28 flex-1" />
    </div>
  )
}
