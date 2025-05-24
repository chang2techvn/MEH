"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Users,
  ChevronLeft,
  Search,
  Filter,
  Plus,
  Lock,
  Globe,
  MessageSquare,
  Settings,
  MoreHorizontal,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SEOMeta from "@/components/seo-meta"

interface Group {
  id: number
  name: string
  description: string
  image: string
  coverImage: string
  members: number
  privacy: "public" | "private"
  category: "speaking" | "writing" | "grammar" | "vocabulary" | "pronunciation" | "exam-prep" | "general"
  activity: "very-active" | "active" | "moderate" | "low"
  joined: boolean
  lastActive: string
}

export default function GroupsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setGroups(generateMockGroups())
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const generateMockGroups = (): Group[] => {
    return [
      {
        id: 1,
        name: "Pronunciation Practice",
        description:
          "A community focused on improving English pronunciation through regular practice sessions, feedback, and specialized exercises.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 245,
        privacy: "public",
        category: "pronunciation",
        activity: "very-active",
        joined: true,
        lastActive: "5 minutes ago",
      },
      {
        id: 2,
        name: "Business English",
        description:
          "Develop professional English skills for workplace communication, presentations, emails, and networking in international business contexts.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 189,
        privacy: "public",
        category: "general",
        activity: "active",
        joined: true,
        lastActive: "2 hours ago",
      },
      {
        id: 3,
        name: "IELTS Preparation",
        description:
          "Dedicated to helping members prepare for all sections of the IELTS exam with practice materials, mock tests, and expert advice.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 312,
        privacy: "private",
        category: "exam-prep",
        activity: "very-active",
        joined: false,
        lastActive: "1 day ago",
      },
      {
        id: 4,
        name: "Grammar Enthusiasts",
        description:
          "For learners who want to master English grammar rules, exceptions, and nuances through discussions and practice exercises.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 156,
        privacy: "public",
        category: "grammar",
        activity: "moderate",
        joined: false,
        lastActive: "3 days ago",
      },
      {
        id: 5,
        name: "English Teachers",
        description:
          "A professional community for English teachers to share resources, teaching methodologies, and support each other.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 203,
        privacy: "private",
        category: "general",
        activity: "active",
        joined: false,
        lastActive: "2 days ago",
      },
      {
        id: 6,
        name: "Creative Writing",
        description:
          "Explore creative writing in English through prompts, feedback sessions, and collaborative storytelling projects.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 178,
        privacy: "public",
        category: "writing",
        activity: "active",
        joined: true,
        lastActive: "1 hour ago",
      },
      {
        id: 7,
        name: "Vocabulary Building",
        description:
          "Expand your English vocabulary through themed discussions, word games, and effective memorization techniques.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 225,
        privacy: "public",
        category: "vocabulary",
        activity: "moderate",
        joined: false,
        lastActive: "5 days ago",
      },
      {
        id: 8,
        name: "Speaking Practice",
        description:
          "Regular conversation sessions for all levels to improve fluency, pronunciation, and confidence in speaking English.",
        image: "/placeholder.svg?height=80&width=80",
        coverImage: "/placeholder.svg?height=200&width=600",
        members: 267,
        privacy: "public",
        category: "speaking",
        activity: "very-active",
        joined: false,
        lastActive: "12 hours ago",
      },
    ]
  }

  const handleJoinGroup = (groupId: number) => {
    setGroups(groups.map((group) => (group.id === groupId ? { ...group, joined: !group.joined } : group)))
  }

  const filteredGroups = groups.filter((group) => {
    // Filter by tab
    if (activeTab === "my-groups" && !group.joined) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.category.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <>
      <SEOMeta
        title="Groups | EnglishMastery - Join English Learning Communities"
        description="Connect with like-minded English learners in specialized groups. Share resources, practice together, and grow your language skills in a supportive community."
        keywords={[
          "English groups",
          "language communities",
          "English practice groups",
          "speaking clubs",
          "writing circles",
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
                <h1 className="text-xl font-bold">Groups</h1>
              </div>
              <Button className="bg-neo-mint hover:bg-neo-mint/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search groups..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="discover" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="discover">Discover Groups</TabsTrigger>
              <TabsTrigger value="my-groups">My Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6">
              {renderGroupsList(filteredGroups, loading, handleJoinGroup)}
            </TabsContent>

            <TabsContent value="my-groups" className="space-y-6">
              {renderGroupsList(filteredGroups, loading, handleJoinGroup)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )

  function renderGroupsList(groups: Group[], isLoading: boolean, onJoinGroup: (id: number) => void) {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, i) => <GroupCardSkeleton key={i} />)
    }

    if (groups.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No groups found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {activeTab === "my-groups" ? "You haven't joined any groups yet" : "No groups match your search criteria"}
          </p>
          <Button>Create a Group</Button>
        </div>
      )
    }

    return groups.map((group) => <GroupCard key={group.id} group={group} onJoinGroup={onJoinGroup} />)
  }
}

function GroupCard({ group, onJoinGroup }: { group: Group; onJoinGroup: (id: number) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 sm:h-40 w-full overflow-hidden">
        <Image src={group.coverImage || "/placeholder.svg"} alt={`${group.name} cover`} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10"></div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="outline" className="bg-black/50 text-white border-0 backdrop-blur-sm">
            {group.privacy === "public" ? (
              <>
                <Globe className="h-3 w-3 mr-1" /> Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" /> Private
              </>
            )}
          </Badge>

          <Badge
            variant="outline"
            className={`
              bg-black/50 text-white border-0 backdrop-blur-sm
              ${
                group.activity === "very-active"
                  ? "border-l-4 border-l-green-500"
                  : group.activity === "active"
                    ? "border-l-4 border-l-blue-500"
                    : group.activity === "moderate"
                      ? "border-l-4 border-l-yellow-500"
                      : "border-l-4 border-l-gray-500"
              }
            `}
          >
            {group.activity === "very-active"
              ? "Very Active"
              : group.activity === "active"
                ? "Active"
                : group.activity === "moderate"
                  ? "Moderate"
                  : "Low Activity"}
          </Badge>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex">
          <div className="relative -mt-12 sm:-mt-16 mr-4 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800">
            <Image
              src={group.image || "/placeholder.svg"}
              alt={group.name}
              width={80}
              height={80}
              className="h-16 w-16 sm:h-20 sm:w-20 object-cover"
            />
          </div>

          <div className="flex-1 pt-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{group.members} members</span>
                  <span className="mx-2">•</span>
                  <Badge variant="outline" className="text-xs font-normal">
                    {group.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Send Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Group Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 mb-4 line-clamp-2">{group.description}</p>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                <AvatarImage src={`/placeholder.svg?height=24&width=24&text=${i}`} />
                <AvatarFallback>U{i}</AvatarFallback>
              </Avatar>
            ))}
            <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs">
              +{group.members - 3}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Active {group.lastActive}</span>

            <Button
              size="sm"
              variant={group.joined ? "outline" : "default"}
              className={group.joined ? "" : "bg-neo-mint hover:bg-neo-mint/90 text-white"}
              onClick={() => onJoinGroup(group.id)}
            >
              {group.joined ? (
                "Joined"
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Join
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function GroupCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 sm:h-40 w-full" />

      <div className="p-4 sm:p-6">
        <div className="flex">
          <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 -mt-12 sm:-mt-16 mr-4 rounded-xl" />

          <div className="flex-1 pt-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-6 rounded-full" />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  )
}
