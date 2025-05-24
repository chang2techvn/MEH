"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PageHeader from "@/components/page-header"
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

// Mock data
const mockSafetyRules: SafetyRule[] = [
  {
    id: "rule-1",
    name: "Harmful Content Filter",
    description: "Detects and blocks content that could be harmful to users",
    severity: "high",
    enabled: true,
    threshold: 75,
    category: "harmful",
    createdAt: "2023-11-15T10:30:00Z",
    lastUpdated: "2024-04-10T14:22:00Z",
  },
  {
    id: "rule-2",
    name: "Personal Information Detection",
    description: "Identifies and redacts personal information in user content",
    severity: "critical",
    enabled: true,
    threshold: 85,
    category: "personal",
    createdAt: "2023-12-05T09:15:00Z",
    lastUpdated: "2024-04-12T11:45:00Z",
  },
  {
    id: "rule-3",
    name: "Inappropriate Language Filter",
    description: "Filters out profanity and inappropriate language",
    severity: "medium",
    enabled: true,
    threshold: 65,
    category: "content",
    createdAt: "2024-01-20T16:40:00Z",
    lastUpdated: "2024-04-05T09:30:00Z",
  },
  {
    id: "rule-4",
    name: "Spam Detection",
    description: "Identifies and filters spam content",
    severity: "low",
    enabled: false,
    threshold: 60,
    category: "behavior",
    createdAt: "2024-02-10T13:20:00Z",
    lastUpdated: "2024-03-28T15:10:00Z",
  },
  {
    id: "rule-5",
    name: "Toxic Behavior Detection",
    description: "Identifies toxic behavior patterns in user interactions",
    severity: "high",
    enabled: true,
    threshold: 70,
    category: "behavior",
    createdAt: "2024-01-05T11:30:00Z",
    lastUpdated: "2024-04-15T10:20:00Z",
  },
]

const mockFlaggedContent: FlaggedContent[] = [
  {
    id: "flag-1",
    content: "This content was flagged for potentially harmful language...",
    userId: "user-123",
    userName: "JohnDoe",
    timestamp: "2024-04-18T09:45:00Z",
    rule: "Harmful Content Filter",
    severity: "high",
    status: "pending",
    score: 82,
  },
  {
    id: "flag-2",
    content: "This submission contained personal information that was automatically redacted...",
    userId: "user-456",
    userName: "JaneSmith",
    timestamp: "2024-04-17T14:30:00Z",
    rule: "Personal Information Detection",
    severity: "critical",
    status: "reviewed",
    score: 91,
  },
  {
    id: "flag-3",
    content: "This message contained inappropriate language that was filtered...",
    userId: "user-789",
    userName: "MikeJohnson",
    timestamp: "2024-04-16T11:20:00Z",
    rule: "Inappropriate Language Filter",
    severity: "medium",
    status: "approved",
    score: 68,
  },
  {
    id: "flag-4",
    content: "This content was identified as potential spam...",
    userId: "user-101",
    userName: "SarahWilliams",
    timestamp: "2024-04-15T16:50:00Z",
    rule: "Spam Detection",
    severity: "low",
    status: "rejected",
    score: 62,
  },
  {
    id: "flag-5",
    content: "This interaction was flagged for toxic behavior patterns...",
    userId: "user-202",
    userName: "DavidBrown",
    timestamp: "2024-04-14T10:15:00Z",
    rule: "Toxic Behavior Detection",
    severity: "high",
    status: "pending",
    score: 76,
  },
]

const mockBannedTerms: BannedTerm[] = [
  {
    id: "term-1",
    term: "badword1",
    category: "Profanity",
    replacement: "****",
    addedBy: "Admin",
    addedAt: "2024-03-10T09:30:00Z",
  },
  {
    id: "term-2",
    term: "badword2",
    category: "Hate Speech",
    replacement: "****",
    addedBy: "Moderator",
    addedAt: "2024-03-15T14:20:00Z",
  },
  {
    id: "term-3",
    term: "badphrase1",
    category: "Harassment",
    replacement: "******",
    addedBy: "Admin",
    addedAt: "2024-03-20T11:45:00Z",
  },
  {
    id: "term-4",
    term: "inappropriateterm1",
    category: "Inappropriate",
    replacement: "***************",
    addedBy: "System",
    addedAt: "2024-03-25T16:10:00Z",
  },
  {
    id: "term-5",
    term: "sensitiveinfo",
    category: "Personal Information",
    replacement: "[redacted]",
    addedBy: "Admin",
    addedAt: "2024-04-01T10:30:00Z",
  },
]

const mockSafetyMetrics: SafetyMetric[] = [
  { name: "Content Safety Score", value: 92, change: 3, target: 95 },
  { name: "Flagged Content Rate", value: 2.4, change: -0.8, target: 2.0 },
  { name: "Response Time (min)", value: 4.2, change: -1.5, target: 3.0 },
  { name: "False Positive Rate", value: 3.1, change: -0.5, target: 2.5 },
]

export default function AISafetyPage() {
  const [safetyRules, setSafetyRules] = useState<SafetyRule[]>(mockSafetyRules)
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>(mockFlaggedContent)
  const [bannedTerms, setBannedTerms] = useState<BannedTerm[]>(mockBannedTerms)
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetric[]>(mockSafetyMetrics)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testContent, setTestContent] = useState("")
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // Filter flagged content based on search query
  const filteredFlaggedContent = flaggedContent.filter(
    (item) =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rule.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Toggle rule enabled state
  const toggleRuleEnabled = (ruleId: string) => {
    setSafetyRules(safetyRules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  // Update rule threshold
  const updateRuleThreshold = (ruleId: string, value: number[]) => {
    setSafetyRules(safetyRules.map((rule) => (rule.id === ruleId ? { ...rule, threshold: value[0] } : rule)))
  }

  // Add new banned term
  const addBannedTerm = (term: string, category: string, replacement: string) => {
    const newTerm: BannedTerm = {
      id: `term-${bannedTerms.length + 1}`,
      term,
      category,
      replacement,
      addedBy: "Admin",
      addedAt: new Date().toISOString(),
    }
    setBannedTerms([...bannedTerms, newTerm])
  }

  // Remove banned term
  const removeBannedTerm = (termId: string) => {
    setBannedTerms(bannedTerms.filter((term) => term.id !== termId))
  }

  // Update flagged content status
  const updateContentStatus = (contentId: string, status: "pending" | "reviewed" | "approved" | "rejected") => {
    setFlaggedContent(flaggedContent.map((item) => (item.id === contentId ? { ...item, status } : item)))
  }

  // Test content against safety rules
  const testContentSafety = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const mockTestResults = {
        overallSafetyScore: 78,
        flagged: true,
        triggeredRules: [
          {
            ruleName: "Inappropriate Language Filter",
            confidence: 82,
            severity: "medium",
          },
          {
            ruleName: "Personal Information Detection",
            confidence: 65,
            severity: "critical",
          },
        ],
        suggestedActions: [
          "Review and modify content to remove inappropriate language",
          "Remove or redact any personal information",
        ],
        modifiedContent: testContent.replace(/badword1|badword2/gi, "****"),
      }

      setTestResults(mockTestResults)
      setIsLoading(false)
    }, 1500)
  }

  // Save settings
  const saveSettings = () => {
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
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
