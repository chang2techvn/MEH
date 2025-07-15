"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  status: 'attending' | 'not_attending' | 'maybe'
  joined_at: string
  attended: boolean
  created_at: string
  updated_at: string
}

export function useEventAttendance() {
  const { user } = useAuth()
  const [attendingEvents, setAttendingEvents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Load user's attending events on mount
  useEffect(() => {
    if (user) {
      loadUserAttendingEvents()
    }
  }, [user])

  const loadUserAttendingEvents = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('status', 'attending')

      if (error) {
        console.error('Error loading attending events:', error)
        return
      }

      const eventIds = new Set(data?.map(item => item.event_id) || [])
      setAttendingEvents(eventIds)
    } catch (error) {
      console.error('Error loading attending events:', error)
    }
  }

  const joinEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join events",
        variant: "destructive"
      })
      return false
    }

    try {
      setLoading(true)

      // Check if user is already attending
      const { data: existing } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update status to attending if record exists
        const { error } = await supabase
          .from('event_attendees')
          .update({ 
            status: 'attending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Create new attendance record
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'attending',
            joined_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Update local state optimistically
      setAttendingEvents(prev => new Set([...prev, eventId]))

      // Note: Event attendee count is updated optimistically in the UI
      // and will be synced with the database on next page load

      toast({
        title: "Joined event successfully!",
        description: "You'll receive notifications about this event",
      })

      return true
    } catch (error) {
      console.error('Error joining event:', error)
      toast({
        title: "Failed to join event",
        description: "Please try again later",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const leaveEvent = async (eventId: string) => {
    if (!user) return false

    try {
      setLoading(true)

      // Update status to not_attending (keep record for history)
      const { error } = await supabase
        .from('event_attendees')
        .update({ 
          status: 'not_attending',
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state optimistically
      setAttendingEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })

      // Note: Event attendee count is updated optimistically in the UI
      // and will be synced with the database on next page load

      toast({
        title: "Left event successfully",
        description: "You can join again anytime",
      })

      return true
    } catch (error) {
      console.error('Error leaving event:', error)
      toast({
        title: "Failed to leave event",
        description: "Please try again later",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateEventAttendeeCount = async (eventId: string) => {
    try {
      // Count current attendees
      const { count, error: countError } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'attending')

      if (countError) throw countError

      // Update event's current_attendees
      const { error: updateError } = await supabase
        .from('events')
        .update({ current_attendees: count || 0 })
        .eq('id', eventId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error updating attendee count:', error)
    }
  }

  const getEventAttendees = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          users:user_id (
            id,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'attending')
        .order('joined_at', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching event attendees:', error)
      return []
    }
  }

  const isAttending = (eventId: string) => {
    return attendingEvents.has(eventId)
  }

  return {
    attendingEvents,
    loading,
    joinEvent,
    leaveEvent,
    getEventAttendees,
    isAttending,
    refreshAttendingEvents: loadUserAttendingEvents
  }
}
