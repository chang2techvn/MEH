"use client"

import { Suspense, lazy } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load components
const CommunityFeedSection = lazy(() => import("./feed-section"))

// Loading fallback component
const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
)

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
            Community Feed
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover and share English learning content with the community
          </p>
        </div>

        <div className="max-w-4xl mx-auto">          <Suspense fallback={<LoadingFallback />}>
            <CommunityFeedSection />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
