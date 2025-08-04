"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MockUser } from "../../types"

interface RecipientSelectionProps {
  selectedUsers: number[]
  handleSelectUser: (userId: number) => void
  mockUsers: MockUser[]
  setShowUserSelector: (show: boolean) => void
  setSelectedUsers: (users: number[]) => void
}

export const RecipientSelection: React.FC<RecipientSelectionProps> = ({
  selectedUsers,
  handleSelectUser,
  mockUsers,
  setShowUserSelector,
  setSelectedUsers,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowUserSelector(true)}>
          <Users className="h-3.5 w-3.5 mr-1" />
          Select Users
        </Button>

        <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedUsers([])}>
          <X className="h-3.5 w-3.5 mr-1" />
          Clear All
        </Button>
      </div>

      {selectedUsers.length > 0 ? (
        <ScrollArea className="h-[300px] rounded-md border p-2">
          <div className="space-y-2">
            {selectedUsers.map((userId) => {
              const user = mockUsers.find((u) => u.id === userId)
              if (!user) return null

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSelectUser(user.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] border rounded-md p-4">
          <Users className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">No recipients selected</p>
          <p className="text-xs text-muted-foreground text-center mt-1">Click "Select Users" to choose recipients</p>
        </div>
      )}
    </div>
  )
}
