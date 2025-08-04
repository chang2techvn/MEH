"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SafetyMetric, SafetyRule, FlaggedContent } from "../../types"

interface OverviewTabProps {
  safetyMetrics: SafetyMetric[]
  safetyRules: SafetyRule[]
  flaggedContent: FlaggedContent[]
  onToggleRule: (ruleId: string) => void
  onUpdateThreshold: (ruleId: string, value: number[]) => void
  onViewAllContent: () => void
  onManageRules: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
}

export function OverviewTab({
  safetyMetrics,
  safetyRules,
  flaggedContent,
  onToggleRule,
  onUpdateThreshold,
  onViewAllContent,
  onManageRules,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {safetyMetrics.map((metric, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-bold">{metric.value}%</div>
                  <Badge variant={metric.change >= 0 ? "default" : "destructive"} className="mb-1">
                    {metric.change >= 0 ? "+" : ""}
                    {metric.change}%
                  </Badge>
                </div>
                <Progress value={(metric.value / metric.target) * 100} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Target: {metric.target}%</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Flagged Content</CardTitle>
              <CardDescription>
                Content that has been flagged by the AI safety system in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {flaggedContent.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.userName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge
                          variant={
                            item.severity === "critical"
                              ? "destructive"
                              : item.severity === "high"
                                ? "destructive"
                                : item.severity === "medium"
                                  ? "outline"
                                  : "secondary"
                          }
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm">{item.content}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Rule: {item.rule}</span>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={onViewAllContent}>
                View All Flagged Content
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Safety Rule Performance</CardTitle>
              <CardDescription>Effectiveness of safety rules based on recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {safetyRules.map((rule) => (
                    <div key={rule.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">{rule.category}</p>
                        </div>
                        <Switch checked={rule.enabled} onCheckedChange={() => onToggleRule(rule.id)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={rule.threshold} className="h-2 flex-1" />
                        <span className="text-xs font-medium w-8">{rule.threshold}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={onManageRules}>
                Manage Safety Rules
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
