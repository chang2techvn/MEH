"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ProfileSkeleton() {
  return (
    <div className="container relative z-10 -mt-20 pb-8">
      {/* Profile Info Card Skeleton */}
      <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Skeleton */}
            <div className="relative">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>

            {/* User Info Skeleton */}
            <div className="flex-1 text-center md:text-left">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
              <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              
              {/* Level Progress Skeleton */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-1/3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-8 mx-auto mb-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Tabs Skeleton */}
      <div className="mt-8">
        <div className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-1 mb-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>

        {/* Content Area Skeleton */}
        <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="flex gap-4">
                      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="h-8 w-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-8 mx-auto mb-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function PostsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
