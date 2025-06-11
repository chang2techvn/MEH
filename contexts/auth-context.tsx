"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setNewPassword: (token: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  loginWithGitHub: () => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
          // For now, just use Supabase auth user data
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
          
          // Try to sync with database, but don't fail if it doesn't work
          try {
            await createUserInDatabase(session.user)
          } catch (error) {
            console.log('Database sync failed, continuing with auth-only user:', error)
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
          // Create user data from Supabase auth
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
          role: 'MEMBER',
          isActive: true,
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user in database:', error)
        // Don't throw error, just log it
        return null
      }

      // Update user state with database data if successful
      if (data) {        setUser({
          id: data.id,
          email: data.email,
          name: data.name || undefined,
          avatar: data.avatar || undefined,
          role: data.role || undefined,
          studentId: data.student_id || undefined,
          major: data.major || undefined,
          academicYear: data.academic_year || undefined,
          bio: data.bio || undefined,
          points: data.points || undefined,
          level: data.level || undefined,
          experiencePoints: data.experience_points || undefined,
          streakDays: data.streak_days || undefined,
          lastActive: data.last_active ? new Date(data.last_active) : undefined,
          joinedAt: data.created_at ? new Date(data.created_at) : undefined,
          isActive: data.is_active || undefined,
          preferences: data.preferences || undefined
        })
        return data
      }
      return null
    } catch (error) {
      console.error('Error creating user:', error)
      // Don't throw error, just log it
      return null
    }
  }

  // Login function
  const login = async (email: string, password: string, remember = false) => {
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
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
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
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
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
      router.push("/")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
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
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Set new password function
  const setNewPassword = async (token: string, password: string) => {
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
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // OAuth login functions
  const loginWithGoogle = async () => {
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
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithFacebook = async () => {
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
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async () => {
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
      })
    } catch (error: any) {
      console.error("GitHub login error:", error)
      toast({
        title: "GitHub login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        resetPassword,
        setNewPassword,
        loginWithGoogle,
        loginWithFacebook,
        loginWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
