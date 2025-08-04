export type UserData = {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "pending" | "suspended" | "inactive"
  level: "beginner" | "intermediate" | "advanced"
  joinDate: string
  lastActive: string
  completedChallenges: number
  totalChallenges: number
  avatarUrl?: string
  bio?: string
  location?: string
  phone?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  tags?: string[]
  achievements?: {
    name: string
    date: string
    icon: string
  }[]
  recentActivity?: {
    type: string
    description: string
    date: string
  }[]
}

export type ExportableUser = {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "pending" | "suspended" | "inactive"
  level: "beginner" | "intermediate" | "advanced"
  joinDate: string
  lastActive: string
  completedChallenges: number
  totalChallenges: number
  location?: string
}
