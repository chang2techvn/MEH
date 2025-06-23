"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Github,
  ChromeIcon as Google,
  Facebook,
  Check,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuthActions, useAuthState } from "@/contexts/auth-context"

export default function RegisterPage() {
  const { register, loginWithGoogle, loginWithFacebook, loginWithGitHub } = useAuthActions()
  const { isLoading } = useAuthState()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Calculate password strength when password changes
    if (name === "password") {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0

    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25

    setPasswordStrength(strength)
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return "Very Weak"
    if (passwordStrength <= 25) return "Weak"
    if (passwordStrength <= 50) return "Medium"
    if (passwordStrength <= 75) return "Strong"
    return "Very Strong"
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200 dark:bg-gray-700"
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-yellow-500"
    if (passwordStrength <= 75) return "bg-blue-500"
    return "bg-green-500"
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeTerms: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await register(formData.name, formData.email, formData.password)
      // The register function will handle the redirect and toast notification
    } catch (error) {
      // Error is handled in the register function
      console.error("Registration submission error:", error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Google login error:", error)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook()
    } catch (error) {
      console.error("Facebook login error:", error)
    }
  }

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub()
    } catch (error) {
      console.error("GitHub login error:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 blur-3xl -z-10 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-cantaloupe/10 dark:bg-cassis/10 blur-3xl -z-10 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-mellow-yellow/5 dark:bg-mellow-yellow/5 blur-3xl -z-10 animate-blob animation-delay-4000"></div>

      {/* Logo and back link */}
      <div className="container flex justify-between items-center py-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
            <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
            EnglishMastery
          </span>
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">Join our community of English learners</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Password must be at least 8 characters and include:</p>
                        <ul className="list-disc pl-4 text-xs mt-1">
                          <li>One uppercase letter</li>
                          <li>One number</li>
                          <li>One special character</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                    className="pl-10 pr-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
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
                {formData.password && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Password strength:</span>
                      <span className="text-xs font-medium">{getStrengthText()}</span>
                    </div>
                    <Progress value={passwordStrength} className="h-1" indicatorClassName={getStrengthColor()} />
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      <div className="flex items-center text-xs">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${formData.password.length >= 8 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}
                        >
                          {formData.password.length >= 8 && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-muted-foreground">8+ chars</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${/[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}
                        >
                          {/[A-Z]/.test(formData.password) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-muted-foreground">Uppercase</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${/[0-9]/.test(formData.password) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}
                        >
                          {/[0-9]/.test(formData.password) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-muted-foreground">Number</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${/[^A-Za-z0-9]/.test(formData.password) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}
                        >
                          {/[^A-Za-z0-9]/.test(formData.password) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-muted-foreground">Symbol</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={handleCheckboxChange}
                  className="mt-1"
                />
                <div>
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-neo-mint dark:text-purist-blue hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-neo-mint dark:text-purist-blue hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.agreeTerms || passwordStrength < 50}
                className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6">
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

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 border-dark/30 dark:border-gray-700/30"
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

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-neo-mint dark:text-purist-blue font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 EnglishMastery. All rights reserved.</p>
      </footer>
    </div>
  )
}
