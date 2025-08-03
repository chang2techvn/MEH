"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { 
  Camera,
  Edit3, 
  Save, 
  X, 
  Clock
} from "lucide-react"

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface UserStats {
  level: number
  experiencePoints: number
  joinedAt: string
}

interface EditProfile {
  name: string
  bio: string
  location: string
  role?: string
  major?: string
  class_name?: string
  academic_year?: string
  student_id?: string
}

interface ProfileCardProps {
  user: any
  userStats: UserStats | null
  isEditing: boolean
  isUploading: boolean
  editProfile: EditProfile
  onEditClick: () => void
  onSaveClick: () => void
  onCancelClick: () => void
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onEditProfileChange: (updates: Partial<EditProfile>) => void
}

export function ProfileCard({
  user,
  userStats,
  isEditing,
  isUploading,
  editProfile,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onAvatarUpload,
  onEditProfileChange
}: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-gray-800 shadow-xl">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-3xl">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full bg-white dark:bg-gray-900 shadow-lg hover:bg-neo-mint/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-neo-mint border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editProfile.name}
                      onChange={(e) => onEditProfileChange({ name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editProfile.bio}
                      onChange={(e) => onEditProfileChange({ bio: e.target.value })}
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={editProfile.role || ''}
                        onChange={(e) => onEditProfileChange({ role: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neo-mint"
                      >
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="academic_year">Academic Year</Label>
                      <Input
                        id="academic_year"
                        value={editProfile.academic_year || ''}
                        onChange={(e) => onEditProfileChange({ academic_year: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., 2024-2025"
                      />
                    </div>
                  </div>

                  {editProfile.role === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="major">Major</Label>
                        <Input
                          id="major"
                          value={editProfile.major || ''}
                          onChange={(e) => onEditProfileChange({ major: e.target.value })}
                          className="mt-1"
                          placeholder="e.g., Technology"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="class_name">Class</Label>
                        <Input
                          id="class_name"
                          value={editProfile.class_name || ''}
                          onChange={(e) => onEditProfileChange({ class_name: e.target.value })}
                          className="mt-1"
                          placeholder="e.g., SE07201"
                        />
                      </div>
                    </div>
                  )}

                  {editProfile.role === 'teacher' && (
                    <div>
                      <Label htmlFor="major">Subject</Label>
                      <Input
                        id="major"
                        value={editProfile.major || ''}
                        onChange={(e) => onEditProfileChange({ major: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., English Literature"
                      />
                    </div>
                  )}

                  {editProfile.role === 'staff' && (
                    <div>
                      <Label htmlFor="major">Position</Label>
                      <Input
                        id="major"
                        value={editProfile.major || ''}
                        onChange={(e) => onEditProfileChange({ major: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., Academic Coordinator"
                      />
                    </div>
                  )}

                  {editProfile.role === 'student' && (
                    <div>
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        value={editProfile.student_id || ''}
                        onChange={(e) => onEditProfileChange({ student_id: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., BC00000"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={onSaveClick} className="bg-gradient-to-r from-neo-mint to-purist-blue">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={onCancelClick}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div
                  key={`${user.name}-${user.bio}`} // Key changes when name/bio updates
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold gradient-text">{user.name}</h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onEditClick}
                      className="hover:bg-neo-mint/10"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {user.bio || "No bio added yet. Click the edit button to add one!"}
                  </p>

                  {/* Profile Information */}
                  {(user.role || user.major || user.className || user.academicYear || user.studentId) && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Information</h3>
                        {user.role && (
                          <Badge variant="secondary" className="capitalize text-xs px-2 py-0.5">
                            {user.role}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {user.academicYear && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Academic Year:</span> {user.academicYear}
                          </div>
                        )}
                        {user.major && (user.role === 'student' || user.role === 'teacher') && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">
                              {user.role === 'teacher' ? 'Subject:' : 'Major:'}
                            </span> {user.major}
                          </div>
                        )}
                        {user.major && user.role === 'staff' && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Position:</span> {user.major}
                          </div>
                        )}
                        {user.className && user.role === 'student' && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Class:</span> {user.className}
                          </div>
                        )}
                        {user.studentId && user.role === 'student' && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Student ID:</span> {user.studentId}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Joined {new Date(userStats?.joinedAt || '').toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Level and XP */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-neo-mint/10 to-purist-blue/10 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Level {userStats?.level || 1}</span>
                      <span className="text-sm text-muted-foreground">
                        {userStats?.experiencePoints || 0} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-neo-mint to-purist-blue h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(((userStats?.experiencePoints || 0) % 1000) / 10, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
