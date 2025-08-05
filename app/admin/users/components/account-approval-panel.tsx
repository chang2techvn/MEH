import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  Shield
} from 'lucide-react'
import { UserData } from '@/hooks/use-users'

interface AccountApprovalPanelProps {
  user: UserData
  onApprove: (userId: string) => Promise<boolean>
  onReject: (userId: string, reason?: string) => Promise<boolean>
  onSuspend: (userId: string, reason?: string) => Promise<boolean>
  isLoading?: boolean
}

export function AccountApprovalPanel({ 
  user, 
  onApprove, 
  onReject, 
  onSuspend,
  isLoading = false 
}: AccountApprovalPanelProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  const getAccountStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <User className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const handleApprove = async () => {
    setActionInProgress('approve')
    await onApprove(user.id)
    setActionInProgress(null)
  }

  const handleReject = async () => {
    setActionInProgress('reject')
    const success = await onReject(user.id, rejectReason)
    if (success) {
      setShowRejectDialog(false)
      setRejectReason('')
    }
    setActionInProgress(null)
  }

  const handleSuspend = async () => {
    setActionInProgress('suspend')
    const success = await onSuspend(user.id, suspendReason)
    if (success) {
      setShowSuspendDialog(false)
      setSuspendReason('')
    }
    setActionInProgress(null)
  }

  return (
    <>
      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Approval Status
            </CardTitle>
            {getAccountStatusBadge(user.account_status)}
          </div>
          <CardDescription>
            Manage account approval and user access permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Join Date</Label>
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {user.joinDate}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="capitalize">{user.role}</p>
            </div>
          </div>

          {/* Approval Info */}
          {user.approved_at && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-muted-foreground">Approval Info</Label>
              <p className="text-sm">
                {user.account_status === 'approved' ? 'Approved' : 'Last updated'} on {new Date(user.approved_at).toLocaleDateString()}
              </p>
              {user.approved_by && (
                <p className="text-sm text-muted-foreground">By: {user.approved_by}</p>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {user.rejection_reason && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <Label className="text-red-700 dark:text-red-300">Rejection Reason</Label>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{user.rejection_reason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {user.account_status === 'pending' && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading || actionInProgress !== null}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {actionInProgress === 'approve' ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-3 w-3 mr-1"
                    >
                      ⟳
                    </motion.div>
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isLoading || actionInProgress !== null}
                  variant="destructive"
                  size="sm"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </>
            )}
            
            {user.account_status === 'approved' && (
              <Button
                onClick={() => setShowSuspendDialog(true)}
                disabled={isLoading || actionInProgress !== null}
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                size="sm"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Suspend
              </Button>
            )}

            {(user.account_status === 'rejected' || user.account_status === 'suspended') && (
              <Button
                onClick={handleApprove}
                disabled={isLoading || actionInProgress !== null}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
                size="sm"
              >
                {actionInProgress === 'approve' ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-3 w-3 mr-1"
                  >
                    ⟳
                  </motion.div>
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                Reactivate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this account? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Reason for rejection</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter reason for rejecting this account..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={actionInProgress !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionInProgress !== null}
            >
              {actionInProgress === 'reject' ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-3 w-3 mr-1"
                >
                  ⟳
                </motion.div>
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Reject Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this account? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="suspend-reason">Reason for suspension</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Enter reason for suspending this account..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
              disabled={actionInProgress !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={actionInProgress !== null}
            >
              {actionInProgress === 'suspend' ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-3 w-3 mr-1"
                >
                  ⟳
                </motion.div>
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
