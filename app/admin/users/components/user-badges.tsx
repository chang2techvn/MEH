"use client"

import { Badge } from "@/components/ui/badge"
import { BookOpen, Shield, User, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface StatusBadgeProps {
  status: "active" | "pending" | "suspended" | "inactive"
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-all duration-300 hover:scale-105">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </motion.div>
        </Badge>
      )
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 transition-all duration-300 hover:scale-105"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </motion.div>
        </Badge>
      )
    case "suspended":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-all duration-300 hover:scale-105"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <XCircle className="mr-1 h-3 w-3" />
            Suspended
          </motion.div>
        </Badge>
      )
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 transition-all duration-300 hover:scale-105"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <AlertCircle className="mr-1 h-3 w-3" />
            Inactive
          </motion.div>
        </Badge>
      )
    default:
      return null
  }
}

interface RoleBadgeProps {
  role: "student" | "teacher" | "admin"
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  switch (role) {
    case "admin":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 transition-all duration-300 hover:scale-105">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </motion.div>
        </Badge>
      )
    case "teacher":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-all duration-300 hover:scale-105">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <User className="mr-1 h-3 w-3" />
            Teacher
          </motion.div>
        </Badge>
      )
    case "student":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 transition-all duration-300 hover:scale-105"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <User className="mr-1 h-3 w-3" />
            Student
          </motion.div>
        </Badge>
      )
    default:
      return null
  }
}

interface LevelBadgeProps {
  level: "beginner" | "intermediate" | "advanced"
}

export const LevelBadge = ({ level }: LevelBadgeProps) => {
  switch (level) {
    case "beginner":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 transition-all duration-300 hover:scale-105"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <BookOpen className="mr-1 h-3 w-3" />
            Beginner
          </motion.div>
        </Badge>
      )
    case "intermediate":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 transition-all duration-300 hover:scale-105"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <BookOpen className="mr-1 h-3 w-3" />
            Intermediate
          </motion.div>
        </Badge>
      )
    case "advanced":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 transition-all duration-300 hover:scale-105"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
            <BookOpen className="mr-1 h-3 w-3" />
            Advanced
          </motion.div>
        </Badge>
      )
    default:
      return null
  }
}
