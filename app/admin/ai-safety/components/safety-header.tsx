"use client"

import { Button } from "@/components/ui/button"
import { Save, Shield } from "lucide-react"
import PageHeader from "@/components/page-header"

interface SafetyHeaderProps {
  onSave: () => void
  onTestContent: () => void
}

export function SafetyHeader({ onSave, onTestContent }: SafetyHeaderProps) {
  return (
    <PageHeader
      title="AI Safety & Moderation"
      description="Configure AI safety settings, content moderation rules, and review flagged content"
    >
      <div className="flex items-center gap-2">
        <Button onClick={onSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={onTestContent} className="gap-2">
          <Shield className="h-4 w-4" />
          Test Content
        </Button>
      </div>
    </PageHeader>
  )
}
