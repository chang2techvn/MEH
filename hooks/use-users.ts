"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import type { Database, UserWithProfile } from '@/types/database'

export interface UserData {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "pending" | "suspended" | "inactive"
  account_status?: "pending" | "approved" | "rejected" | "suspended"
  level: "beginner" | "intermediate" | "advanced"
  joinDate: string
  lastActive: string
  completedChallenges: number
  totalChallenges: number
  avatarUrl?: string
  bio?: string
  location?: string
  phone?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  tags?: string[]
  achievements?: {
    name: string
    date: string
    icon: string
  }[]
  recentActivity?: {
    type: string
    description: string
    date: string
  }[]
  // Additional fields from database
  username?: string
  studentId?: string
  major?: string
  academicYear?: string
  className?: string
  experiencePoints?: number
  streakDays?: number
  points?: number
  // Approval fields
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
}

export function useUsers() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  // Convert database user to UserData format
  const convertToUserData = useCallback((dbUser: UserWithProfile): UserData => {
    const profile = dbUser.profiles

    // Determine status based on account_status and is_active
    let status: UserData['status'] = 'active'
    
    // Check account_status first (new approval system)
    if ((dbUser as any).account_status) {
      switch ((dbUser as any).account_status) {
        case 'pending':
          status = 'pending'
          break
        case 'approved':
          status = dbUser.is_active ? 'active' : 'inactive'
          break
        case 'rejected':
          status = 'inactive'
          break
        case 'suspended':
          status = 'suspended'
          break
        default:
          status = 'active'
      }
    } else {
      // Fallback to old logic for backward compatibility
      if (!dbUser.is_active) {
        status = 'inactive'
      } else if (!dbUser.last_active) {
        status = 'pending'
      }
    }

    // Map proficiency level to our level system
    let level: UserData['level'] = 'beginner'
    if (profile?.proficiency_level) {
      switch (profile.proficiency_level) {
        case 'intermediate':
          level = 'intermediate'
          break
        case 'advanced':
        case 'expert':
          level = 'advanced'
          break
        default:
          level = 'beginner'
      }
    }

    return {
      id: dbUser.id,
      name: dbUser.name || profile?.full_name || 'Unknown User',
      email: dbUser.email,
      role: (dbUser.role || profile?.role || 'student') as UserData['role'],
      status,
      account_status: (dbUser as any).account_status as UserData['account_status'] || 'approved',
      level,
      joinDate: dbUser.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      lastActive: dbUser.last_active || dbUser.last_login || dbUser.created_at || new Date().toISOString(),
      completedChallenges: profile?.completed_challenges || 0,
      totalChallenges: Math.max((profile?.completed_challenges || 0) + 5, 10), // Estimate total challenges
      avatarUrl: dbUser.avatar || profile?.avatar_url || undefined,
      bio: dbUser.bio || profile?.bio || undefined,
      location: profile?.timezone || undefined, // Use timezone as location for now
      username: profile?.username || undefined,
      studentId: dbUser.student_id || profile?.student_id || undefined,
      major: dbUser.major || profile?.major || undefined,
      academicYear: dbUser.academic_year || profile?.academic_year || undefined,
      className: profile?.class_name || undefined,
      experiencePoints: dbUser.experience_points || profile?.experience_points || 0,
      streakDays: dbUser.streak_days || profile?.streak_days || 0,
      points: dbUser.points || 0,
      approved_by: (dbUser as any).approved_by || undefined,
      approved_at: (dbUser as any).approved_at || undefined,
      rejection_reason: (dbUser as any).rejection_reason || undefined,
      tags: [], // Will be implemented later
      achievements: [], // Will be implemented later
      recentActivity: [] // Will be implemented later
    }
  }, [])

  // Fetch users from Supabase
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('users')
        .select(`
          *,
          profiles (*)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      const convertedUsers = (data || []).map(convertToUserData)
      setUsers(convertedUsers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users'
      setError(errorMessage)
      toast({
        title: 'Error fetching users',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, convertToUserData, toast])

  // Add new user
  const addUser = useCallback(async (userData: Partial<UserData>) => {
    try {
      setLoading(true)

      // First create the user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: userData.email!,
          name: userData.name,
          role: userData.role,
          bio: userData.bio,
          major: userData.major,
          academic_year: userData.academicYear,
          student_id: userData.studentId,
          is_active: userData.status !== 'inactive',
          level: 1,
          experience_points: 0,
          points: 0,
          streak_days: 0
        })
        .select()
        .single()

      if (userError) throw userError

      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: newUser.id,
          full_name: userData.name,
          username: userData.username,
          bio: userData.bio,
          role: userData.role,
          proficiency_level: userData.level,
          major: userData.major,
          academic_year: userData.academicYear,
          class_name: userData.className,
          student_id: userData.studentId,
          level: 1,
          experience_points: 0,
          completed_challenges: 0,
          streak_days: 0
        })

      if (profileError) throw profileError

      // Refresh the users list
      await fetchUsers()

      toast({
        title: 'User added successfully',
        description: `${userData.name} has been added to the system.`
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add user'
      toast({
        title: 'Error adding user',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchUsers, toast])

  // Update user
  const updateUser = useCallback(async (userId: string, updates: Partial<UserData>) => {
    try {
      console.log('✏️ Starting update operation for userId:', userId, 'with updates:', updates)
      setLoading(true)

      // Update users table
      const userUpdates: any = {}
      if (updates.name) userUpdates.name = updates.name
      if (updates.email) userUpdates.email = updates.email
      if (updates.role) userUpdates.role = updates.role
      if (updates.bio) userUpdates.bio = updates.bio
      if (updates.major) userUpdates.major = updates.major
      if (updates.academicYear) userUpdates.academic_year = updates.academicYear
      if (updates.studentId) userUpdates.student_id = updates.studentId
      if (updates.status) userUpdates.is_active = updates.status === 'active'
      if (updates.experiencePoints) userUpdates.experience_points = updates.experiencePoints
      if (updates.points) userUpdates.points = updates.points
      if (updates.streakDays) userUpdates.streak_days = updates.streakDays

      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updated_at = new Date().toISOString()
        console.log('✏️ Updating users table with:', userUpdates)
        
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', userId)

        if (userError) {
          console.error('✏️ Users table update error:', userError)
          throw userError
        }
      }

      // Update profiles table
      const profileUpdates: any = {}
      if (updates.name) profileUpdates.full_name = updates.name
      if (updates.username) profileUpdates.username = updates.username
      if (updates.bio) profileUpdates.bio = updates.bio
      if (updates.role) profileUpdates.role = updates.role
      if (updates.level) profileUpdates.proficiency_level = updates.level
      if (updates.major) profileUpdates.major = updates.major
      if (updates.academicYear) profileUpdates.academic_year = updates.academicYear
      if (updates.className) profileUpdates.class_name = updates.className
      if (updates.studentId) profileUpdates.student_id = updates.studentId
      if (updates.experiencePoints) profileUpdates.experience_points = updates.experiencePoints
      if (updates.completedChallenges) profileUpdates.completed_challenges = updates.completedChallenges
      if (updates.streakDays) profileUpdates.streak_days = updates.streakDays
      if (updates.avatarUrl) profileUpdates.avatar_url = updates.avatarUrl

      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString()
        console.log('✏️ Updating profiles table with:', profileUpdates)
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', userId)

        if (profileError) {
          console.error('✏️ Profiles table update error:', profileError)
          throw profileError
        }
      }

      console.log('✏️ Update successful, refreshing users list')
      // Refresh the users list
      await fetchUsers()

      toast({
        title: 'User updated successfully',
        description: 'User information has been updated.'
      })

      console.log('✏️ Update operation completed successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      console.error('✏️ Update operation failed:', errorMessage)
      toast({
        title: 'Error updating user',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchUsers, toast])

  // Add account approval functions
  const approveAccount = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve account')
      }

      // Refresh data
      await fetchUsers()

      toast({
        title: "Account approved",
        description: result.message,
      })

      return true
    } catch (error) {
      console.error('Error approving account:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve account",
        variant: "destructive",
      })
      return false
    }
  }

  const rejectAccount = async (userId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          reason
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject account')
      }

      // Refresh data
      await fetchUsers()

      toast({
        title: "Account rejected",
        description: result.message,
        variant: "destructive",
      })

      return true
    } catch (error) {
      console.error('Error rejecting account:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject account",
        variant: "destructive",
      })
      return false
    }
  }

  const suspendAccount = async (userId: string, reason?: string): Promise<boolean> => {
    try {
      // Update account status to suspended
      const { error } = await supabase
        .from('users')
        .update({ 
          account_status: 'suspended',
          is_active: false,
          rejection_reason: reason 
        })
        .eq('id', userId)

      if (error) throw error

      // Refresh data
      await fetchUsers()

      toast({
        title: "Account suspended",
        description: "User account has been suspended",
        variant: "destructive",
      })

      return true
    } catch (error) {
      console.error('Error suspending account:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend account",
        variant: "destructive",
      })
      return false
    }
  }

  const getPendingApprovals = async (): Promise<{ count: number; users: any[] }> => {
    try {
      const response = await fetch('/api/admin/pending-approvals')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get pending approvals')
      }

      return {
        count: result.pendingCount || 0,
        users: result.pendingUsers || []
      }
    } catch (error) {
      console.error('Error getting pending approvals:', error)
      return { count: 0, users: [] }
    }
  }
  const deleteUser = useCallback(async (userId: string) => {
    try {
      console.log('🗑️ Starting delete operation for userId:', userId)
      setLoading(true)

      console.log('🗑️ Calling admin API to delete user completely...')
      
      // Call our API route to delete user from all systems
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })

      const result = await response.json()
      console.log('🗑️ API delete result:', result)

      if (!response.ok) {
        throw new Error(result.error || `API error: ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Delete operation failed')
      }

      console.log('🗑️ Delete successful, refreshing users list')
      // Refresh the users list
      await fetchUsers()

      toast({
        title: 'User deleted successfully',
        description: result.message || 'User has been completely removed from all systems.'
      })

      console.log('🗑️ Delete operation completed successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      console.error('🗑️ Delete operation failed:', errorMessage)
      toast({
        title: 'Error deleting user',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchUsers, toast])

  // Bulk operations
  const bulkUpdateUsers = useCallback(async (userIds: string[], updates: Partial<UserData>) => {
    try {
      setLoading(true)

      // Update users table
      const userUpdates: any = {}
      if (updates.role) userUpdates.role = updates.role
      if (updates.status !== undefined) userUpdates.is_active = updates.status === 'active'
      
      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updated_at = new Date().toISOString()
        
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .in('id', userIds)

        if (userError) throw userError
      }

      // Update profiles table
      const profileUpdates: any = {}
      if (updates.role) profileUpdates.role = updates.role
      if (updates.level) profileUpdates.proficiency_level = updates.level

      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString()
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .in('user_id', userIds)

        if (profileError) throw profileError
      }

      // Refresh the users list
      await fetchUsers()

      toast({
        title: 'Bulk update completed',
        description: `${userIds.length} users have been updated.`
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update users'
      toast({
        title: 'Error updating users',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchUsers, toast])

  const bulkDeleteUsers = useCallback(async (userIds: string[]) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', userIds)

      if (error) throw error

      // Refresh the users list
      await fetchUsers()

      toast({
        title: 'Bulk delete completed',
        description: `${userIds.length} users have been deleted.`
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete users'
      toast({
        title: 'Error deleting users',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchUsers, toast])

  // Subscribe to real-time updates
  useEffect(() => {
    fetchUsers()

    // Set up real-time subscription for users table
    const usersSubscription = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users' 
        }, 
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    // Set up real-time subscription for profiles table
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles' 
        }, 
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(usersSubscription)
      supabase.removeChannel(profilesSubscription)
    }
  }, [fetchUsers, supabase])

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
    bulkDeleteUsers,
    approveAccount,
    rejectAccount,
    suspendAccount,
    getPendingApprovals,
    refetch: fetchUsers
  }
}
