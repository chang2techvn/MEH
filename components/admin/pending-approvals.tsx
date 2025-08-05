import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Bell, Users, Clock, CheckCircle, XCircle } from 'lucide-react'

interface PendingApprovalsProps {
  className?: string
}

export function PendingApprovalsBadge({ className }: PendingApprovalsProps) {
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/admin/account-approval')
        if (response.ok) {
          const data = await response.json()
          setPendingCount(data.data?.pendingCount || 0)
        }
      } catch (error) {
        console.error('Error fetching pending approvals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingCount()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Badge variant="secondary" className={className}>
        <Clock className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    )
  }

  if (pendingCount === 0) {
    return (
      <Badge variant="outline" className={className}>
        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
        No pending approvals
      </Badge>
    )
  }

  return (
    <Badge 
      variant="destructive" 
      className={`${className} animate-pulse`}
    >
      <Bell className="w-3 h-3 mr-1" />
      {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
    </Badge>
  )
}

export function AccountStatusSummary() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This would fetch actual stats from your API
    // For now, using dummy data
    setTimeout(() => {
      setStats({
        pending: 5,
        approved: 142,
        rejected: 8,
        suspended: 3
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <div className="flex items-center text-yellow-700 mb-2">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Pending</span>
        </div>
        <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
      </div>
      
      <div className="p-4 border rounded-lg bg-green-50 border-green-200">
        <div className="flex items-center text-green-700 mb-2">
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Approved</span>
        </div>
        <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
      </div>
      
      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
        <div className="flex items-center text-red-700 mb-2">
          <XCircle className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Rejected</span>
        </div>
        <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
      </div>
      
      <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
        <div className="flex items-center text-gray-700 mb-2">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Suspended</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
      </div>
    </div>
  )
}
