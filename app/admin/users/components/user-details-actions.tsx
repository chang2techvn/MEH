"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface UserDetailsActionsProps {
  showDeleteConfirm: boolean
  userToDelete: UserData | null
  isLoading: boolean
  confirmDeleteUser: () => void
  setShowDeleteConfirm: (show: boolean) => void
}

export const UserDetailsActions = ({
  showDeleteConfirm,
  userToDelete,
  isLoading,
  confirmDeleteUser,
  setShowDeleteConfirm,
}: UserDetailsActionsProps) => {
  return (
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {userToDelete && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full overflow-hidden">
                <img
                  src={userToDelete.avatarUrl || "/placeholder.svg?height=48&width=48"}
                  alt={userToDelete.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{userToDelete.name}</p>
                <p className="text-sm text-muted-foreground">{userToDelete.email}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDeleteUser} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete User</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
