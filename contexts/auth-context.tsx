"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// Define user type
export interface User {
  id: string
  name: string
  email: string
  image?: string
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
  setNewPassword: (token: string, password: string) => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Sample user data (in a real app, this would come from a database)
const SAMPLE_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "Password123!",
    image: "/placeholder.svg?height=96&width=96",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    password: "Password123!",
    image: "/placeholder.svg?height=96&width=96",
  },
]

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string, remember = false) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Find user with matching email and password
      const foundUser = SAMPLE_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      )

      if (!foundUser) {
        throw new Error("Invalid email or password")
      }

      // Create user object without password
      const { password: _, ...userWithoutPassword } = foundUser

      // Save user to state
      setUser(userWithoutPassword)

      // Save user to localStorage if remember is true
      if (remember) {
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      }

      toast({
        title: "Login successful",
        description: `Welcome back, ${userWithoutPassword.name}!`,
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if user with this email already exists
      if (SAMPLE_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already in use")
      }

      // Create new user
      const newUser = {
        id: `${SAMPLE_USERS.length + 1}`,
        name,
        email,
        image: "/placeholder.svg?height=96&width=96",
      }

      // In a real app, you would save the user to the database here
      // For this demo, we'll just add it to our state

      // Save user to state
      setUser(newUser)

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(newUser))

      toast({
        title: "Registration successful",
        description: `Welcome to EnglishMastery, ${name}!`,
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if user with this email exists
      const userExists = SAMPLE_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!userExists) {
        // For security reasons, don't reveal if the email exists or not
        // Just pretend we sent the email
        console.log("User not found, but we won't tell the user that")
      }

      // In a real app, you would send a password reset email here
      console.log(`Password reset email would be sent to ${email}`)

      return
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Set new password function
  const setNewPassword = async (token: string, password: string) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would validate the token and update the user's password
      console.log(`Password would be updated for token ${token}`)

      return
    } catch (error) {
      console.error("Set new password error:", error)
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
