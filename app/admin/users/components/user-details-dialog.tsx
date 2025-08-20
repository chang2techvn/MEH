"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  User, 
  UserCog, 
  X, 
  Check, 
  Pencil, 
  Loader2, 
  Shield, 
  Calendar, 
  Settings, 
  MessageSquare 
} from "lucide-react"
import type { UserData } from "@/hooks/use-users"

interface UserDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedUser: UserData | null
  editedUser: UserData | null
  editMode: boolean
  setEditMode: (mode: boolean) => void
  isLoading: boolean
  saveUserEdits: () => void
  activeDetailTab: string
  setActiveDetailTab: (tab: string) => void
}

export const UserDetailsDialog = ({
  isOpen,
  onClose,
  selectedUser,
  editedUser,
  editMode,
  setEditMode,
  isLoading,
  saveUserEdits,
  activeDetailTab,
  setActiveDetailTab,
}: UserDetailsDialogProps) => {
  if (!selectedUser || !editedUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center">
                {editMode ? (
                  <UserCog className="mr-2 h-5 w-5 text-neo-mint dark:text-purist-blue" />
                ) : (
                  <User className="mr-2 h-5 w-5 text-neo-mint dark:text-purist-blue" />
                )}
                {editMode ? "Edit User" : "User Details"}
              </DialogTitle>
              <DialogDescription>
                {editMode
                  ? "Edit user information and settings"
                  : `Detailed information about ${selectedUser.name}`}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)} className="text-sm gap-1">
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveUserEdits}
                    className="text-sm bg-green-600 hover:bg-green-700 gap-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="text-sm gap-1">
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2">
          <Tabs defaultValue="overview" value={activeDetailTab} onValueChange={setActiveDetailTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="approval"
                className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Approval
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-neo-mint dark:data-[state=active]:bg-purist-blue data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="text-center text-muted-foreground py-8">
                Overview tab content placeholder
              </div>
            </TabsContent>

            <TabsContent value="approval">
              <div className="text-center text-muted-foreground py-8">
                Approval tab content placeholder
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="text-center text-muted-foreground py-8">
                Activity tab content placeholder
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="text-center text-muted-foreground py-8">
                Settings tab content placeholder
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="text-center text-muted-foreground py-8">
                Notes tab content placeholder
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
