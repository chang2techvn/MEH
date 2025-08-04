"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, Shield, AlertCircle, Info } from "lucide-react"
import type { TestResults } from "../types"

interface TestContentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  testContent: string
  onTestContentChange: (content: string) => void
  testResults: TestResults | null
  isLoading: boolean
  onTestContent: () => void
}

export function TestContentDialog({
  isOpen,
  onOpenChange,
  testContent,
  onTestContentChange,
  testResults,
  isLoading,
  onTestContent,
}: TestContentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Test Content Safety</DialogTitle>
          <DialogDescription>Test how the AI safety system would evaluate and moderate content</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-content">Content to Test</Label>
            <Textarea
              id="test-content"
              placeholder="Enter content to test against safety rules..."
              className="h-32"
              value={testContent}
              onChange={(e) => onTestContentChange(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {testResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Test Results</h3>
                  <Badge variant={testResults.overallSafetyScore < 70 ? "destructive" : "outline"}>
                    Safety Score: {testResults.overallSafetyScore}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Triggered Rules</h4>
                  {testResults.triggeredRules.map((rule, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span>{rule.ruleName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            rule.severity === "critical"
                              ? "destructive"
                              : rule.severity === "high"
                                ? "destructive"
                                : rule.severity === "medium"
                                  ? "outline"
                                  : "secondary"
                          }
                        >
                          {rule.severity}
                        </Badge>
                        <span className="text-sm font-medium">{rule.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Suggested Actions</h4>
                  <ul className="space-y-1">
                    {testResults.suggestedActions.map((action, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Modified Content</h4>
                  <div className="p-3 bg-muted rounded-md text-sm">{testResults.modifiedContent}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onTestContent} disabled={!testContent || isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Test Content
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
