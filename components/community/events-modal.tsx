"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronDown,
  Check,
  Globe,
  Video,
  BookOpen,
  Trophy,
  Coffee,
  Gamepad2,
  Filter,
  ExternalLink,
  UserPlus,
  UserMinus,
  CheckCircle2
} from "lucide-react"
import { dbHelpers } from "@/lib/supabase"
import { formatDistanceToNow, format } from "date-fns"
import { useEventAttendance } from "@/hooks/use-event-attendance"

interface EventsModalProps {
  isOpen: boolean
  onClose: () => void
  highlightEventId?: string // For scrolling to specific event
}

interface EventDetail {
  id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  online_link?: string
  is_online: boolean
  max_attendees?: number
  current_attendees: number
  event_type: 'workshop' | 'webinar' | 'study_group' | 'competition' | 'social' | 'other'
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'all'
  tags?: string[]
  is_public: boolean
  is_active: boolean
  created_by?: string
  created_at: string
}

const eventTypeIcons = {
  workshop: BookOpen,
  webinar: Video,
  study_group: Users,
  competition: Trophy,
  social: Coffee,
  other: Gamepad2
}

const eventTypeColors = {
  workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  webinar: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  study_group: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  competition: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  social: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
}

const difficultyColors = {
  beginner: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  advanced: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  all: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
}

