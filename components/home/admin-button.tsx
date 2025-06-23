"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthState } from "@/contexts/auth-context"

export default function AdminButton() {
  const { user, isAuthenticated } = useAuthState()

  // Only show for authenticated admin users
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  return (
    <Link href="/admin">
      <Button
        variant="outline"
        size="sm"
        className="bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border-orange-500/30 text-orange-600 dark:text-orange-400 backdrop-blur-sm relative group"
      >
        <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-orange-500 to-red-500 blur-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <Shield className="h-4 w-4 mr-2" />
        <span className="relative">Admin</span>
      </Button>
    </Link>
  )
}
