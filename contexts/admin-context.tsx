"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthState } from './auth-context'
import { 
  getDashboardStats, 
  getRecentActivities, 
  getNewUsers, 
  getPopularResources,
  type DashboardStats,
  type RecentActivity,
  type NewUser,
  type PopularResource
} from '@/app/actions/admin-dashboard'

interface AdminContextValue {
  // Cache data
  dashboardStats: DashboardStats | null
  recentActivities: RecentActivity[]
  newUsers: NewUser[]
  popularResources: PopularResource[]
  isLoading: boolean
  isCacheReady: boolean
  
  // Methods
  loadDashboardData: () => Promise<void>
  refreshData: () => Promise<void>
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthState()
  const [isCacheReady, setIsCacheReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Data state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [newUsers, setNewUsers] = useState<NewUser[]>([])
  const [popularResources, setPopularResources] = useState<PopularResource[]>([])

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      const [stats, activities, users, resources] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(),
        getNewUsers(),
        getPopularResources()
      ])

      setDashboardStats(stats)
      setRecentActivities(activities)
      setNewUsers(users)
      setPopularResources(resources)
      
      console.log('✅ Admin dashboard data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading admin dashboard data:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh data
  const refreshData = async () => {
    console.log('🔄 Refreshing admin dashboard data...')
    await loadDashboardData()
  }

  // Preload admin data when user is admin
  useEffect(() => {
    if (user?.role === 'admin' && !isCacheReady) {
      console.log('🔄 Preloading admin dashboard data for user:', user.id)
      
      loadDashboardData().then(() => {
        console.log('✅ Admin dashboard cache ready')
        setIsCacheReady(true)
      }).catch(error => {
        console.error('❌ Failed to preload admin dashboard data:', error)
        setIsCacheReady(true) // Set ready anyway to prevent blocking
      })
    }
  }, [user?.role])

  const value: AdminContextValue = {
    // Cache data
    dashboardStats,
    recentActivities,
    newUsers,
    popularResources,
    isLoading,
    isCacheReady,
    
    // Methods
    loadDashboardData,
    refreshData
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
