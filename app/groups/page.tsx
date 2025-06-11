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
import { dbHelpers } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Group {
  id: string
  name: string
  description: string
  avatar: string
  memberCount: number
  maxMembers?: number
  isPublic: boolean
  requiresApproval: boolean
  tags: string[]
  category: string
  creator: {
    id: string
    name: string
    avatar: string | null
  }
  createdAt: string
  joined?: boolean
}

export default function GroupsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {      setLoading(true)
      const groupsResult = await dbHelpers.getGroups(50)
      const groupsData = groupsResult.data || []
      
      // Transform the data to match our interface
      const transformedGroups: Group[] = groupsData.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        avatar: group.avatar || '/placeholder.svg?height=80&width=80',
        memberCount: group.memberCount,
        maxMembers: group.maxMembers,
        isPublic: group.isPublic ?? true,
        requiresApproval: group.requiresApproval,
        tags: group.tags,
        category: group.category || 'general',        creator: group.creator || { id: '', name: 'Unknown', avatar: null },
        createdAt: group.createdAt || new Date().toISOString(),
        joined: false // TODO: Check if current user is a member
      }))

      setGroups(transformedGroups)
    } catch (error) {
      console.error('Error loading groups:', error)
      toast({
        title: "Error loading groups",
        description: "Unable to load groups. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }  }

  const handleJoinGroup = (groupId: string) => {
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
  function renderGroupsList(groups: Group[], isLoading: boolean, onJoinGroup: (id: string) => void) {
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

function GroupCard({ group, onJoinGroup }: { group: Group; onJoinGroup: (id: string) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 sm:h-40 w-full overflow-hidden">
        <Image src={group.avatar || "/placeholder.svg"} alt={`${group.name} cover`} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10"></div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="outline" className="bg-black/50 text-white border-0 backdrop-blur-sm">
            {group.isPublic ? (
              <>
                <Globe className="h-3 w-3 mr-1" /> Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" /> Private
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex">
          <div className="relative -mt-12 sm:-mt-16 mr-4 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800">
            <Image
              src={group.avatar || "/placeholder.svg"}
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
                  <span>{group.memberCount} members</span>
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
              +{Math.max(0, group.memberCount - 3)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </span>

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
