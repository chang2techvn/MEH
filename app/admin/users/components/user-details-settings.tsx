"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface UserDetailsSettingsProps {
  showUserNotes: boolean
  userNotes: string
  setUserNotes: (notes: string) => void
  showEmailForm: boolean
  emailSubject: string
  setEmailSubject: (subject: string) => void
  emailBody: string
  setEmailBody: (body: string) => void
  handleSaveNotes: () => void
  handleSendEmail: () => void
}

export const UserDetailsSettings = ({
  showUserNotes,
  userNotes,
  setUserNotes,
  showEmailForm,
  emailSubject,
  setEmailSubject,
  emailBody,
  handleSaveNotes,
  handleSendEmail,
}: UserDetailsSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium mb-2">Profile Settings</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile">Public Profile</Label>
            <Switch id="public-profile" />
          </div>
          <p className="text-sm text-muted-foreground">Make your profile visible to other users on the platform</p>
        </div>

        <h4 className="font-medium mb-2">Notification Preferences</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch id="email-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch id="push-notifications" />
          </div>
        </div>

        <h4 className="font-medium mb-2">Privacy Settings</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-activity">Show Activity</Label>
            <Switch id="show-activity" />
          </div>
          <p className="text-sm text-muted-foreground">Allow other users to see your recent activity on the platform</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium mb-2">User Notes</h4>
        <Textarea
          placeholder="Add notes about this user..."
          className="min-h-[150px]"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleSaveNotes}>Save Notes</Button>
        </div>
      </div>
    </div>
  )
}