export function EventsModal({ isOpen, onClose, highlightEventId }: EventsModalProps) {
  const [events, setEvents] = useState<EventDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEvents, setFilteredEvents] = useState<EventDetail[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  
  // Use event attendance hook
  const { 
    attendingEvents, 
    loading: attendanceLoading, 
    joinEvent, 
    leaveEvent, 
    isAttending 
  } = useEventAttendance()

  // Load events when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEvents()
    }
  }, [isOpen])

  // Close detail view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEvent(null)
      setShowDetail(false)
      setSearchQuery("")
      setFilterType("all")
    }
  }, [isOpen])

  // Filter events based on search query and type filter
  useEffect(() => {
    if (!searchQuery.trim() && filterType === "all") {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter(event => {
        const matchesSearch = !searchQuery.trim() || (
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        
        const matchesType = filterType === "all" || event.event_type === filterType
        
        return matchesSearch && matchesType
      })
      setFilteredEvents(filtered)
    }
  }, [events, searchQuery, filterType])

  // Scroll to highlighted event
  useEffect(() => {
    if (highlightEventId && filteredEvents.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`event-${highlightEventId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add highlight effect
          element.classList.add('ring-2', 'ring-neo-mint', 'dark:ring-purist-blue')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-neo-mint', 'dark:ring-purist-blue')
          }, 3000)
        }
      }, 500)
    }
  }, [highlightEventId, filteredEvents])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await dbHelpers.getEvents(50) // Get more events for the full list
      
      if (error) {
        console.error('Error loading events:', error)
        return
      }

      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event: EventDetail) => {
    setSelectedEvent(event)
    setShowDetail(true)
  }

  const handleBackToList = () => {
    setShowDetail(false)
    setSelectedEvent(null)
  }

  const toggleAttendance = async (eventId: string) => {
    const wasAttending = isAttending(eventId)
    const attendeeDelta = wasAttending ? -1 : 1
    
    // Optimistically update the event's attendee count in local state
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, current_attendees: Math.max(0, event.current_attendees + attendeeDelta) }
        : event
    ))
    
    // Also update selectedEvent if it's the current event
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(prev => prev ? {
        ...prev,
        current_attendees: Math.max(0, prev.current_attendees + attendeeDelta)
      } : null)
    }
    
    // Update attendance status
    let success = false
    if (wasAttending) {
      success = await leaveEvent(eventId)
    } else {
      success = await joinEvent(eventId)
    }
    
    // Revert optimistic update if the operation failed
    if (!success) {
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, current_attendees: Math.max(0, event.current_attendees - attendeeDelta) }
          : event
      ))
      
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(prev => prev ? {
          ...prev,
          current_attendees: Math.max(0, prev.current_attendees - attendeeDelta)
        } : null)
      }
    }
  }

  const formatEventTime = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null
    
    const dateStr = format(start, "MMM dd, yyyy")
    const timeStr = format(start, "h:mm a")
    const endTimeStr = end ? ` - ${format(end, "h:mm a")}` : ""
    
    return { dateStr, timeStr: timeStr + endTimeStr }
  }

  const getTimeUntilEvent = (startDate: string) => {
    return formatDistanceToNow(new Date(startDate), { addSuffix: true })
  }

  const isEventToday = (startDate: string) => {
    const today = new Date()
    const eventDate = new Date(startDate)
    return eventDate.toDateString() === today.toDateString()
  }

  const isEventPast = (startDate: string) => {
    return new Date(startDate) < new Date()
  }

  const EventTypeIcon = ({ type }: { type: string }) => {
    const Icon = eventTypeIcons[type as keyof typeof eventTypeIcons] || eventTypeIcons.other
    return <Icon className="h-4 w-4" />
  }

  const EventCard = ({ event }: { event: EventDetail }) => {
    const { dateStr, timeStr } = formatEventTime(event.start_date, event.end_date)
    const isPast = isEventPast(event.start_date)
    const isToday = isEventToday(event.start_date)
    const isEventAttending = isAttending(event.id)

    return (
      <motion.div
        id={`event-${event.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all cursor-pointer group border border-transparent hover:border-white/20 dark:hover:border-gray-700/20"
        onClick={() => handleEventClick(event)}
      >
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-lg ${eventTypeColors[event.event_type]} flex-shrink-0`}>
              <EventTypeIcon type={event.event_type} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base group-hover:text-neo-mint dark:group-hover:text-purist-blue transition-colors line-clamp-2">
                {event.title}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`text-xs h-5 px-1.5 ${eventTypeColors[event.event_type]}`}>
                  {event.event_type.replace('_', ' ')}
                </Badge>
                {event.difficulty_level !== 'all' && (
                  <Badge variant="outline" className={`text-xs h-5 px-1.5 ${difficultyColors[event.difficulty_level]}`}>
                    {event.difficulty_level}
                  </Badge>
                )}
                {isToday && (
                  <Badge className="bg-green-500 text-white text-xs h-5 px-1.5">
                    Today
                  </Badge>
                )}
                {isPast && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs h-5 px-1.5">
                    Past
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {!isPast && (
            <Button
              variant={isEventAttending ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleAttendance(event.id)
              }}
              className={`${isEventAttending ? "bg-green-600 hover:bg-green-700" : ""} flex-shrink-0 ml-2 h-7 px-2 text-xs`}
              disabled={attendanceLoading}
            >
              {isEventAttending ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Attending</span>
                  <span className="sm:hidden">✓</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Join</span>
                </>
              )}
            </Button>
          )}
        </div>

        {event.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="truncate">{dateStr}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="truncate">{timeStr}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {event.is_online ? (
                  <>
                    <Globe className="h-3 w-3" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[80px] sm:max-w-[150px]">{event.location}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{event.current_attendees}</span>
                {event.max_attendees && <span>/{event.max_attendees}</span>}
              </div>
            </div>
            
            {!isPast && (
              <span className="text-xs font-medium flex-shrink-0 ml-2">
                {getTimeUntilEvent(event.start_date)}
              </span>
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
              {event.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs h-4 px-1.5 bg-white/20 dark:bg-gray-800/20">
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 2 && (
                <Badge variant="outline" className="text-xs h-4 px-1.5 bg-white/20 dark:bg-gray-800/20">
                  +{event.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 dark:border-gray-800/20 mx-auto my-auto p-3 sm:p-6 rounded-2xl sm:rounded-xl">
        <DialogHeader className="pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
            {showDetail && selectedEvent ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20 h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <Calendar className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                Event Details
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <Calendar className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                Events
                {!loading && (
                  <Badge variant="outline" className="ml-2 bg-white/20 dark:bg-gray-800/20">
                    {filteredEvents.length}
                  </Badge>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden mt-2">
          <AnimatePresence mode="wait">
            {showDetail && selectedEvent ? (
              // Event Detail View
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {/* Event Detail Content */}
                <ScrollArea className="h-[280px] sm:h-[400px] md:h-[500px] pr-2 sm:pr-4">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Event Header */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title with Icon */}
                          <div className="flex items-start gap-2 sm:gap-3 mb-2">
                            <div className={`p-2 sm:p-3 rounded-lg ${eventTypeColors[selectedEvent.event_type]} flex-shrink-0`}>
                              <EventTypeIcon type={selectedEvent.event_type} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">{selectedEvent.title}</h2>
                            </div>
                          </div>
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 ml-10 sm:ml-12">
                            <Badge className={`text-xs ${eventTypeColors[selectedEvent.event_type]}`}>
                              {selectedEvent.event_type.replace('_', ' ')}
                            </Badge>
                            {selectedEvent.difficulty_level !== 'all' && (
                              <Badge variant="outline" className={`text-xs ${difficultyColors[selectedEvent.difficulty_level]}`}>
                                {selectedEvent.difficulty_level}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {!isEventPast(selectedEvent.start_date) && (
                          <Button
                            variant={isAttending(selectedEvent.id) ? "default" : "outline"}
                            onClick={() => toggleAttendance(selectedEvent.id)}
                            className={`${isAttending(selectedEvent.id) ? "bg-green-600 hover:bg-green-700" : ""} flex-shrink-0 text-sm`}
                            size="sm"
                            disabled={attendanceLoading}
                          >
                            {isAttending(selectedEvent.id) ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Attending</span>
                                <span className="sm:hidden">✓</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Join Event</span>
                                <span className="sm:hidden">Join</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {selectedEvent.description && (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {selectedEvent.description}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Event Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                      <Card className="p-3 sm:p-4 bg-white/20 dark:bg-gray-800/20 border-white/20 dark:border-gray-700/20">
                        <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          When
                        </h3>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <div>{formatEventTime(selectedEvent.start_date, selectedEvent.end_date).dateStr}</div>
                          <div>{formatEventTime(selectedEvent.start_date, selectedEvent.end_date).timeStr}</div>
                          <div className="text-muted-foreground">
                            {getTimeUntilEvent(selectedEvent.start_date)}
                          </div>
                        </div>
                      </Card>

                      <Card className="p-3 sm:p-4 bg-white/20 dark:bg-gray-800/20 border-white/20 dark:border-gray-700/20">
                        <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          {selectedEvent.is_online ? (
                            <>
                              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                              Online Event
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                              Location
                            </>
                          )}
                        </h3>
                        <div className="text-xs sm:text-sm">
                          {selectedEvent.is_online ? (
                            <div className="space-y-2">
                              <div>This is an online event</div>
                              {selectedEvent.online_link && (
                                <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                                  <a href={selectedEvent.online_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Join Online
                                  </a>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="break-words">{selectedEvent.location}</div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-3 sm:p-4 bg-white/20 dark:bg-gray-800/20 border-white/20 dark:border-gray-700/20">
                        <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          Attendees
                        </h3>
                        <div className="text-xs sm:text-sm space-y-1">
                          <div>{selectedEvent.current_attendees} attending</div>
                          {selectedEvent.max_attendees && (
                            <div className="text-muted-foreground">
                              Maximum: {selectedEvent.max_attendees}
                            </div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-3 sm:p-4 bg-white/20 dark:bg-gray-800/20 border-white/20 dark:border-gray-700/20">
                        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Event Info</h3>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>{" "}
                            {selectedEvent.event_type.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Level:</span>{" "}
                            {selectedEvent.difficulty_level}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Visibility:</span>{" "}
                            {selectedEvent.is_public ? "Public" : "Private"}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Tags */}
                    {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Tags</h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {selectedEvent.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-white/20 dark:bg-gray-800/20">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-white/10 dark:border-gray-800/10">
                  <p className="text-xs text-muted-foreground order-2 sm:order-1">
                    Event created {formatDistanceToNow(new Date(selectedEvent.created_at), { addSuffix: true })}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 order-1 sm:order-2 self-end sm:self-auto"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            ) : (
              // Events List
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-hidden"
              >
                {/* Search and Filter Bar */}
                <div className="space-y-3 mb-4 px-1 pt-2">
                  {/* Mobile: Search and Filter in same row */}
                  <div className="flex gap-2">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 z-10" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 sm:pl-10 pr-2 sm:pr-4 h-9 sm:h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-white/60 dark:border-gray-600/60 text-sm rounded-lg focus:ring-2 focus:ring-neo-mint/50 dark:focus:ring-purist-blue/50 focus:border-neo-mint/70 dark:focus:border-purist-blue/70 transition-colors shadow-sm"
                      />
                    </div>
                    
                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-9 sm:h-10 px-2 sm:px-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-white/60 dark:border-gray-600/60 hover:bg-white/60 dark:hover:bg-gray-800/60 flex-shrink-0 transition-colors shadow-sm"
                        >
                          <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline ml-1">Filter</span>
                          <ChevronDown className="h-3 w-3 ml-0.5 sm:ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 dark:border-gray-800/20">
                        <DropdownMenuLabel>Event Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {[
                          { key: 'all', label: 'All Events' },
                          { key: 'workshop', label: 'Workshops' },
                          { key: 'webinar', label: 'Webinars' },
                          { key: 'study_group', label: 'Study Groups' },
                          { key: 'competition', label: 'Competitions' },
                          { key: 'social', label: 'Social' }
                        ].map(filter => (
                          <DropdownMenuItem
                            key={filter.key}
                            onClick={() => setFilterType(filter.key)}
                            className={`cursor-pointer ${filterType === filter.key ? 
                              'bg-neo-mint/20 dark:bg-purist-blue/20 text-neo-mint dark:text-purist-blue' : 
                              ''
                            }`}
                          >
                            {filterType === filter.key && <Check className="h-4 w-4 mr-2" />}
                            <span className={filterType !== filter.key ? 'ml-6' : ''}>{filter.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-white/10 dark:bg-gray-800/10 mx-1">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Discover and join English learning events. Click on any event to view details and join the community.
                  </p>
                </div>

                {/* Events List */}
                <ScrollArea className="h-[280px] sm:h-[400px] pr-2 sm:pr-4">
                  <div className="space-y-2 sm:space-y-4">
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/10 dark:bg-gray-800/10">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
                            <div className="flex-1 space-y-1.5 sm:space-y-2">
                              <Skeleton className="h-4 sm:h-5 w-3/4" />
                              <div className="flex gap-1 sm:gap-2">
                                <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                              </div>
                              <Skeleton className="h-3 sm:h-4 w-full" />
                              <div className="flex gap-2 sm:gap-4">
                                <Skeleton className="h-3 w-20 sm:w-24" />
                                <Skeleton className="h-3 w-12 sm:w-16" />
                              </div>
                            </div>
                            <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
                          </div>
                        </div>
                      ))
                    ) : filteredEvents.length > 0 ? (
                      <AnimatePresence mode="wait">
                        {filteredEvents.map((event, index) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-50 mb-3 sm:mb-4" />
                        {searchQuery || filterType !== 'all' ? (
                          <div>
                            <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">No events found</h3>
                            <p className="text-muted-foreground text-xs sm:text-sm">
                              Try adjusting your search or filter criteria
                            </p>
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">No events available</h3>
                            <p className="text-muted-foreground text-xs sm:text-sm">
                              Check back later for new events
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-white/10 dark:border-gray-800/10">
                  <p className="text-xs text-muted-foreground">
                    {searchQuery || filterType !== 'all' ? 
                      `${filteredEvents.length} of ${events.length} events` : 
                      `${events.length} events available`
                    }
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 self-end sm:self-auto"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
