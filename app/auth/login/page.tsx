"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, Github, ChromeIcon as Google, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { useAuthActions, useAuthState } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginWithGoogle, loginWithFacebook, loginWithGitHub } = useAuthActions()
  const { isLoading } = useAuthState()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  // Check for account status messages
  useEffect(() => {
    const message = searchParams.get('message')
    
    if (message === 'account_pending') {
      toast({
        title: "Account Pending Approval",
        description: "Your account is waiting for admin approval. Please contact support if you have questions.",
        variant: "destructive"
      })
    } else if (message === 'account_rejected') {
      toast({
        title: "Account Rejected", 
        description: "Your account has been rejected. Please contact support for more information.",
        variant: "destructive"
      })
    } else if (message === 'account_suspended') {
      toast({
        title: "Account Suspended",
        description: "Your account has been suspended. Please contact support for more information.",
        variant: "destructive"
      })
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Prevent double submission

    try {
      console.log('🔐 Login form: Starting login process')
      
      // Add timeout protection for login
      const loginPromise = login(formData.email, formData.password)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout - please try again')), 15000)
      )
      
      await Promise.race([loginPromise, timeoutPromise])
      
      console.log('✅ Login form: Login completed successfully')
      // The login function will handle the redirect and toast notification
    } catch (error: any) {
      console.error("Login submission error:", error)
      
      // Show user-friendly error messages
      if (error.message?.includes('timeout')) {
        toast({
          title: "Login Timeout",
          description: "The login process took too long. Please try again.",
          variant: "destructive"
        })
      } else if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: "Invalid Credentials", 
          description: "Please check your email and password.",
          variant: "destructive"
        })
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: "Email Not Confirmed",
          description: "Please check your email for a confirmation link.",
          variant: "destructive"
        })
      }
      // Other errors are handled in auth context
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Google login error:", error)
    }
  }


  return (
    <div className="min-h-screen flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 blur-3xl -z-10 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-cantaloupe/10 dark:bg-cassis/10 blur-3xl -z-10 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-mellow-yellow/5 dark:bg-mellow-yellow/5 blur-3xl -z-10 animate-blob animation-delay-4000"></div>

      {/* Logo and back link */}
      <div className="container flex justify-between items-center py-4 sm:py-8 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
            <BookOpen className="relative h-5 w-5 sm:h-6 sm:w-6 text-neo-mint dark:text-purist-blue" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
            EnglishMastery
          </span>
        </Link>
        <Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          <div className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Sign in to continue your learning journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11 sm:h-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-neo-mint dark:text-purist-blue hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-11 sm:h-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-10 bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>              
              <div className="mt-4 sm:mt-6">
                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 border-dark/30 dark:border-gray-700/30"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center">
                    <Google className="h-5 w-5 mr-2" />
                    Google
                  </div>
                </Button>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-neo-mint dark:text-purist-blue font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground px-4">
        <p>© 2025 EnglishMastery. All rights reserved.</p>
      </footer>
    </div>
  )
}
