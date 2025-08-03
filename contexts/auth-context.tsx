"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Define user type that matches your database schema
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  background_url?: string
  role?: string
  studentId?: string
  major?: string
  academicYear?: string
  className?: string // Added for class_name from database
  bio?: string
  points?: number
  level?: number
  experiencePoints?: number
  streakDays?: number
  lastActive?: Date
  joinedAt?: Date
  isActive?: boolean
  preferences?: any
}

// Split contexts for better performance
interface AuthStateContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActionsContextType {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setNewPassword: (token: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

// Create separate contexts
const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined)
const AuthActionsContext = createContext<AuthActionsContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          // Fetch user data from profiles table first
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()

            if (profileData && !profileError) {
              // Use profile data from database
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profileData.full_name || session.user.email?.split('@')[0],
                avatar: profileData.avatar_url,
                background_url: profileData.background_url,
                role: profileData.role || 'student',
                major: profileData.major,
                academicYear: profileData.academic_year,
                className: profileData.class_name,
                studentId: profileData.student_id,
                bio: profileData.bio,
                level: profileData.level || 1,
                streakDays: profileData.streak_days || 0,
                experiencePoints: profileData.experience_points || 0,
                isActive: true,
                joinedAt: new Date(session.user.created_at),
                lastActive: new Date(),
              }
              setUser(userData)
            } else {
              // Profile not found, try getUserFromDatabase to let trigger create it
              await getUserFromDatabase(session.user)
            }
          } catch (error) {
            console.log('Error fetching profile data, trying getUserFromDatabase:', error)
            // Fallback to getUserFromDatabase
            await getUserFromDatabase(session.user)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user data from profiles table first
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()

            if (profileData && !profileError) {
              // Use profile data from database
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profileData.full_name || session.user.email?.split('@')[0],
                avatar: profileData.avatar_url,
                background_url: profileData.background_url,
                role: profileData.role || 'student',
                major: profileData.major,
                academicYear: profileData.academic_year,
                className: profileData.class_name,
                studentId: profileData.student_id,
                bio: profileData.bio,
                level: profileData.level || 1,
                streakDays: profileData.streak_days || 0,
                experiencePoints: profileData.experience_points || 0,
                isActive: true,
                joinedAt: new Date(session.user.created_at),
                lastActive: new Date(),
              }
              setUser(userData)
            } else {
              // Profile not found, let getUserFromDatabase handle trigger
              console.log('Profile not found on sign in, waiting for trigger...')
              await getUserFromDatabase(session.user)
            }
          } catch (error) {
            console.log('Error fetching profile data on sign in, trying getUserFromDatabase:', error)
            await getUserFromDatabase(session.user)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])
  // Helper function to get user from database (trigger will create if needed)
  const getUserFromDatabase = async (supabaseUser: SupabaseUser) => {
    try {
      // First, wait a moment for trigger to complete if user just signed up
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Try to get user from profiles table first (has more complete data)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()

      if (profileData && !profileError) {
        // Use profile data (more complete)
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profileData.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
          avatar: profileData.avatar_url || supabaseUser.user_metadata?.avatar_url,
          background_url: profileData.background_url,
          role: profileData.role || 'student',
          major: profileData.major,
          academicYear: profileData.academic_year,
          className: profileData.class_name,
          studentId: profileData.student_id,
          bio: profileData.bio,
          level: profileData.level || 1,
          streakDays: profileData.streak_days || 0,
          experiencePoints: profileData.experience_points || 0,
          isActive: true,
          joinedAt: new Date(profileData.created_at || supabaseUser.created_at),
          lastActive: new Date(),
          preferences: {}
        }
        setUser(userData)
        return userData
      }

      // If profile not found, check users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (userData && !userError) {
        // Use users table data as fallback
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
          avatar: userData.avatar || supabaseUser.user_metadata?.avatar_url,
          role: userData.role || 'student',
          isActive: userData.is_active || true,
          joinedAt: new Date(userData.created_at || supabaseUser.created_at),
          lastActive: new Date(userData.last_login || new Date()),
          bio: userData.bio,
          points: userData.points,
          level: userData.level || 1,
          experiencePoints: userData.experience_points || 0,
          streakDays: userData.streak_days || 0,
          preferences: userData.preferences || {}
        }
        setUser(user)
        return user
      }
      
      // If neither found, wait a bit more for triggers to complete
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Try profiles again
      const { data: retryProfileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()
        
      if (retryProfileData) {
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: retryProfileData.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
          avatar: retryProfileData.avatar_url || supabaseUser.user_metadata?.avatar_url,
          background_url: retryProfileData.background_url,
          role: retryProfileData.role || 'student',
          major: retryProfileData.major,
          academicYear: retryProfileData.academic_year,
          className: retryProfileData.class_name,
          studentId: retryProfileData.student_id,
          bio: retryProfileData.bio,
          level: retryProfileData.level || 1,
          streakDays: retryProfileData.streak_days || 0,
          experiencePoints: retryProfileData.experience_points || 0,
          isActive: true,
          joinedAt: new Date(retryProfileData.created_at || supabaseUser.created_at),
          lastActive: new Date(),
          preferences: {}
        }
        setUser(userData)
        return userData
      }
      
      return null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // Login function
  const login = useCallback(async (email: string, password: string, remember = false) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Login successful",
        description: `Welcome back!`,
      })

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)    }
  }, [router])

  // Register function
  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        })
      } else if (data.session) {
        toast({
          title: "Registration successful",
          description: `Welcome to EnglishMastery, ${name}!`,
        })
        router.push("/")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      throw error    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures logout from all sessions
      })
      if (error) {
        console.error('Logout error:', error)
      }
      
      // Clear local state
      setUser(null)
      
      // Clear any potential cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage/sessionStorage if needed
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/")    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [router])

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Reset link sent",
        description: "Check your email for instructions to reset your password.",
      })
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: error.message || "There was a problem sending the reset link. Please try again.",
        variant: "destructive",
      })
      throw error    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set new password function
  const setNewPassword = useCallback(async (token: string, password: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })

      router.push("/")
    } catch (error: any) {
      console.error("Set new password error:", error)
      toast({
        title: "Error",
        description: error.message || "There was an error updating your password. Please try again.",
        variant: "destructive",
      })
      throw error    } finally {
      setIsLoading(false)
    }
  }, [router])

  // OAuth login functions
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      })

      if (error) {
        throw error
      }

      toast({
        title: "Redirecting to Google",
        description: "Please wait while we redirect you to Google...",
      })
    } catch (error: any) {
      console.error("Google login error:", error)
      toast({
        title: "Google login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      throw error    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithFacebook = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      toast({
        title: "Redirecting to Facebook",
        description: "Please wait while we redirect you to Facebook...",
      })
    } catch (error: any) {
      console.error("Facebook login error:", error)
      toast({
        title: "Facebook login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      throw error    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGitHub = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      toast({
        title: "Redirecting to GitHub",
        description: "Please wait while we redirect you to GitHub...",
      })    } catch (error: any) {
      console.error("GitHub login error:", error)
      toast({
        title: "GitHub login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      throw error    } finally {
      setIsLoading(false)
    }
  }, [])
  // Memoize state and actions separately to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
  }), [user, isLoading])

  // Update user function
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData && !error) {
        const updatedUser: User = {
          ...user,
          name: profileData.full_name || user.name,
          avatar: profileData.avatar_url,
          background_url: profileData.background_url,
          bio: profileData.bio,
          role: profileData.role || user.role || 'student',
          major: profileData.major,
          academicYear: profileData.academic_year,
          className: profileData.class_name,
          studentId: profileData.student_id,
          level: profileData.level || user.level || 1,
          streakDays: profileData.streak_days || user.streakDays || 0,
          experiencePoints: profileData.experience_points || user.experiencePoints || 0,
        }
        setUser(updatedUser)
        console.log('🔄 User data refreshed with profile:', updatedUser)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }, [user])

  const authActions = useMemo(() => ({
    login,
    register,
    logout,
    resetPassword,
    setNewPassword,
    loginWithGoogle,
    loginWithFacebook,
    loginWithGitHub,
    updateUser,
    refreshUser,
  }), [login, register, logout, resetPassword, setNewPassword, loginWithGoogle, loginWithFacebook, loginWithGitHub, updateUser, refreshUser])

  return (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

// Custom hooks to use auth contexts
export function useAuthState() {
  const context = useContext(AuthStateContext)
  if (context === undefined) {
    throw new Error("useAuthState must be used within an AuthProvider")
  }
  return context
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext)
  if (context === undefined) {
    throw new Error("useAuthActions must be used within an AuthProvider")
  }
  return context
}

// Backward compatibility hook (use separate hooks when possible)
export function useAuth() {
  const state = useAuthState()
  const actions = useAuthActions()
  
  return {
    ...state,
    ...actions,
  }
}
