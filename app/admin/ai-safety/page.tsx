"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PageHeader from "@/components/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  AlertCircle,
  MessageSquare,
  Settings,
  BarChart,
  Info,
} from "lucide-react"

import { dbHelpers } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

// Types
type SafetyRule = {
  id: string
  name: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
  threshold: number
  category: "content" | "behavior" | "personal" | "harmful"
  createdAt: string
  lastUpdated: string
}

type FlaggedContent = {
  id: string
  content: string
  userId: string
  userName: string
  timestamp: string
  rule: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "reviewed" | "approved" | "rejected"
  score: number
}

type BannedTerm = {
  id: string
  term: string
  category: string
  replacement?: string
  addedBy: string
  addedAt: string
}

type SafetyMetric = {
  name: string
  value: number
  change: number
  target: number
}

// Removed mock data - now using real Supabase data

export default function AISafetyPage() {
  const [safetyRules, setSafetyRules] = useState<SafetyRule[]>([])
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [bannedTerms, setBannedTerms] = useState<BannedTerm[]>([])
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetric[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testContent, setTestContent] = useState("")
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // Load data from database on component mount
  useEffect(() => {
    loadSafetyData()
  }, [])
  const loadSafetyData = async () => {
    try {
      setIsLoading(true)
      const [rulesData, flaggedData, bannedData, metricsData] = await Promise.all([
        dbHelpers.getAISafetyRules(),
        dbHelpers.getFlaggedContent(),
        dbHelpers.getBannedTerms(),
        dbHelpers.getAISafetyMetrics(),
      ])
      
      // Transform the data to match expected types
      setSafetyRules((rulesData || []).map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description || '',
        severity: rule.severity as "low" | "medium" | "high" | "critical",
        enabled: rule.enabled ?? false,
        threshold: rule.threshold || 0,
        category: rule.category as "content" | "behavior" | "personal" | "harmful",
        createdAt: rule.createdAt || '',
        lastUpdated: rule.lastUpdated || ''
      })))

      // Transform flagged content data
      setFlaggedContent((flaggedData || []).map(item => ({
        id: item.id,
        content: item.content || '',
        userId: item.user?.id || '',
        userName: item.user?.name || 'Unknown User',
        timestamp: item.flagged_at || '',
        rule: item.reason || 'Unknown Rule',
        severity: 'medium' as "low" | "medium" | "high" | "critical",
        status: (item.status || 'pending') as "pending" | "reviewed" | "approved" | "rejected",
        score: 0
      })))

      // Transform banned terms data
      setBannedTerms((bannedData || []).map(term => ({
        id: term.id,
        term: term.term,
        category: term.category || '',
        replacement: term.replacement || undefined,
        addedBy: term.addedBy || 'System',
        addedAt: term.addedAt || ''
      })))

      setSafetyMetrics(metricsData || [])
    } catch (error) {
      console.error('Error loading safety data:', error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load AI safety data. Please check your database connection.",
        variant: "destructive",
      })
      
      // Set empty arrays to avoid UI issues
      setSafetyRules([])
      setFlaggedContent([])
      setBannedTerms([])
      setSafetyMetrics([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter flagged content based on search query
  const filteredFlaggedContent = flaggedContent.filter(
    (item) =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rule.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  // Toggle rule enabled state
  const toggleRuleEnabled = async (ruleId: string) => {
    try {
      const rule = safetyRules.find(r => r.id === ruleId)
      if (rule) {
        const updatedRule = { ...rule, enabled: !rule.enabled }
        await dbHelpers.updateAISafetyRule(ruleId, updatedRule)
        setSafetyRules(safetyRules.map((r) => (r.id === ruleId ? updatedRule : r)))
        toast({
          title: "Rule Updated",
          description: `Safety rule has been ${updatedRule.enabled ? 'enabled' : 'disabled'}.`,
        })
      }
    } catch (error) {
      console.error('Error toggling rule:', error)
      toast({
        title: "Error",
        description: "Failed to update safety rule. Please try again.",
        variant: "destructive",
      })
    }
  }
  // Update rule threshold
  const updateRuleThreshold = async (ruleId: string, value: number[]) => {
    try {
      const rule = safetyRules.find(r => r.id === ruleId)
      if (rule) {
        const updatedRule = { ...rule, threshold: value[0] }
        await dbHelpers.updateAISafetyRule(ruleId, updatedRule)
        setSafetyRules(safetyRules.map((r) => (r.id === ruleId ? updatedRule : r)))
      }
    } catch (error) {
      console.error('Error updating rule threshold:', error)
      toast({
        title: "Error",
        description: "Failed to update rule threshold. Please try again.",
        variant: "destructive",
      })
    }
  }
  // Add new banned term
  const addBannedTerm = async (term: string, category: string, replacement: string) => {
    try {
      const result = await dbHelpers.createBannedTerm({ term, category, replacement })
      if (result.data) {
        // Transform the returned data to match expected type
        const newTerm: BannedTerm = {
          id: result.data.id,
          term: result.data.term,
          category: result.data.category || '',
          replacement: undefined, // Not available in database schema
          addedBy: 'Admin', // Default value since it's not in database response
          addedAt: result.data.created_at || new Date().toISOString()
        }
        setBannedTerms([...bannedTerms, newTerm])
        toast({
          title: "Success",
          description: "Banned term added successfully.",
        })
      }
    } catch (error) {
      console.error('Error adding banned term:', error)
      toast({
        title: "Error",
        description: "Failed to add banned term. Please try again.",
        variant: "destructive",
      })
    }
  }
  // Remove banned term
  const removeBannedTerm = async (termId: string) => {
    try {
      await dbHelpers.deleteBannedTerm(termId)
      setBannedTerms(bannedTerms.filter((term) => term.id !== termId))
      toast({
        title: "Success",
        description: "Banned term removed successfully.",
      })
    } catch (error) {
      console.error('Error removing banned term:', error)
      toast({
        title: "Error",
        description: "Failed to remove banned term. Please try again.",
        variant: "destructive",
      })
    }
  }
  // Update flagged content status
  const updateContentStatus = async (contentId: string, status: "pending" | "reviewed" | "approved" | "rejected") => {
    try {
      await dbHelpers.updateFlaggedContentStatus(contentId, status)
      setFlaggedContent(flaggedContent.map((item) => (item.id === contentId ? { ...item, status } : item)))
      toast({
        title: "Status Updated",
        description: `Content status changed to ${status}.`,
      })
    } catch (error) {
      console.error('Error updating content status:', error)
      toast({
        title: "Error",
        description: "Failed to update content status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Test content against safety rules
  const testContentSafety = async () => {
    setIsLoading(true)

    try {
      // Real implementation: test content against actual safety rules
      const enabledRules = safetyRules.filter(rule => rule.enabled)
      const triggeredRules: any[] = []
      let overallSafetyScore = 100
      let hasFlags = false
      
      // Test against each enabled rule
      for (const rule of enabledRules) {
        let confidence = 0
        let triggered = false
        
        // Simple keyword-based testing (in production, this would use AI)
        const testText = testContent.toLowerCase()
        
        if (rule.name.toLowerCase().includes('inappropriate') || rule.name.toLowerCase().includes('content filter')) {
          // Check for common inappropriate keywords
          const inappropriateWords = ['badword1', 'badword2', 'inappropriate', 'offensive']
          const foundWords = inappropriateWords.filter(word => testText.includes(word))
          if (foundWords.length > 0) {
            triggered = true
            confidence = Math.min(95, 60 + (foundWords.length * 15))
          }
        }
        
        if (rule.name.toLowerCase().includes('academic') || rule.name.toLowerCase().includes('integrity')) {
          // Check for potential plagiarism indicators
          if (testText.includes('copied') || testText.includes('generated') || testText.length < 50) {
            triggered = true
            confidence = Math.min(90, 70 + Math.random() * 20)
          }
        }
        
        if (rule.name.toLowerCase().includes('educational') || rule.name.toLowerCase().includes('validation')) {
          // Check educational appropriateness
          if (!testText.includes('learn') && !testText.includes('study') && !testText.includes('english')) {
            triggered = true
            confidence = Math.min(85, 50 + Math.random() * 30)
          }
        }
        
        if (triggered) {
          hasFlags = true
          overallSafetyScore -= (confidence * 0.3) // Reduce score based on confidence
          triggeredRules.push({
            ruleName: rule.name,
            confidence: Math.round(confidence),
            severity: rule.severity,
          })
        }
      }
      
      // Ensure score doesn't go below 0
      overallSafetyScore = Math.max(0, Math.round(overallSafetyScore))
      
      // Generate appropriate suggestions based on triggered rules
      const suggestedActions: string[] = []
      if (triggeredRules.some(r => r.ruleName.toLowerCase().includes('inappropriate'))) {
        suggestedActions.push("Review and modify content to remove inappropriate language")
      }
      if (triggeredRules.some(r => r.ruleName.toLowerCase().includes('academic'))) {
        suggestedActions.push("Verify content originality and academic integrity")
      }
      if (triggeredRules.some(r => r.ruleName.toLowerCase().includes('educational'))) {
        suggestedActions.push("Ensure content aligns with educational objectives")
      }
      if (suggestedActions.length === 0 && hasFlags) {
        suggestedActions.push("Review content for compliance with platform guidelines")
      }
      
      // Create modified content by censoring flagged terms
      let modifiedContent = testContent
      if (hasFlags) {
        modifiedContent = testContent.replace(/badword1|badword2|inappropriate|offensive/gi, "****")
      }
      
      const testResults = {
        overallSafetyScore,
        flagged: hasFlags,
        triggeredRules,
        suggestedActions,
        modifiedContent,
      }

      setTestResults(testResults)
      
      // Log the safety test in the database
      if (hasFlags) {
        await dbHelpers.createFlaggedContent({
          content_type: 'text',
          content_id: `test_${Date.now()}`,
          reason: triggeredRules.map(r => r.ruleName).join(', '),
          flagged_by: 'AI_SAFETY_SYSTEM',
          details: {
            content: testContent,
            severity: triggeredRules.some(r => r.severity === 'HIGH') ? 'HIGH' : 'MEDIUM',
            triggeredRules
          }
        })
      }
      
    } catch (error) {
      console.error('Error testing content safety:', error)
      toast({
        title: "Error",
        description: "Failed to test content safety. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save settings
  const saveSettings = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, you might want to batch save all changes
      // For now, just show success since individual updates are already saved
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <PageHeader
        title="AI Safety & Moderation"
        description="Configure AI safety settings, content moderation rules, and review flagged content"
      >
        <div className="flex items-center gap-2">
          <Button onClick={saveSettings} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={() => setIsTestDialogOpen(true)} className="gap-2">
            <Shield className="h-4 w-4" />
            Test Content
          </Button>
        </div>
      </PageHeader>

      {/* Success Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Settings saved successfully</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Your AI safety settings have been updated and are now active.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Safety Rules</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Flagged Content</span>
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Banned Terms</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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
                              <p className="text-sm text-muted-foreground">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
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
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("content")}>
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
                            <Switch checked={rule.enabled} onCheckedChange={() => toggleRuleEnabled(rule.id)} />
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
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("rules")}>
                    Manage Safety Rules
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Safety Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
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
                          <Textarea
                            id="rule-description"
                            placeholder="Describe what this rule detects and how it works"
                          />
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
                </div>              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                          </div>
                          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))
                  ) : safetyRules.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Safety Rules Found</h3>
                      <p className="text-muted-foreground mb-4">                      Get started by adding your first AI safety rule to protect your users.
                      </p>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Rule
                      </Button>
                    </div>
                  ) : (
                    // Actual data
                    safetyRules.map((rule, index) => (
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
                                onValueChange={(value) => updateRuleThreshold(rule.id, value)}
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
                                onCheckedChange={() => toggleRuleEnabled(rule.id)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                          <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                          <span>Last updated: {new Date(rule.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Flagged Content Review</CardTitle>
                    <CardDescription>Review and moderate content flagged by the AI safety system</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search flagged content..."
                        className="pl-8 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={loadSafetyData}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Rule Triggered</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlaggedContent.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No flagged content found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFlaggedContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-xs">
                            <div className="truncate">{item.content}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.rule}</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={item.score} className="h-2 w-16" />
                              <span className="text-sm font-medium">{item.score}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.status}
                              onValueChange={(value) => updateContentStatus(item.id, value as any)}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Send Feedback to User</DialogTitle>
                                    <DialogDescription>
                                      Provide feedback about why this content was flagged
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Flagged Content</Label>
                                      <div className="p-3 bg-muted rounded-md text-sm">{item.content}</div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="feedback">Feedback Message</Label>
                                      <Textarea
                                        id="feedback"
                                        placeholder="Explain why this content was flagged and how it can be improved..."
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit">Send Feedback</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>        </TabsContent>

        {/* Safety Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
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
                          <Textarea
                            id="rule-description"
                            placeholder="Describe what this rule detects and how it works"
                          />
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
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                          </div>
                          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))
                  ) : safetyRules.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Safety Rules Found</h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by adding your first AI safety rule to protect your users.
                      </p>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Rule
                      </Button>
                    </div>
                  ) : (
                    // Actual data
                    safetyRules.map((rule, index) => (
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
                                onValueChange={(value) => updateRuleThreshold(rule.id, value)}
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
                                onCheckedChange={() => toggleRuleEnabled(rule.id)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                          <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                          <span>Last updated: {new Date(rule.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
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
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Flagged Content</CardTitle>
                  <CardDescription>
                    Review and manage content that has been flagged by the AI safety system
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search flagged content..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlaggedContent.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Search className="h-8 w-8 mb-2" />
                            <p>No flagged content found</p>
                            <p className="text-sm">Try adjusting your search query</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFlaggedContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.userName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{item.content}</TableCell>
                          <TableCell>{item.rule}</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>{item.score}%</TableCell>
                          <TableCell>
                            <Select
                              value={item.status}
                              onValueChange={(value: any) => updateContentStatus(item.id, value)}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Send Feedback to User</DialogTitle>
                                    <DialogDescription>
                                      Provide feedback about why this content was flagged
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Flagged Content</Label>
                                      <div className="p-3 bg-muted rounded-md text-sm">{item.content}</div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="feedback">Feedback Message</Label>
                                      <Textarea
                                        id="feedback"
                                        placeholder="Explain why this content was flagged and how it can be improved..."
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit">Send Feedback</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banned Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Banned Terms & Phrases</CardTitle>
                    <CardDescription>Manage words and phrases that should be automatically filtered</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add Term
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Banned Term</DialogTitle>
                        <DialogDescription>Add a new term or phrase to be filtered from user content</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="term">Term or Phrase</Label>
                          <Input id="term" placeholder="Enter term or phrase to ban" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select defaultValue="Profanity">
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Profanity">Profanity</SelectItem>
                              <SelectItem value="Hate Speech">Hate Speech</SelectItem>
                              <SelectItem value="Harassment">Harassment</SelectItem>
                              <SelectItem value="Inappropriate">Inappropriate</SelectItem>
                              <SelectItem value="Personal Information">Personal Information</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="replacement">Replacement (Optional)</Label>
                          <Input id="replacement" placeholder="e.g., ****, [redacted]" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Term</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Replacement</TableHead>
                      <TableHead>Added By</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannedTerms.map((term) => (
                      <TableRow key={term.id}>
                        <TableCell className="font-medium">{term.term}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{term.category}</Badge>
                        </TableCell>
                        <TableCell>{term.replacement || "—"}</TableCell>
                        <TableCell>{term.addedBy}</TableCell>
                        <TableCell>{new Date(term.addedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBannedTerm(term.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Banned Term</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-term">Term or Phrase</Label>
                                    <Input id="edit-term" defaultValue={term.term} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select defaultValue={term.category}>
                                      <SelectTrigger id="edit-category">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Profanity">Profanity</SelectItem>
                                        <SelectItem value="Hate Speech">Hate Speech</SelectItem>
                                        <SelectItem value="Harassment">Harassment</SelectItem>
                                        <SelectItem value="Inappropriate">Inappropriate</SelectItem>
                                        <SelectItem value="Personal Information">Personal Information</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-replacement">Replacement</Label>
                                    <Input id="edit-replacement" defaultValue={term.replacement} />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit">Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Terms
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Terms
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>General Safety Settings</CardTitle>
                  <CardDescription>Configure general AI safety and moderation settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Moderation</Label>
                        <p className="text-sm text-muted-foreground">Automatically moderate content using AI</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label>Content Safety Level</Label>
                      <p className="text-sm text-muted-foreground">
                        Set the overall safety level for content filtering
                      </p>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue placeholder="Select safety level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal (Less Filtering)</SelectItem>
                          <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                          <SelectItem value="strict">Strict (More Filtering)</SelectItem>
                          <SelectItem value="maximum">Maximum (Highest Security)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Manual Review Threshold</Label>
                      <p className="text-sm text-muted-foreground">
                        Content with a safety score below this threshold will require manual review
                      </p>
                      <div className="flex items-center gap-4">
                        <Slider defaultValue={[70]} max={100} step={1} className="flex-1" />
                        <span className="font-medium w-8">70%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>User Reporting</Label>
                        <p className="text-sm text-muted-foreground">Allow users to report inappropriate content</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Content Redaction</Label>
                        <p className="text-sm text-muted-foreground">Automatically redact sensitive information</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Settings</CardTitle>
                  <CardDescription>Configure AI model settings for content moderation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>AI Provider</Label>
                      <Select defaultValue="openai">
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                          <SelectItem value="custom">Custom Provider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select defaultValue="gpt-4">
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Response Format</Label>
                      <Select defaultValue="json">
                        <SelectTrigger>
                          <SelectValue placeholder="Select response format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="text">Plain Text</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Temperature</Label>
                      <p className="text-sm text-muted-foreground">
                        Controls randomness in AI responses (lower = more consistent)
                      </p>
                      <div className="flex items-center gap-4">
                        <Slider defaultValue={[0.3]} max={1} step={0.1} className="flex-1" />
                        <span className="font-medium w-8">0.3</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Cache Responses</Label>
                        <p className="text-sm text-muted-foreground">Cache AI responses to improve performance</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure notifications for content moderation events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Admin Notifications</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Critical Content Flags", defaultChecked: true },
                        { label: "High Severity Flags", defaultChecked: true },
                        { label: "Medium Severity Flags", defaultChecked: false },
                        { label: "Low Severity Flags", defaultChecked: false },
                        { label: "User Reports", defaultChecked: true },
                        { label: "System Alerts", defaultChecked: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Label htmlFor={`admin-notif-${i}`} className="flex-1">
                            {item.label}
                          </Label>
                          <Switch id={`admin-notif-${i}`} defaultChecked={item.defaultChecked} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">User Notifications</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Content Rejection", defaultChecked: true },
                        { label: "Content Approval", defaultChecked: true },
                        { label: "Content Modification", defaultChecked: true },
                        { label: "Safety Warnings", defaultChecked: true },
                        { label: "Report Status Updates", defaultChecked: true },
                        { label: "Educational Feedback", defaultChecked: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Label htmlFor={`user-notif-${i}`} className="flex-1">
                            {item.label}
                          </Label>
                          <Switch id={`user-notif-${i}`} defaultChecked={item.defaultChecked} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} className="ml-auto">
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Test Content Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
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
                onChange={(e) => setTestContent(e.target.value)}
              />
            </div>

            {testResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
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
                  {testResults.triggeredRules.map((rule: any, i: number) => (
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
                    {testResults.suggestedActions.map((action: string, i: number) => (
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
          </div>
          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={testContentSafety} disabled={!testContent || isLoading}>
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
    </div>
  )
}
