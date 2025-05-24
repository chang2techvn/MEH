"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Users, MapPin, ChevronLeft, Clock, Filter, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import SEOMeta from "@/components/seo-meta"

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  description: string
  attendees: number
  organizer: {
    name: string
    image: string
  }
  badge: "today" | "tomorrow" | "upcoming" | "past"
  category: "speaking" | "writing" | "grammar" | "vocabulary" | "pronunciation" | "exam-prep"
  isOnline: boolean
}

export default function EventsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setEvents(generateMockEvents())
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const generateMockEvents = (): Event[] => {
    return [
      {
        id: 1,
        title: "Pronunciation Workshop",
        date: "May 22, 2025",
        time: "8:00 PM GMT",
        location: "Online (Zoom)",
        description:
          "Master the pronunciation of difficult English sounds with our expert phonetics instructor. This interactive workshop will focus on the most challenging sounds for non-native speakers.",
        attendees: 45,
        organizer: {
          name: "Sarah Chen",
          image: "/placeholder.svg?height=40&width=40",
        },
        badge: "today",
        category: "pronunciation",
        isOnline: true,
      },
      {
        id: 2,
        title: "Speaking Practice Meetup",
        date: "May 23, 2025",
        time: "6:30 PM GMT",
        location: "Online (Discord)",
        description:
          "Join our weekly speaking practice session where you can practice English conversation in small groups. All levels welcome!",
        attendees: 32,
        organizer: {
          name: "John Wilson",
          image: "/placeholder.svg?height=40&width=40",
        },
        badge: "tomorrow",
        category: "speaking",
        isOnline: true,
      },
      {
        id: 3,
        title: "IELTS Writing Workshop",
        date: "May 25, 2025",
        time: "7:00 PM GMT",
        location: "Online (Zoom)",
        description:
          "Prepare for the IELTS writing section with our experienced instructor. Learn effective strategies for Task 1 and Task 2 essays.",
        attendees: 28,
        organizer: {
          name: "Lisa Wong",
          image: "/placeholder.svg?height=40&width=40",
        },
        badge: "upcoming",
        category: "writing",
        isOnline: true,
      },
      {
        id: 4,
        title: "Grammar Masterclass",
        date: "May 28, 2025",
        time: "5:00 PM GMT",
        location: "Central Library, Room 204",
        description:
          "An in-depth look at advanced English grammar concepts. Perfect for intermediate and advanced learners looking to refine their grammar skills.",
        attendees: 18,
        organizer: {
          name: "David Kim",
          image: "/placeholder.svg?height=40&width=40",
        },
        badge: "upcoming",
        category: "grammar",
        isOnline: false,
      },
      {
        id: 5,
        title: "Business English Networking",
        date: "June 2, 2025",
        time: "7:30 PM GMT",
        location: "Downtown Conference Center",
        description:
          "Network with professionals while practicing your business English skills. Great opportunity to expand your professional vocabulary and connections.",
        attendees: 40,
        organizer: {
          name: "Emma Thompson",
          image: "/placeholder.svg?height=40&width=40",
        },
        badge: "upcoming",
        category: "speaking",
        isOnline: false,
      },
      {
        id: 6,
        title: "Vocabulary Building Workshop",
        date: "June 5, 2025",
        time: "6:00 PM GMT",
        location: "Online (Zoom)",
        description:
          "Expand your English vocabulary with effective memorization techniques and practice exercises. Focus on academic and professional vocabulary.",
        attendees: 25,
        organizer: {
          name: "Carlos Rodriguez",
          image: "/placeholder.svg?height=40&width=40",
        },
        badge: "upcoming",
        category: "vocabulary",
        isOnline: true,
      },
      {
        id: 7,
        title: "TOEFL Preparation Seminar",
        date: "May 15, 2025",
        time: "7:00 PM GMT",
        location: "Online (Zoom)",
        description:
          "Comprehensive overview of the TOEFL exam with strategies for each section. Includes practice materials and Q&A with experienced instructors.",
        attendees: 52,
        organizer: {
          name: "Mike Johnson",
          image: "/placeholder.svg?height=40&width=40",
        },
        badge: "past",
        category: "exam-prep",
        isOnline: true,
      },
    ]
  }

  const filteredEvents = events.filter((event) => {
    // Filter by tab
    if (activeTab === "upcoming" && event.badge === "past") return false
    if (activeTab === "past" && event.badge !== "past") return false
    if (activeTab === "online" && !event.isOnline) return false
    if (activeTab === "in-person" && event.isOnline) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <>
      <SEOMeta
        title="Events | EnglishMastery - Join English Learning Events"
        description="Discover and join English learning events, workshops, and meetups. Improve your skills through interactive sessions with fellow learners and expert instructors."
        keywords={["English events", "language workshops", "English meetups", "speaking practice", "IELTS preparation"]}
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
                <h1 className="text-xl font-bold">Events</h1>
              </div>
              <Button className="bg-neo-mint hover:bg-neo-mint/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
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
                placeholder="Search events..."
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
          <Tabs defaultValue="upcoming" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="in-person">In-Person</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {renderEventsList(filteredEvents, loading)}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {renderEventsList(filteredEvents, loading)}
            </TabsContent>

            <TabsContent value="online" className="space-y-4">
              {renderEventsList(filteredEvents, loading)}
            </TabsContent>

            <TabsContent value="in-person" className="space-y-4">
              {renderEventsList(filteredEvents, loading)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )

  function renderEventsList(events: Event[], isLoading: boolean) {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, i) => <EventCardSkeleton key={i} />)
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery ? "Try adjusting your search or filters" : "There are no events in this category yet"}
          </p>
          <Button>Create an Event</Button>
        </div>
      )
    }

    return events.map((event) => <EventCard key={event.id} event={event} />)
  }
}

function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Date Box */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center w-full sm:w-24">
              <p className="text-sm text-gray-500 dark:text-gray-400">{event.date.split(",")[0]}</p>
              <p className="text-2xl font-bold">{event.date.split(" ")[1]}</p>
            </div>
          </div>

          {/* Event Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  className={`mb-2 ${
                    event.badge === "today"
                      ? "bg-green-500"
                      : event.badge === "tomorrow"
                        ? "bg-blue-500"
                        : event.badge === "past"
                          ? "bg-gray-500"
                          : "bg-purple-500"
                  } text-white border-0`}
                >
                  {event.badge === "today"
                    ? "Today"
                    : event.badge === "tomorrow"
                      ? "Tomorrow"
                      : event.badge === "past"
                        ? "Past"
                        : "Upcoming"}
                </Badge>
                <Badge className="ml-2 mb-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0">
                  {event.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </div>
              <Badge
                variant="outline"
                className={event.isOnline ? "border-green-500 text-green-600 dark:text-green-400" : ""}
              >
                {event.isOnline ? "Online" : "In-Person"}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>{event.time}</span>
              </div>

              <div className="hidden sm:block h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />

              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>{event.location}</span>
              </div>

              <div className="hidden sm:block h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />

              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1.5" />
                <span>{event.attendees} attending</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={event.organizer.image || "/placeholder.svg"} />
                  <AvatarFallback>{event.organizer.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">Organized by {event.organizer.name}</span>
              </div>

              <Button size="sm">Join</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Date Box Skeleton */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Skeleton className="h-24 w-full sm:w-24 rounded-lg" />
          </div>

          {/* Event Details Skeleton */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />

            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>

            <Separator />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-9 w-16 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
