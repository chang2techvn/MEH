"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { clearBrowserAuthCache, isJWTError, createCleanSupabaseSession } from "@/lib/auth-utils"
import { saveSession, getStoredSession, clearStoredSession, saveUserData, getStoredUserData, isSessionValid } from "@/lib/session-utils"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Simplified User type for UI
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  background_url?: string
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
        saveUserData(userData)
      } else {
        clearStoredSession()
      }
    }
    setUser(userData)
  }, [])

  // Clear all auth data helper
  const clearAllAuthData = useCallback(async () => {
    try {
      // Use the utility function for comprehensive cleanup
      await createCleanSupabaseSession(supabase)
      
      // Clear state
      setUser(null)
    } catch (error) {
      console.error('Error clearing auth data:', error)
      // Fallback manual cleanup
      clearBrowserAuthCache()
      setUser(null)
    }
  }, [])

  // Get user data from database
  const getUserData = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔄 Auth Context: Fetching user data for', supabaseUser.email)
      
      const [profileData, userRecord] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, background_url, role').eq('user_id', supabaseUser.id).maybeSingle(),
        supabase.from('users').select('role, account_status, is_active').eq('id', supabaseUser.id).maybeSingle()
      ])

      console.log('🔍 Auth Context Query Results:', {
        profileError: profileData.error?.message,
        profileData: profileData.data,
        userError: userRecord.error?.message,
        userData: userRecord.data
      })

      const profile = profileData.data
      const userInfo = userRecord.data

      if (profile || userInfo) {
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profile?.full_name || supabaseUser.email?.split('@')[0],
          avatar: profile?.avatar_url,
          background_url: profile?.background_url,
          role: userInfo?.role || profile?.role || 'student',
          accountStatus: userInfo?.account_status || 'approved',
          isActive: userInfo?.is_active !== false
        }
        
        console.log('✅ Auth Context: User data created successfully:', userData)
        persistUser(userData)
        return userData
      } else {
        console.warn('⚠️ Auth Context: No profile or user data found')
        // Create basic user data from auth info
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.email?.split('@')[0],
          role: 'student',
          accountStatus: 'approved',
          isActive: true
        }
        persistUser(userData)
        return userData
      }
    } catch (error) {
      console.error('❌ Auth Context: Error getting user data:', error)
      // Create fallback user data
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.email?.split('@')[0],
        role: 'student',
        accountStatus: 'approved',
        isActive: true
      }
      persistUser(userData)
      return userData
    }
  }, [persistUser, supabase])

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing auth...')
        
        // First check for stored session
        const storedSession = getStoredSession()
        const storedUser = getStoredUserData()
        
        if (storedUser && storedSession && isSessionValid(storedSession)) {
          console.log('✅ Using stored session and user data')
          setUser(storedUser)
          setIsLoading(false)
          return
        }
        
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          // If there's an error (like expired JWT), clear auth data
          if (isJWTError(error)) {
            console.warn('JWT token expired or invalid, clearing auth data')
            await clearAllAuthData()
          } else {
            console.error('Session error:', error)
          }
        } else if (session?.user) {
          console.log('✅ Found valid session, getting user data')
          saveSession(session)
          await getUserData(session.user)
        } else {
          console.log('ℹ️ No active session found')
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
        await clearAllAuthData()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Refresh user data when token is refreshed
        console.log('✅ Token refreshed, updating user data')
        await getUserData(session.user)
      }
    })

    // Auto-refresh session every 30 minutes to prevent expiration
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Refresh the session
          await supabase.auth.refreshSession()
        }
      } catch (error) {
        console.error('Session refresh error:', error)
      }
    }, 30 * 60 * 1000) // 30 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [clearAllAuthData, getUserData, persistUser])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    console.log('🔐 Auth Context: Starting login for', email)
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('❌ Auth Context: SignIn error:', error)
        setIsLoading(false)
        throw error
      }

      console.log('✅ Auth Context: SignIn successful for', data.user.email)

      // Save session immediately
      if (data.session) {
        saveSession(data.session)
      }

      // Check user account status with better error handling
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('account_status, is_active')
          .eq('id', data.user.id)
          .maybeSingle()

        if (userError) {
          console.error('⚠️ Auth Context: Error checking user status:', userError)
          // Don't block login for user status check errors, just log them
        } else if (userData) {
          console.log('📋 Auth Context: User status check:', userData)
          
          // Only block if explicitly rejected or suspended
          if (userData.account_status === 'rejected') {
            await supabase.auth.signOut()
            setIsLoading(false)
            toast({
              title: "Account rejected",
              description: "Your account has been rejected. Please contact support.",
              variant: "destructive",
            })
            throw new Error('Account rejected')
          } else if (userData.account_status === 'suspended') {
            await supabase.auth.signOut()
            setIsLoading(false)
            toast({
              title: "Account suspended",
              description: "Your account has been suspended. Please contact support.",
              variant: "destructive",
            })
            throw new Error('Account suspended')
          }
          // Allow pending and approved accounts to proceed
        }
      } catch (statusError) {
        console.error('⚠️ Auth Context: Status check failed, but allowing login to proceed:', statusError)
      }

      // Get user data
      await getUserData(data.user)

      console.log('✅ Auth Context: Login process completed successfully')
      
      // Reset loading state before showing success toast and redirecting
      setIsLoading(false)
      
      toast({ title: "Login successful", description: "Welcome back!" })
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirect')
        router.push(redirectTo || "/")
      }, 100)
    } catch (error: any) {
      console.error('❌ Auth Context: Login failed:', error)
      
      // Ensure loading state is reset on error
      setIsLoading(false)
      
      // Don't show the generic error message for our custom account status errors
      if (!error.message?.includes('Account')) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
      }
      throw error
    }
  }, [router])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await clearAllAuthData()
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
      
      // Clear any existing session first to avoid JWT conflicts
      await clearAllAuthData()
      
      // Wait a bit for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
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

      // Reset loading state immediately after successful registration
      setIsLoading(false)

      toast({
        title: "Registration successful",
        description: "Your account has been created and is pending approval. You can now log in.",
      })

      // Wait a bit before redirecting to ensure toast is visible
      setTimeout(() => {
        router.push("/auth/login")
      }, 1500)
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle specific JWT errors
      if (isJWTError(error)) {
        await clearAllAuthData()
        toast({
          title: "Session expired",
          description: "Please try registering again",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "An error occurred during registration",
          variant: "destructive",
        })
      }
      // Reset loading state on error
      setIsLoading(false)
      throw error
    }
  }, [router, clearAllAuthData])

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
      
      if (error) {
        setIsLoading(false)
        throw error
      }
      
      // OAuth redirects away, so loading state will be reset on page navigation
    } catch (error: any) {
      console.error('Google login error:', error)
      setIsLoading(false)
      toast({
        title: "Login failed",
        description: error.message || "Failed to login with Google",
        variant: "destructive",
      })
      throw error
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
      
      if (error) {
        setIsLoading(false)
        throw error
      }
      
      // OAuth redirects away, so loading state will be reset on page navigation
    } catch (error: any) {
      console.error('GitHub login error:', error)
      setIsLoading(false)
      toast({
        title: "Login failed",
        description: error.message || "Failed to login with GitHub",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setIsLoading(false)
        throw error
      }

      setIsLoading(false)
      toast({
        title: "Reset email sent",
        description: "Please check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error('Reset password error:', error)
      setIsLoading(false)
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      })
      throw error
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
