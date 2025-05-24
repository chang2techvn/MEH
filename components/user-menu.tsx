"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const handleLogin = () => {
    router.push("/auth/login")
  }

  const handleRegister = () => {
    router.push("/auth/register")
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogin}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
        >
          Sign In
        </Button>
        <Button
          size="sm"
          onClick={handleRegister}
          className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
        >
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
          <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800">
            <AvatarImage src={user.image || "/placeholder.svg?height=36&width=36"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20"
      >
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <DropdownMenuLabel className="flex flex-col gap-2 py-3">
            <span className="font-semibold">{user.name}</span>
            <span className="font-normal text-xs text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/20 dark:bg-gray-800/20" />
          <DropdownMenuItem className="focus:bg-white/20 dark:focus:bg-gray-800/20">
            <Link href="/profile" className="flex w-full">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-white/20 dark:focus:bg-gray-800/20">
            <Link href="/settings" className="flex w-full">
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-white/20 dark:focus:bg-gray-800/20">
            <Link href="/help" className="flex w-full">
              Help
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/20 dark:bg-gray-800/20" />
          <DropdownMenuItem
            className="focus:bg-white/20 dark:focus:bg-gray-800/20 text-red-500 focus:text-red-600"
            onClick={handleLogout}
          >
            Log out
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
