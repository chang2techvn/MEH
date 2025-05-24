"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ChevronLeft,
  Search,
  TrendingUp,
  MessageSquare,
  Eye,
  ThumbsUp,
  Hash,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  Bookmark,
  Share2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SEOMeta from "@/components/seo-meta"

interface TrendingItem {
  id: number
  type: "post" | "topic" | "challenge" | "event" | "group"
  title: string
  description?: string
  image?: string
  author?: {
    name: string
    image: string
  }
  stats: {
    views?: number
    likes?: number
    comments?: number
    participants?: number
  }
  timeAgo: string
  category: string
  url: string
  trending: number // 1-5, with 5 being the most trending
}

export default function TrendingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setTrendingItems(generateMockTrendingItems())
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const generateMockTrendingItems = (): TrendingItem[] => {
    return [
      {
        id: 1,
        type: "post",
        title: "10 Common English Pronunciation Mistakes and How to Fix Them",
        description:
          "A comprehensive guide to the most frequent pronunciation errors made by non-native speakers and practical exercises to overcome them.",
        image: "/placeholder.svg?height=200&width=400",
        author: {
          name: "Sarah Chen",
          image: "/placeholder.svg?height=40&width=40",
        },
        stats: {
          views: 4567,
          likes: 342,
          comments: 87,
        },
        timeAgo: "2 days ago",
        category: "pronunciation",
        url: "/community",
        trending: 5,
      },
      {
        id: 2,
        type: "topic",
        title: "Business English Idioms",
        description: "Collection of common idioms used in professional settings with examples and usage tips.",
        stats: {
          views: 3245,
          comments: 156,
        },
        timeAgo: "3 days ago",
        category: "vocabulary",
        url: "/community",
        trending: 4,
      },
      {
        id: 3,
        type: "challenge",
        title: "30-Day Speaking Challenge",
        description:
          "Join thousands of learners in this month's speaking challenge. Record daily responses to prompts and get feedback from the community.",
        image: "/placeholder.svg?height=200&width=400",
        stats: {
          participants: 1245,
          comments: 567,
        },
        timeAgo: "1 week ago",
        category: "speaking",
        url: "/challenges",
        trending: 5,
      },
      {
        id: 4,
        type: "event",
        title: "IELTS Writing Workshop",
        description: "Live online workshop focusing on Task 2 essay writing strategies with expert instructors.",
        stats: {
          participants: 312,
        },
        timeAgo: "5 days ago",
        category: "writing",
        url: "/events",
        trending: 3,
      },
      {
        id: 5,
        type: "post",
        title: "The Ultimate Guide to English Tenses",
        description: "A visual explanation of all English tenses with timelines, examples, and common usage patterns.",
        author: {
          name: "David Kim",
          image: "/placeholder.svg?height=40&width=40",
        },
        stats: {
          views: 2876,
          likes: 245,
          comments: 63,
        },
        timeAgo: "1 day ago",
        category: "grammar",
        url: "/community",
        trending: 4,
      },
      {
        id: 6,
        type: "group",
        title: "Pronunciation Practice",
        description: "The fastest growing community for daily pronunciation drills and feedback.",
        image: "/placeholder.svg?height=80&width=80",
        stats: {
          participants: 245,
        },
        timeAgo: "2 weeks ago",
        category: "pronunciation",
        url: "/groups",
        trending: 3,
      },
      {
        id: 7,
        type: "topic",
        title: "Phrasal Verbs Mastery",
        description: "Discussions and resources for mastering the most common English phrasal verbs.",
        stats: {
          views: 1987,
          comments: 124,
        },
        timeAgo: "4 days ago",
        category: "vocabulary",
        url: "/community",
        trending: 3,
      },
      {
        id: 8,
        type: "challenge",
        title: "Weekly Writing Prompt",
        description:
          "This week's writing challenge has seen record participation. Write a 300-word response and get personalized feedback.",
        stats: {
          participants: 876,
          comments: 342,
        },
        timeAgo: "3 days ago",
        category: "writing",
        url: "/challenges",
        trending: 4,
      },
    ]
  }

  const filteredItems = trendingItems.filter((item) => {
    // Filter by tab
    if (activeTab !== "all" && item.type !== activeTab) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <>
      <SEOMeta
        title="Trending | EnglishMastery - What's Popular in English Learning"
        description="Discover what's trending in the English learning community. Stay updated with popular topics, challenges, events, and discussions among fellow learners."
        keywords={[
          "trending English topics",
          "popular language content",
          "English learning trends",
          "language learning community",
          "viral English content",
        ]}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Trending</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search trending content..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="post">Posts</TabsTrigger>
              <TabsTrigger value="topic">Topics</TabsTrigger>
              <TabsTrigger value="challenge">Challenges</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {renderTrendingItems(filteredItems, loading)}
            </TabsContent>

            <TabsContent value="post" className="space-y-4">
              {renderTrendingItems(filteredItems, loading)}
            </TabsContent>

            <TabsContent value="topic" className="space-y-4">
              {renderTrendingItems(filteredItems, loading)}
            </TabsContent>

            <TabsContent value="challenge" className="space-y-4">
              {renderTrendingItems(filteredItems, loading)}
            </TabsContent>

            <TabsContent value="event" className="space-y-4">
              {renderTrendingItems(filteredItems, loading)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )

  function renderTrendingItems(items: TrendingItem[], isLoading: boolean) {
    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, i) => <TrendingItemSkeleton key={i} />)
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No trending content found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery ? "Try adjusting your search" : "There's no trending content in this category right now"}
          </p>
          <Button onClick={() => router.push("/community")}>Explore Community</Button>
        </div>
      )
    }

    return items.map((item) => <TrendingItemCard key={item.id} item={item} />)
  }
}

