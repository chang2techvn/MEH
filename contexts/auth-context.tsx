"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Simplified User type for UI
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
  accountStatus?: 'pending' | 'approved' | 'rejected' | 'suspended'
  isActive?: boolean
  bio?: string
  level?: number
  points?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Helper to persist user
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

  // Get user data from database
  const getUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const [profileData, userRecord] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, role').eq('user_id', supabaseUser.id).single(),
        supabase.from('users').select('role, account_status, is_active').eq('id', supabaseUser.id).single()
      ])

      const profile = profileData.data
      const userInfo = userRecord.data

      if (profile || userInfo) {
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profile?.full_name || supabaseUser.email?.split('@')[0],
          avatar: profile?.avatar_url,
          role: userInfo?.role || profile?.role || 'student',
          accountStatus: userInfo?.account_status || 'approved',
          isActive: userInfo?.is_active !== false
        }
        persistUser(userData)
        return userData
      }
    } catch (error) {
      console.error('Error getting user data:', error)
    }
    return null
  }

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session from cookies
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (session?.user) {
          await getUserData(session.user)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {      
      if (event === 'SIGNED_IN' && session?.user) {
        await getUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        persistUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Force refresh session to ensure cookies are set
      await supabase.auth.refreshSession()

      toast({ title: "Login successful", description: "Welcome back!" })
      
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirect')
      router.push(redirectTo || "/")
    } catch (error: any) {
      console.error('❌ Login error:', error)
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
      persistUser(null)
      toast({ title: "Logged out", description: "You have been logged out." })
      router.push("/")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [router])

  // Update user function
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...userData } : null
      if (updated && typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updated))
      }
      return updated
    })
  }, [])

  // Register function
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      })

      if (error) throw error

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      })

      router.push("/auth/login")
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Social login functions (placeholder implementations)
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/callback`
        }
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Google login error:', error)
      toast({
        title: "Login failed",
        description: error.message || "Failed to login with Google",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithFacebook = useCallback(async () => {
    toast({
      title: "Coming soon",
      description: "Facebook login is not implemented yet",
    })
  }, [])

  const loginWithGitHub = useCallback(async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/callback`
        }
      })
      if (error) throw error
    } catch (error: any) {
      console.error('GitHub login error:', error)
      toast({
        title: "Login failed",
        description: error.message || "Failed to login with GitHub",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      toast({
        title: "Reset email sent",
        description: "Please check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh user function
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (supabaseUser) {
        const userData = await getUserData(supabaseUser)
        persistUser(userData)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }, [getUserData, persistUser])

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithGitHub,
    resetPassword,
    refreshUser,
  }), [user, isLoading, login, logout, updateUser, register, loginWithGoogle, loginWithFacebook, loginWithGitHub, resetPassword, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// Backward compatibility exports
export const useAuthState = useAuth
export const useAuthActions = useAuth
