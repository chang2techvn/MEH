"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle, XCircle, Mail, Trash2 } from "lucide-react"

interface BulkActionsDropdownProps {
  selectedUsersCount: number
  handleBulkAction: (action: string) => void
}

export const BulkActionsDropdown = ({ selectedUsersCount, handleBulkAction }: BulkActionsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Bulk Actions ({selectedUsersCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Activate Users
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBulkAction("deactivate")} className="text-amber-600">
          <XCircle className="h-4 w-4 mr-2 text-amber-600" />
          Deactivate Users
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBulkAction("email")}>
          <Mail className="h-4 w-4 mr-2 text-blue-600" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Users
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
