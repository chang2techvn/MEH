"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await resetPassword(email)

      // Success notification
      toast({
        title: "Reset link sent",
        description: "Check your email for instructions to reset your password.",
      })

      setIsSubmitted(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending the reset link. Please try again.",
        variant: "destructive",
      })
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
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
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
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
                  <p className="text-muted-foreground">Enter your email to reset your password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Send Reset Link
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  If you don't see the email, check your spam folder or make sure you entered the correct email address.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
                >
                  Try another email
                </Button>
              </motion.div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
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
