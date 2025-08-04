"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail } from "lucide-react"

interface UserDetailsEmailProps {
  emailSubject: string
  setEmailSubject: (subject: string) => void
  emailBody: string
  setEmailBody: (body: string) => void
  handleSendEmail: () => void
}

export const UserDetailsEmail = ({
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  handleSendEmail,
}: UserDetailsEmailProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium mb-2">Send Email</h4>
      <div className="space-y-2">
        <Label htmlFor="email-subject">Subject</Label>
        <Input
          id="email-subject"
          placeholder="Enter email subject"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-body">Message</Label>
        <Textarea
          id="email-body"
          placeholder="Write your message here..."
          className="min-h-[150px]"
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSendEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </div>
    </div>
  )
}
