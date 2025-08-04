"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

interface SaveButtonProps {
  saving: boolean
  onSave: () => Promise<void>
}

export function SaveButton({ saving, onSave }: SaveButtonProps) {
  return (
    <Button
      onClick={onSave}
      disabled={saving}
      className="w-full mt-6 bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
    >
      {saving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </>
      )}
    </Button>
  )
}
