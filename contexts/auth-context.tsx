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
                role: 'MEMBER',
                bio: profileData.bio,
                level: profileData.level || 1,
                streakDays: profileData.streak_days || 0,
                experiencePoints: profileData.experience_points || 0,
                isActive: true,
                joinedAt: new Date(session.user.created_at),
                lastActive: new Date(),
              }
              console.log('🎨 Auth Context - Setting user with avatar:', {
                name: userData.name,
                avatar: userData.avatar,
                level: userData.level,
                streakDays: userData.streakDays,
                profileData: profileData
              })
              setUser(userData)
            } else {
              // Fallback to auth user data if profile not found
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                avatar: session.user.user_metadata?.avatar_url,
                role: 'MEMBER',
                isActive: true,
                joinedAt: new Date(session.user.created_at),
                lastActive: new Date(),
              }
              setUser(userData)
            }
          } catch (error) {
            console.log('Error fetching profile data, using auth data:', error)
            // Fallback to auth user data
            const userData: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar: session.user.user_metadata?.avatar_url,
              role: 'MEMBER',
              isActive: true,
              joinedAt: new Date(session.user.created_at),
              lastActive: new Date(),
            }
            setUser(userData)
          }
          
          // Try to sync with database, but don't fail if it doesn't work
          try {
            await createUserInDatabase(session.user)
          } catch (error) {
            console.log('Database sync failed, continuing with existing user:', error)
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
        console.log('Auth state changed:', event, session?.user?.email)
        
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
                role: 'MEMBER',
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
              // Fallback to auth user data if profile not found
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                avatar: session.user.user_metadata?.avatar_url,
                role: 'MEMBER',
                isActive: true,
                joinedAt: new Date(session.user.created_at),
                lastActive: new Date(),
              }
              setUser(userData)
            }
          } catch (error) {
            console.log('Error fetching profile data on sign in, using auth data:', error)
            // Fallback to auth user data
            const userData: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar: session.user.user_metadata?.avatar_url,
              role: 'MEMBER',
              isActive: true,
              joinedAt: new Date(session.user.created_at),
              lastActive: new Date(),
            }
            setUser(userData)
          }
          
          // Try to sync with database in background
          try {
            await createUserInDatabase(session.user)
          } catch (error) {
            console.log('Database sync failed:', error)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])
  // Helper function to create user in database
  const createUserInDatabase = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: supabaseUser.id, // Supabase auth ID is already a UUID
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
          avatar: supabaseUser.user_metadata?.avatar_url,
          role: 'student', // Default role
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single()

      if (error && error.code !== '23505') { // 23505 is unique violation (user already exists)
        console.error('Error creating user in database:', error)
        return null
      }

      // Update user state with database data if successful
      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name || undefined,
          avatar: data.avatar || undefined,
          role: data.role || undefined,
          isActive: data.is_active || true,
          joinedAt: new Date(data.created_at || supabaseUser.created_at),          lastActive: new Date(data.last_login || new Date()),
          bio: data.bio || undefined,
          points: data.points || undefined,
          level: data.level || undefined,
          experiencePoints: data.experience_points || undefined,
          streakDays: data.streak_days || undefined,
          preferences: data.preferences || undefined
        })
        return data
      }
      return null
    } catch (error) {
      console.error('Error creating user:', error)
      // Don't throw error, just log it
      return null
    }  }

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
        }
        setUser(updatedUser)
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
