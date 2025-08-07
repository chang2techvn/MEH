"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Search,
  MoreVertical,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Hash,
  X,
} from "lucide-react"
import { ContactItem } from "./contact-item"
import { ContactSkeleton } from "./contact-skeleton"
import { EventCard } from "./event-card"
import { EventSkeleton } from "./event-skeleton"
import { EventsModal } from "./events-modal"
import { MessagesModal } from "@/components/messages/messages-modal"
import type { Contact, Event } from "./types"

interface RightSidebarProps {
  showRightSidebar: boolean
  setShowRightSidebar: (show: boolean) => void
  contacts: Contact[]
  events: Event[]
  loading: boolean
}

export function RightSidebar({
  showRightSidebar,
  setShowRightSidebar,
  contacts,
  events,
  loading,
}: RightSidebarProps) {
  const [showEventsModal, setShowEventsModal] = useState(false)
  const [highlightEventId, setHighlightEventId] = useState<string | undefined>(undefined)
  const [showMessagesModal, setShowMessagesModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [contactSearchTerm, setContactSearchTerm] = useState("")
  const [showContactSearch, setShowContactSearch] = useState(false)

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm.trim()) {
      return contacts
    }
    
    const searchLower = contactSearchTerm.toLowerCase().trim()
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchLower)
    )
  }, [contacts, contactSearchTerm])

  const handleMessageClick = (userId: string, userName: string) => {
    setSelectedUserId(userId)
    setShowMessagesModal(true)
  }

  const handleEventClick = (eventId: number) => {
    setHighlightEventId(eventId.toString())
    setShowEventsModal(true)
  }

  const handleSeeAllEvents = () => {
    setHighlightEventId(undefined)
    setShowEventsModal(true)
  }
  return (
    <aside
      className={`
        fixed inset-0 z-50 lg:static lg:z-auto lg:w-[280px] xl:w-[320px] 2xl:w-[360px] lg:order-3
        lg:ml-auto lg:mr-0
        ${showRightSidebar ? "block" : "hidden lg:block"}
      `}
    >
      {/* Mobile overlay background */}
      {showRightSidebar && (
        <div
          className="absolute inset-0 bg-black/50 lg:hidden"
          onClick={() => setShowRightSidebar(false)}
        ></div>
      )}

      <div
        className={`
          relative h-full w-[280px] sm:w-[320px] lg:w-full 
          bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
          overflow-auto lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)]
        `}
      >
        {/* Mobile header */}
        {showRightSidebar && (
          <div className="p-4 flex justify-between items-center border-b lg:hidden">
            <h2 className="font-semibold">Contacts & Events</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowRightSidebar(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <ScrollArea className="h-full py-4 2xl:py-6 px-4 lg:px-0">
          <div className="space-y-4 sm:space-y-6 2xl:space-y-8">
            {/* Contacts Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 2xl:p-6 h-[320px] sm:h-[400px] 2xl:h-[480px] flex flex-col">
              <div className="flex items-center justify-between mb-3 sm:mb-4 2xl:mb-6 flex-shrink-0">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base 2xl:text-lg">
                  Contacts
                </h3>
                <div className="flex gap-1 2xl:gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 sm:h-8 sm:w-8 2xl:h-9 2xl:w-9 rounded-full"
                    onClick={() => setShowContactSearch(!showContactSearch)}
                  >
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 2xl:h-5 2xl:w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 2xl:h-9 2xl:w-9 rounded-full">
                    <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 2xl:h-5 2xl:w-5" />
                  </Button>
                </div>
              </div>

              {/* Search Input - Show/Hide based on state */}
              <div className={`transition-all duration-200 flex-shrink-0 ${showContactSearch ? 'mb-3 sm:mb-4 2xl:mb-6' : 'mb-0'}`}>
                {showContactSearch && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search contacts..."
                      value={contactSearchTerm}
                      onChange={(e) => setContactSearchTerm(e.target.value)}
                      className="pl-10 h-8 sm:h-9 2xl:h-10 text-xs sm:text-sm 2xl:text-base"
                      autoFocus
                    />
                    {contactSearchTerm && (
                      <div
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center cursor-pointer"
                        onClick={() => setContactSearchTerm("")}
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1 scrollbar-auto-hide">
                <div className="space-y-1 sm:space-y-2 2xl:space-y-3">
                  {loading
                    ? Array(5)
                        .fill(0)
                        .map((_, i) => <ContactSkeleton key={i} />)
                    : filteredContacts.length > 0 
                      ? filteredContacts.map((contact) => (
                          <ContactItem
                            key={contact.id}
                            contact={contact}
                            onMessageClick={handleMessageClick}
                          />
                        ))
                      : contactSearchTerm && (
                          <div className="flex items-center justify-center h-32">
                            <div className="text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                              No contacts found matching "{contactSearchTerm}"
                            </div>
                          </div>
                        )}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 2xl:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4 2xl:mb-6">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base 2xl:text-lg">
                  Upcoming Events
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-3 2xl:space-y-4 max-h-[240px] sm:max-h-[320px] 2xl:max-h-[400px] overflow-y-auto pr-1 scrollbar-auto-hide">
                {loading
                  ? Array(2)
                      .fill(0)
                      .map((_, i) => <EventSkeleton key={i} />)
                  : events.map((event) => (
                      <div key={event.id} onClick={() => handleEventClick(event.id)}>
                        <EventCard
                          title={event.title}
                          date={event.date}
                          time={event.time}
                          location={event.location}
                          attendees={event.attendees}
                          badge={event.badge}
                        />
                      </div>
                    ))}
              </div>

              <Button 
                variant="ghost" 
                className="w-full justify-start text-xs sm:text-sm 2xl:text-base mt-2 sm:mt-3 2xl:mt-4 2xl:p-3"
                onClick={handleSeeAllEvents}
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 2xl:h-5 2xl:w-5 mr-1 sm:mr-2 2xl:mr-3" />
                See All Events
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
      
      <EventsModal 
        isOpen={showEventsModal} 
        onClose={() => setShowEventsModal(false)}
        highlightEventId={highlightEventId}
      />
      
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
      />
    </aside>
  )
}
