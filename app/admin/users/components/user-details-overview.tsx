"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, MapPin, Phone, Tag } from "lucide-react"
import { StatusBadge, RoleBadge, LevelBadge } from "./user-badges"
import { formatDate, getTimeSince, getInitials } from "../utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface UserData {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  status: "active" | "pending" | "suspended" | "inactive"
  level: "beginner" | "intermediate" | "advanced"
  joinDate: Date
  lastActive: Date
  completedChallenges: number
  totalChallenges: number
  avatarUrl?: string
  bio?: string
  location?: string
  phone?: string
  tags?: string[]
}

interface UserDetailsOverviewProps {
  user: UserData
  editMode: boolean
  editedUser: UserData
  setEditedUser: (user: UserData) => void
  selectedUser: UserData | null
}

export const UserDetailsOverview = ({
  user,
  editMode,
  editedUser,
  setEditedUser,
  selectedUser,
}: UserDetailsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 flex flex-col items-center">
        <Avatar className="h-32 w-32 mb-4 border-4 border-white shadow-xl">
          <AvatarImage src={user.avatarUrl || "/placeholder.svg?height=128&width=128"} alt={user.name} />
          <AvatarFallback className="text-3xl bg-neo-mint/10 dark:bg-purist-blue/10 text-neo-mint dark:text-purist-blue font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        {editMode ? (
          <Input
            value={editedUser.name}
            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
            className="text-xl font-semibold text-center mb-1 bg-muted/50"
          />
        ) : (
          <h3 className="text-xl font-semibold text-center">{user.name}</h3>
        )}

        {editMode ? (
          <Input
            value={editedUser.email}
            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            className="text-muted-foreground text-center mb-4 bg-muted/50"
          />
        ) : (
          <p className="text-muted-foreground text-center mb-4">{user.email}</p>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
          <LevelBadge level={user.level} />
        </div>

        {editMode ? (
          <div className="w-full space-y-3 mt-2">
            <div className="space-y-1">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={editedUser.role}
                onValueChange={(value: "student" | "teacher" | "admin") =>
                  setEditedUser({
                    ...editedUser,
                    role: value,
                  })
                }
              >
                <SelectTrigger id="user-role" className="bg-muted/50">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="user-status">Status</Label>
              <Select
                value={editedUser.status}
                onValueChange={(value: "active" | "pending" | "suspended" | "inactive") =>
                  setEditedUser({
                    ...editedUser,
                    status: value,
                  })
                }
              >
                <SelectTrigger id="user-status" className="bg-muted/50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="user-level">Level</Label>
              <Select
                value={editedUser.level}
                onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                  setEditedUser({
                    ...editedUser,
                    level: value,
                  })
                }
              >
                <SelectTrigger id="user-level" className="bg-muted/50">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : selectedUser?.bio ? (
          <div className="mt-4 text-center px-4">
            <p className="text-sm text-muted-foreground italic">"{selectedUser.bio}"</p>
          </div>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Joined Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{formatDate(user.joinDate)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{getTimeSince(user.lastActive)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user.completedChallenges} of {user.totalChallenges}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user.totalChallenges > 0 ? Math.round((user.completedChallenges / user.totalChallenges) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <BarChart3 className="mr-2 h-4 w-4 text-neo-mint dark:text-purist-blue" />
              Progress
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span className="font-medium">
                  {user.totalChallenges > 0 ? Math.round((user.completedChallenges / user.totalChallenges) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={user.totalChallenges > 0 ? (user.completedChallenges / user.totalChallenges) * 100 : 0}
                className="h-2"
              />
            </div>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-bio">Bio</Label>
                <Textarea
                  id="user-bio"
                  value={editedUser.bio || ""}
                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  className="w-full bg-muted/50 min-h-[100px]"
                  placeholder="Enter user bio..."
                />
              </div>

              <div>
                <Label htmlFor="user-location">Location</Label>
                <Input
                  id="user-location"
                  value={editedUser.location || ""}
                  onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                  className="bg-muted/50"
                  placeholder="Enter location..."
                />
              </div>

              <div>
                <Label htmlFor="user-phone">Phone</Label>
                <Input
                  id="user-phone"
                  value={editedUser.phone || ""}
                  onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                  className="bg-muted/50"
                  placeholder="Enter phone number..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {user.location && (
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{user.location}</p>
                  </div>
                </div>
              )}

              {user.phone && (
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.tags && user.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-neo-mint dark:text-purist-blue" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-muted/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
