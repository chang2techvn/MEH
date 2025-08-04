"use client"

import { useAuthState } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function DebugPage() {
  const { user, isLoading, isAuthenticated } = useAuthState()
  const [dbUser, setDbUser] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      // Fetch user from database to check role
      supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching user from DB:', error)
          } else {
            setDbUser(data)
          }
        })
    }
  }, [user?.id])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Auth Info</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Auth Context</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {isLoading ? 'true' : 'false'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
              <p><strong>User ID:</strong> {user?.id || 'null'}</p>
              <p><strong>Email:</strong> {user?.email || 'null'}</p>
              <p><strong>Name:</strong> {user?.name || 'null'}</p>
              <p><strong>Role (context):</strong> {user?.role || 'null'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Database User</h2>
            <div className="space-y-2 text-sm">
              {dbUser ? (
                <>
                  <p><strong>ID:</strong> {dbUser.id}</p>
                  <p><strong>Email:</strong> {dbUser.email}</p>
                  <p><strong>Name:</strong> {dbUser.name}</p>
                  <p><strong>Role (DB):</strong> {dbUser.role || 'null'}</p>
                  <p><strong>Created:</strong> {dbUser.created_at}</p>
                  <p><strong>Updated:</strong> {dbUser.updated_at}</p>
                </>
              ) : (
                <p>Loading database user...</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Raw Data</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Auth Context User:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            {dbUser && (
              <div>
                <h3 className="font-medium">Database User:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(dbUser, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
