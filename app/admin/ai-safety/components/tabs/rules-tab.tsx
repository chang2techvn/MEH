"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Download, Upload } from "lucide-react"
import type { SafetyRule } from "../../types"

interface RulesTabProps {
  safetyRules: SafetyRule[]
  onToggleRule: (ruleId: string) => void
  onUpdateThreshold: (ruleId: string, value: number[]) => void
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

export function RulesTab({ safetyRules, onToggleRule, onUpdateThreshold }: RulesTabProps) {
  return (
    <div className="space-y-6">
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Safety Rules Configuration</CardTitle>
                <CardDescription>Configure and manage AI safety rules and thresholds</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Safety Rule</DialogTitle>
                    <DialogDescription>
                      Create a new safety rule to detect and handle potentially harmful content
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input id="rule-name" placeholder="e.g., Sensitive Information Detection" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rule-description">Description</Label>
                      <Textarea id="rule-description" placeholder="Describe what this rule detects and how it works" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rule-category">Category</Label>
                        <Select defaultValue="content">
                          <SelectTrigger id="rule-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content">Content</SelectItem>
                            <SelectItem value="behavior">Behavior</SelectItem>
                            <SelectItem value="personal">Personal Info</SelectItem>
                            <SelectItem value="harmful">Harmful</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="rule-severity">Severity</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger id="rule-severity">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rule-threshold">Threshold (75%)</Label>
                      <Slider defaultValue={[75]} max={100} step={1} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Rule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {safetyRules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  variants={itemVariants}
                  className="border rounded-lg p-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{rule.name}</h3>
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
                        <Badge variant="outline">{rule.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`threshold-${rule.id}`} className="text-sm">
                          Threshold: {rule.threshold}%
                        </Label>
                        <Slider
                          id={`threshold-${rule.id}`}
                          value={[rule.threshold]}
                          onValueChange={(value) => onUpdateThreshold(rule.id, value)}
                          max={100}
                          step={1}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`enabled-${rule.id}`} className="text-sm">
                          Enabled
                        </Label>
                        <Switch
                          id={`enabled-${rule.id}`}
                          checked={rule.enabled}
                          onCheckedChange={() => onToggleRule(rule.id)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                    <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                    <span>Last updated: {new Date(rule.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Rules
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Rules
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
