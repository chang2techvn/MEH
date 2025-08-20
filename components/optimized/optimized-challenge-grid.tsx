"use client"

import React, { memo, useCallback, useMemo } from "react"
import ChallengeCard from "@/components/challenge/challenge-card"
import InfiniteScroll from "@/components/ui/infinite-scroll"
import VirtualScroll from "@/components/ui/virtual-scroll"
import LazyComponent from "@/components/optimized/lazy-component"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Challenge } from "@/lib/utils/challenge-constants"

interface ChallengeGridProps {
  challenges: Challenge[]
  onStartChallenge: (id: string) => void
  loading?: boolean
  emptyMessage?: string
  emptyAction?: () => void
  emptyActionLabel?: string
  useVirtualScroll?: boolean
  useInfiniteScroll?: boolean
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  containerHeight?: number
  showDeleteButton?: boolean
  userId?: string
  onChallengeDeleted?: (id: string) => void
}

// Single challenge item component for virtual scrolling
const ChallengeItem = memo(function ChallengeItem({ 
  challenge, 
  onStart,
  index,
  showDeleteButton = false,
  userId,
  onChallengeDeleted
}: { 
  challenge: Challenge
  onStart: (id: string) => void
  index: number
  showDeleteButton?: boolean
  userId?: string
  onChallengeDeleted?: (id: string) => void
}) {
  return (
    <div className="p-2">
      <LazyComponent
        threshold={0.1}
        rootMargin="200px"
        fallbackMinHeight="280px"
      >
        <ChallengeCard
          key={challenge.id}
          id={challenge.id}
          title={challenge.title}
          description={challenge.description}
          thumbnailUrl={challenge.thumbnailUrl}
          duration={challenge.duration}
          difficulty={challenge.difficulty}
          onStart={onStart}
          isUserGenerated={showDeleteButton}
          userId={userId}
          onDelete={onChallengeDeleted}
          challenge={challenge}
        />
      </LazyComponent>
    </div>
  )
})

// Grid layout for regular display
const ChallengeGrid = memo(function ChallengeGrid({ 
  challenges, 
  onStartChallenge,
  showDeleteButton = false,
  userId,
  onChallengeDeleted
}: { 
  challenges: Challenge[]
  onStartChallenge: (id: string) => void
  showDeleteButton?: boolean
  userId?: string
  onChallengeDeleted?: (id: string) => void
}) {
  // Ensure challenges is always an array
  const safeChallenges = Array.isArray(challenges) ? challenges : []
  
  return (
    <div className="challenge-grid-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full px-2 sm:px-0">
      {safeChallenges.map((challenge, index) => (
        <div key={challenge.id} className="challenge-grid-item h-full">
          <LazyComponent
            threshold={0.1}
            rootMargin="200px"
            fallbackMinHeight="280px"
          >
            <ChallengeCard
              id={challenge.id}
              title={challenge.title}
              description={challenge.description}
              thumbnailUrl={challenge.thumbnailUrl}
              duration={challenge.duration}
              difficulty={challenge.difficulty}
              onStart={onStartChallenge}
              isUserGenerated={showDeleteButton}
              userId={userId}
              onDelete={onChallengeDeleted}
              challenge={challenge}
            />
          </LazyComponent>
        </div>
      ))}
    </div>
  )
})

export default memo(function OptimizedChallengeGrid({
  challenges,
  onStartChallenge,
  loading = false,
  emptyMessage = "No challenges found",
  emptyAction,
  emptyActionLabel = "Create Challenge",
  useVirtualScroll = false,
  useInfiniteScroll = false,
  onLoadMore,
  hasMore = false,
  containerHeight = 600,
  showDeleteButton = false,
  userId,
  onChallengeDeleted,
}: ChallengeGridProps) {
  
  // Ensure challenges is always an array to prevent map errors
  const safeChallenges = Array.isArray(challenges) ? challenges : []
  
  // Memoize render item function for virtual scroll
  const renderChallengeItem = useCallback((challenge: Challenge, index: number) => (
    <ChallengeItem
      key={challenge.id}
      challenge={challenge}
      onStart={onStartChallenge}
      index={index}
      showDeleteButton={showDeleteButton}
      userId={userId}
      onChallengeDeleted={onChallengeDeleted}
    />
  ), [onStartChallenge, showDeleteButton, userId, onChallengeDeleted])

  // Empty state
  const EmptyState = useMemo(() => (
    <Card className="mt-6">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        {emptyAction && (
          <Button onClick={emptyAction}>{emptyActionLabel}</Button>
        )}
      </CardContent>
    </Card>
  ), [emptyMessage, emptyAction, emptyActionLabel])
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-[280px] sm:h-[320px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  // Empty state
  if (challenges.length === 0) {
    return EmptyState
  }
  // Virtual scroll for large lists
  if (useVirtualScroll && challenges.length > 20) {
    return (
      <VirtualScroll
        items={challenges}
        itemHeight={280}
        containerHeight={containerHeight}
        renderItem={renderChallengeItem}
        overscan={3}
        className="w-full"
      />
    )
  }

  // Infinite scroll wrapper
  if (useInfiniteScroll && onLoadMore) {
    return (
      <InfiniteScroll
        loadMore={onLoadMore}
        hasMore={hasMore}
        isLoading={loading}
        threshold={0.1}
        rootMargin="200px"
        loader={
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        }
        endMessage={
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">All challenges loaded</p>
          </div>
        }
      >
        <ChallengeGrid 
          challenges={challenges} 
          onStartChallenge={onStartChallenge}
          showDeleteButton={showDeleteButton}
          userId={userId}
          onChallengeDeleted={onChallengeDeleted}
        />
      </InfiniteScroll>
    )
  }

  // Regular grid display
  return (
    <ChallengeGrid 
      challenges={challenges} 
      onStartChallenge={onStartChallenge}
      showDeleteButton={showDeleteButton}
      userId={userId}
      onChallengeDeleted={onChallengeDeleted}
    />
  )
})
