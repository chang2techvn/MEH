"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, AlertTriangle, Info, X } from "lucide-react"

interface InsightsPanelProps {
  showInsights: boolean
  setShowInsights: (show: boolean) => void
}

export const InsightsPanel = ({ showInsights, setShowInsights }: InsightsPanelProps) => {
  return (
    <AnimatePresence>
      {showInsights && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 overflow-hidden"
        >
          <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    AI-Powered Insights
                    <Badge className="ml-2 bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                      New
                    </Badge>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-medium">User engagement is up 15%</span> compared to the previous period,
                        with the highest growth in the "Travel English" learning path.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-medium">Completion rates for Grammar challenges</span> are below target.
                        Consider simplifying content or adding more interactive elements.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-medium">Peak usage times</span> are between 10:00-12:00 and 18:00-20:00.
                        Schedule new content releases during these windows for maximum visibility.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      View detailed report
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => setShowInsights(false)}>
                      <X className="h-4 w-4 mr-1" /> Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
