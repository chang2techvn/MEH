"use client"

import { useState } from "react" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage your platform users
          </p>
        </div>
        <Button onClick={() => setIsLoading(!isLoading)}>
          {isLoading ? "Loading..." : "Refresh Users"}
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-8 text-center">
              <p>The full user management functionality will be available soon.</p>
              <div className="flex gap-2 justify-center mt-4">
                <Badge>Active</Badge>
                <Badge variant="outline">Inactive</Badge>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
