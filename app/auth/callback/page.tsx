"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast({
            title: "Authentication failed",
            description: error.message,
            variant: "destructive"
          })
          router.push('/auth/login')
          return
        }

        if (data.session) {
          toast({
            title: "Login successful",
            description: "Welcome to EnglishMastery!"
          })
          router.push('/')
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/auth/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  )
}
