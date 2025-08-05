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
  accountStatus?: 'pending' | 'approved' | 'rejected' | 'suspended'
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

  // Helper function to persist user to localStorage
  const persistUser = useCallback((userData: User | null) => {
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('user_data', JSON.stringify(userData))
      } else {
        localStorage.removeItem('user_data')
      }
    }
    setUser(userData)
  }, [])

  // Initialize auth state from Supabase - simplified for UI only
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setIsLoading(false)
          return
        }

        if (session?.user) {
          await getUserFromDatabase(session.user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes - simplified
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await getUserFromDatabase(session.user)
        } else if (event === 'SIGNED_OUT') {
          persistUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])
  // Helper function to get user from database - UI only, no permission checks
  const getUserFromDatabase = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user data from profiles and users tables
      const [profileData, userRecord] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', supabaseUser.id).single(),
        supabase.from('users').select('role, account_status, is_active').eq('id', supabaseUser.id).single()
      ])

      // Use profile data if available, otherwise use user data
      const profile = profileData.data
      const userInfo = userRecord.data

      if (profile || userInfo) {
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
          avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
          background_url: profile?.background_url,
          role: userInfo?.role || profile?.role || 'student',
          major: profile?.major,
          academicYear: profile?.academic_year,
          className: profile?.class_name,
          studentId: profile?.student_id,
          bio: profile?.bio,
          level: profile?.level || 1,
          streakDays: profile?.streak_days || 0,
          experiencePoints: profile?.experience_points || 0,
          isActive: userInfo?.is_active !== false,
          accountStatus: userInfo?.account_status || 'approved',
          joinedAt: new Date(profile?.created_at || supabaseUser.created_at),
          lastActive: new Date(),
          preferences: {}
        }
        persistUser(userData)
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

      // Check for redirect parameter in URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirect')
      
      // Redirect to specified page or home
      router.push(redirectTo || "/")
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
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
      persistUser(null)
      
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
    setUser(prev => {
      const updatedUser = prev ? { ...prev, ...userData } : null
      if (updatedUser && typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updatedUser))
      }
      return updatedUser
    })
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