function TrendingItemCard({ item }: { item: TrendingItem }) {
  const router = useRouter()

  const handleClick = () => {
    router.push(item.url)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Left side - Image or Icon */}
          <div className="flex-shrink-0">
            {item.image && (item.type === "post" || item.type === "challenge") ? (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden">
                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
              </div>
            ) : item.type === "group" && item.image ? (
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={item.image || "/placeholder.svg"} alt={item.title} />
                <AvatarFallback>{item.title.substring(0, 2)}</AvatarFallback>
              </Avatar>
            ) : (
              <div
                className={`
                h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center
                ${
                  item.type === "post"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : item.type === "topic"
                      ? "bg-purple-100 dark:bg-purple-900"
                      : item.type === "challenge"
                        ? "bg-green-100 dark:bg-green-900"
                        : item.type === "event"
                          ? "bg-orange-100 dark:bg-orange-900"
                          : "bg-gray-100 dark:bg-gray-800"
                }
              `}
              >
                {item.type === "post" && <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
                {item.type === "topic" && <Hash className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
                {item.type === "challenge" && <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />}
                {item.type === "event" && <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />}
                {item.type === "group" && <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={`
                ${
                  item.type === "post"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    : item.type === "topic"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                      : item.type === "challenge"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : item.type === "event"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
                }
              `}
              >
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Badge>

              <Badge variant="outline" className="font-normal">
                {item.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>

              <div className="flex items-center ml-auto">
                <TrendingUp className="h-3.5 w-3.5 text-red-500 mr-1" />
                <div className="flex">
                  {Array(item.trending)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 bg-red-500 rounded-full mr-0.5"></div>
                    ))}
                  {Array(5 - item.trending)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mr-0.5"></div>
                    ))}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

            {item.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
            )}

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
              {item.author ? (
                <div className="flex items-center mr-3">
                  <Avatar className="h-5 w-5 mr-1.5">
                    <AvatarImage src={item.author.image || "/placeholder.svg"} alt={item.author.name} />
                    <AvatarFallback>{item.author.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>{item.author.name}</span>
                </div>
              ) : null}

              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{item.timeAgo}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {item.stats.views && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{item.stats.views.toLocaleString()}</span>
                </div>
              )}

              {item.stats.likes && (
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{item.stats.likes.toLocaleString()}</span>
                </div>
              )}

              {item.stats.comments && (
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{item.stats.comments.toLocaleString()}</span>
                </div>
              )}

              {item.stats.participants && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{item.stats.participants.toLocaleString()} participants</span>
                </div>
              )}

              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Bookmark className="h-4 w-4 mr-2" />
                      <span>Save</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      <span>Open in new tab</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function TrendingItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg flex-shrink-0" />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <div className="ml-auto">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            <Skeleton className="h-6 w-3/4 mb-2" />

            <div className="space-y-2 mb-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <Skeleton className="h-5 w-32 mb-3" />

            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <div className="ml-auto flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
