"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"

interface AddUserDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  isLoading: boolean
  handleAddUser: (values: UserFormValues) => void
  form: any
}

export type UserFormValues = z.infer<typeof userFormSchema>

// Form schema for adding new users
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["student", "teacher", "admin"], {
    required_error: "Please select a role.",
  }),
  status: z.enum(["active", "pending", "suspended", "inactive"], {
    required_error: "Please select a status.",
  }),
  level: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select a level.",
  }),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
})

export const AddUserDialog = ({ open, setOpen, isLoading, handleAddUser, form }: AddUserDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Full Name</Label>
            <Input id="user-name" placeholder="Enter user's full name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email Address</Label>
            <Input id="user-email" type="email" placeholder="Enter user's email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">User Role</Label>
            <Select value={form.getValue("role")} onValueChange={(value) => form.setValue("role", value)}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-500">{form.formState.errors.role?.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleAddUser)} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
