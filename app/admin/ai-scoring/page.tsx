"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Key,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Star,
  Trash,
  HelpCircle,
  Info,
  Award,
  Brain,
  Sliders,
  History,
  PlayCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Lightbulb,
  Mic,
  BookOpen,
  PenTool,
  Clipboard,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define types for our scoring criteria
interface ScoringCriterion {
  id: string
  name: string
  description: string
  weight: number
  enabled: boolean
  promptInstructions: string
  category: "grammar" | "content" | "originality" | "presentation" | "custom"
  subCriteria?: {
    id: string
    name: string
    description: string
    weight: number
    enabled: boolean
  }[]
}

interface ScoringTemplate {
  id: string
  name: string
  description: string
  criteria: string[] // IDs of criteria
  isDefault: boolean
  createdAt: Date
  lastUsed: Date | null
  challengeTypes: string[]
}

interface EvaluationLog {
  id: string
  userId: string
  username: string
  submissionId: string
  challengeId: string
  challengeName: string
  score: number
  timestamp: Date
  template: string
  status: "success" | "failed" | "pending"
  processingTime: number
}

interface TestSubmission {
  id: string
  content: string
  videoTranscript?: string
  originalTranscript: string
}

interface ContentEvaluation {
  score: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
  grammarScore: number
  contentScore: number
  originalityScore: number
}

export default function AIScoringPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("criteria")
  const [isLoading, setIsLoading] = useState(true)
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriterion[]>([])
  const [scoringTemplates, setScoringTemplates] = useState<ScoringTemplate[]>([])
  const [evaluationLogs, setEvaluationLogs] = useState<EvaluationLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showAddCriterionDialog, setShowAddCriterionDialog] = useState(false)
  const [showEditCriterionDialog, setShowEditCriterionDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showAddTemplateDialog, setShowAddTemplateDialog] = useState(false)
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false)
  const [showTestEvaluationDialog, setShowTestEvaluationDialog] = useState(false)
  const [selectedCriterion, setSelectedCriterion] = useState<ScoringCriterion | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ScoringTemplate | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("7d")
  const [testSubmission, setTestSubmission] = useState<TestSubmission>({
    id: "test-1",
    content: "",
    videoTranscript: "",
    originalTranscript: "This is a sample original transcript for testing purposes.",
  })
  const [testResult, setTestResult] = useState<ContentEvaluation | null>(null)
  const [isTestingEvaluation, setIsTestingEvaluation] = useState(false)
  const [newCriterion, setNewCriterion] = useState<Partial<ScoringCriterion>>({
    name: "",
    description: "",
    weight: 1,
    enabled: true,
    promptInstructions: "",
    category: "grammar",
  })
  const [newTemplate, setNewTemplate] = useState<Partial<ScoringTemplate>>({
    name: "",
    description: "",
    criteria: [],
    challengeTypes: [],
  })
  const [aiProvider, setAiProvider] = useState<string>("gemini")
  const [aiModel, setAiModel] = useState<string>("gemini-pro")
  const [autoEvaluationEnabled, setAutoEvaluationEnabled] = useState(true)
  const [minimumScoreThreshold, setMinimumScoreThreshold] = useState(60)
  const [autoPublishThreshold, setAutoPublishThreshold] = useState(75)

  // Sample data for scoring criteria
  const sampleScoringCriteria: ScoringCriterion[] = [
    {
      id: "criterion-1",
      name: "Grammar & Language Usage",
      description: "Evaluates correct grammar, syntax, and appropriate language use",
      weight: 30,
      enabled: true,
      promptInstructions:
        "Evaluate the grammar, syntax, and language usage. Check for proper sentence structure, verb tense consistency, and appropriate word choice.",
      category: "grammar",
      subCriteria: [
        {
          id: "sub-1-1",
          name: "Sentence Structure",
          description: "Proper formation of sentences",
          weight: 40,
          enabled: true,
        },
        {
          id: "sub-1-2",
          name: "Verb Tense Consistency",
          description: "Consistent use of verb tenses",
          weight: 30,
          enabled: true,
        },
        {
          id: "sub-1-3",
          name: "Word Choice",
          description: "Appropriate vocabulary and word selection",
          weight: 30,
          enabled: true,
        },
      ],
    },
    {
      id: "criterion-2",
      name: "Content Accuracy & Completeness",
      description: "Measures how accurately the content reflects the original material",
      weight: 35,
      enabled: true,
      promptInstructions:
        "Assess how accurately the content captures the key points from the original transcript. Check for completeness and factual accuracy.",
      category: "content",
      subCriteria: [
        {
          id: "sub-2-1",
          name: "Key Point Coverage",
          description: "Inclusion of all important points from original",
          weight: 50,
          enabled: true,
        },
        {
          id: "sub-2-2",
          name: "Factual Accuracy",
          description: "Correctness of facts presented",
          weight: 50,
          enabled: true,
        },
      ],
    },
    {
      id: "criterion-3",
      name: "Originality & Creativity",
      description: "Evaluates creative expression and original thinking",
      weight: 20,
      enabled: true,
      promptInstructions:
        "Evaluate the originality and creativity of the content. Look for unique perspectives, creative expression, and avoidance of plagiarism.",
      category: "originality",
      subCriteria: [
        {
          id: "sub-3-1",
          name: "Unique Perspective",
          description: "Original viewpoints and insights",
          weight: 40,
          enabled: true,
        },
        {
          id: "sub-3-2",
          name: "Creative Expression",
          description: "Innovative ways of expressing ideas",
          weight: 40,
          enabled: true,
        },
        {
          id: "sub-3-3",
          name: "Plagiarism Avoidance",
          description: "Content is not copied from source",
          weight: 20,
          enabled: true,
        },
      ],
    },
    {
      id: "criterion-4",
      name: "Pronunciation & Fluency",
      description: "Evaluates speech clarity, pronunciation, and natural flow",
      weight: 40,
      enabled: true,
      promptInstructions:
        "Assess pronunciation accuracy, speech clarity, and natural fluency. Check for proper stress, intonation, and rhythm.",
      category: "presentation",
      subCriteria: [
        {
          id: "sub-4-1",
          name: "Pronunciation Accuracy",
          description: "Correct pronunciation of words",
          weight: 40,
          enabled: true,
        },
        {
          id: "sub-4-2",
          name: "Speech Clarity",
          description: "Clear and understandable speech",
          weight: 30,
          enabled: true,
        },
        {
          id: "sub-4-3",
          name: "Natural Flow",
          description: "Natural rhythm and pacing",
          weight: 30,
          enabled: true,
        },
      ],
    },
    {
      id: "criterion-5",
      name: "Presentation Style",
      description: "Evaluates engagement, body language, and visual presentation",
      weight: 25,
      enabled: true,
      promptInstructions:
        "Evaluate the presentation style including engagement, body language, eye contact, and visual aids if applicable.",
      category: "presentation",
      subCriteria: [
        {
          id: "sub-5-1",
          name: "Engagement",
          description: "Ability to engage the audience",
          weight: 40,
          enabled: true,
        },
        {
          id: "sub-5-2",
          name: "Body Language",
          description: "Appropriate gestures and posture",
          weight: 30,
          enabled: true,
        },
        {
          id: "sub-5-3",
          name: "Eye Contact",
          description: "Maintaining appropriate eye contact",
          weight: 30,
          enabled: true,
        },
      ],
    },
  ]

  // Sample data for scoring templates
  const sampleScoringTemplates: ScoringTemplate[] = [
    {
      id: "template-1",
      name: "Standard Content Evaluation",
      description: "General-purpose template for evaluating written content submissions",
      criteria: ["criterion-1", "criterion-2", "criterion-3"],
      isDefault: true,
      createdAt: new Date(2023, 5, 15),
      lastUsed: new Date(2023, 6, 28),
      challengeTypes: ["writing", "comprehension"],
    },
    {
      id: "template-2",
      name: "Video Presentation Assessment",
      description: "Template for evaluating video presentations and speaking exercises",
      criteria: ["criterion-1", "criterion-4", "criterion-5"],
      isDefault: false,
      createdAt: new Date(2023, 7, 10),
      lastUsed: new Date(2023, 8, 5),
      challengeTypes: ["speaking", "presentation"],
    },
    {
      id: "template-3",
      name: "Comprehensive Evaluation",
      description: "Full evaluation covering all aspects of content and presentation",
      criteria: ["criterion-1", "criterion-2", "criterion-3", "criterion-4", "criterion-5"],
      isDefault: false,
      createdAt: new Date(2023, 9, 20),
      lastUsed: null,
      challengeTypes: ["comprehensive", "final-project"],
    },
  ]

  // Sample data for evaluation logs
  const generateEvaluationLogs = () => {
    const logs: EvaluationLog[] = []
    const now = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const usernames = ["john_doe", "emma_smith", "alex_wong", "maria_garcia", "james_brown"]
    const challengeNames = [
      "Business English Basics",
      "Public Speaking Challenge",
      "Academic Writing Exercise",
      "Daily Conversation Practice",
      "Technical Vocabulary Quiz",
    ]
    const templates = ["Standard Content Evaluation", "Video Presentation Assessment", "Comprehensive Evaluation"]
    const statuses: ("success" | "failed" | "pending")[] = ["success", "success", "success", "failed", "pending"]

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * days)
      const date = new Date(now)
      date.setDate(date.getDate() - daysAgo)

      logs.push({
        id: `log-${i + 1}`,
        userId: `user-${Math.floor(Math.random() * 100) + 1}`,
        username: usernames[Math.floor(Math.random() * usernames.length)],
        submissionId: `submission-${Math.floor(Math.random() * 1000) + 1}`,
        challengeId: `challenge-${Math.floor(Math.random() * 10) + 1}`,
        challengeName: challengeNames[Math.floor(Math.random() * challengeNames.length)],
        score: Math.floor(Math.random() * 41) + 60, // 60-100
        timestamp: date,
        template: templates[Math.floor(Math.random() * templates.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        processingTime: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
      })
    }

    // Sort by date descending
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setScoringCriteria(sampleScoringCriteria)
      setScoringTemplates(sampleScoringTemplates)
      setEvaluationLogs(generateEvaluationLogs())
      setIsLoading(false)
    }

    loadData()
  }, [timeRange])

  // Filter criteria based on search and category filter
  const filteredCriteria = scoringCriteria.filter((criterion) => {
    const matchesSearch =
      criterion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      criterion.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || criterion.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Filter templates based on search
  const filteredTemplates = scoringTemplates.filter((template) => {
    return (
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Filter logs based on search
  const filteredLogs = evaluationLogs.filter((log) => {
    return (
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.challengeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.template.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Handle adding a new criterion
  const handleAddCriterion = () => {
    if (!newCriterion.name || !newCriterion.description || !newCriterion.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newCriterionObj: ScoringCriterion = {
        id: `criterion-${scoringCriteria.length + 1}`,
        name: newCriterion.name || "",
        description: newCriterion.description || "",
        weight: newCriterion.weight || 1,
        enabled: newCriterion.enabled !== undefined ? newCriterion.enabled : true,
        promptInstructions: newCriterion.promptInstructions || "",
        category: newCriterion.category as "grammar" | "content" | "originality" | "presentation" | "custom",
        subCriteria: [],
      }

      setScoringCriteria([...scoringCriteria, newCriterionObj])
      setIsLoading(false)
      setShowAddCriterionDialog(false)
      setNewCriterion({
        name: "",
        description: "",
        weight: 1,
        enabled: true,
        promptInstructions: "",
        category: "grammar",
      })

      toast({
        title: "Criterion added",
        description: "Your new scoring criterion has been added successfully",
      })
    }, 1000)
  }

  // Handle editing a criterion
  const handleEditCriterion = () => {
    if (!selectedCriterion || !newCriterion.name || !newCriterion.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedCriteria = scoringCriteria.map((criterion) => {
        if (criterion.id === selectedCriterion.id) {
          return {
            ...criterion,
            name: newCriterion.name || criterion.name,
            description: newCriterion.description || criterion.description,
            weight: newCriterion.weight !== undefined ? newCriterion.weight : criterion.weight,
            enabled: newCriterion.enabled !== undefined ? newCriterion.enabled : criterion.enabled,
            promptInstructions: newCriterion.promptInstructions || criterion.promptInstructions,
            category:
              (newCriterion.category as "grammar" | "content" | "originality" | "presentation" | "custom") ||
              criterion.category,
          }
        }
        return criterion
      })

      setScoringCriteria(updatedCriteria)
      setIsLoading(false)
      setShowEditCriterionDialog(false)
      setSelectedCriterion(null)
      setNewCriterion({
        name: "",
        description: "",
        weight: 1,
        enabled: true,
        promptInstructions: "",
        category: "grammar",
      })

      toast({
        title: "Criterion updated",
        description: "Your scoring criterion has been updated successfully",
      })
    }, 1000)
  }

  // Handle deleting a criterion
  const handleDeleteCriterion = () => {
    if (!selectedCriterion) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedCriteria = scoringCriteria.filter((criterion) => criterion.id !== selectedCriterion.id)

      // Also update templates that use this criterion
      const updatedTemplates = scoringTemplates.map((template) => {
        if (template.criteria.includes(selectedCriterion.id)) {
          return {
            ...template,
            criteria: template.criteria.filter((id) => id !== selectedCriterion.id),
          }
        }
        return template
      })

      setScoringCriteria(updatedCriteria)
      setScoringTemplates(updatedTemplates)
      setIsLoading(false)
      setShowDeleteConfirmDialog(false)
      setSelectedCriterion(null)

      toast({
        title: "Criterion deleted",
        description: "The scoring criterion has been deleted successfully",
      })
    }, 1000)
  }

  // Handle toggling a criterion's enabled status
  const handleToggleCriterionEnabled = (criterionId: string, newStatus: boolean) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedCriteria = scoringCriteria.map((criterion) => {
        if (criterion.id === criterionId) {
          return {
            ...criterion,
            enabled: newStatus,
          }
        }
        return criterion
      })

      setScoringCriteria(updatedCriteria)
      setIsLoading(false)

      toast({
        title: newStatus ? "Criterion enabled" : "Criterion disabled",
        description: `The scoring criterion has been ${newStatus ? "enabled" : "disabled"} successfully`,
      })
    }, 500)
  }

  // Handle adding a new template
  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.description || !newTemplate.criteria || newTemplate.criteria.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select at least one criterion",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newTemplateObj: ScoringTemplate = {
        id: `template-${scoringTemplates.length + 1}`,
        name: newTemplate.name || "",
        description: newTemplate.description || "",
        criteria: newTemplate.criteria || [],
        isDefault: false,
        createdAt: new Date(),
        lastUsed: null,
        challengeTypes: newTemplate.challengeTypes || [],
      }

      setScoringTemplates([...scoringTemplates, newTemplateObj])
      setIsLoading(false)
      setShowAddTemplateDialog(false)
      setNewTemplate({
        name: "",
        description: "",
        criteria: [],
        challengeTypes: [],
      })

      toast({
        title: "Template added",
        description: "Your new scoring template has been added successfully",
      })
    }, 1000)
  }

  // Handle editing a template
  const handleEditTemplate = () => {
    if (
      !selectedTemplate ||
      !newTemplate.name ||
      !newTemplate.description ||
      !newTemplate.criteria ||
      newTemplate.criteria.length === 0
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select at least one criterion",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedTemplates = scoringTemplates.map((template) => {
        if (template.id === selectedTemplate.id) {
          return {
            ...template,
            name: newTemplate.name || template.name,
            description: newTemplate.description || template.description,
            criteria: newTemplate.criteria || template.criteria,
            challengeTypes: newTemplate.challengeTypes || template.challengeTypes,
          }
        }
        return template
      })

      setScoringTemplates(updatedTemplates)
      setIsLoading(false)
      setShowEditTemplateDialog(false)
      setSelectedTemplate(null)
      setNewTemplate({
        name: "",
        description: "",
        criteria: [],
        challengeTypes: [],
      })

      toast({
        title: "Template updated",
        description: "Your scoring template has been updated successfully",
      })
    }, 1000)
  }

  // Handle setting a template as default
  const handleSetDefaultTemplate = (templateId: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedTemplates = scoringTemplates.map((template) => ({
        ...template,
        isDefault: template.id === templateId,
      }))

      setScoringTemplates(updatedTemplates)
      setIsLoading(false)

      toast({
        title: "Default template updated",
        description: "The default scoring template has been updated successfully",
      })
    }, 500)
  }

  // Handle test evaluation
  const handleTestEvaluation = () => {
    if (!testSubmission.content) {
      toast({
        title: "Missing content",
        description: "Please enter some content to evaluate",
        variant: "destructive",
      })
      return
    }

    setIsTestingEvaluation(true)

    // Simulate API call
    setTimeout(() => {
      // Generate a mock evaluation result
      const result: ContentEvaluation = {
        score: Math.floor(Math.random() * 31) + 70, // 70-100
        feedback:
          "The content demonstrates good understanding of the key points from the original transcript. The grammar is generally correct with a few minor errors. The content is well-organized and shows some originality in expression.",
        strengths: [
          "Good understanding of the main concepts",
          "Well-structured content",
          "Appropriate vocabulary usage",
          "Clear expression of ideas",
        ],
        weaknesses: [
          "A few grammatical errors in complex sentences",
          "Could include more specific examples",
          "Some phrases could be more concise",
        ],
        grammarScore: Math.floor(Math.random() * 21) + 75, // 75-95
        contentScore: Math.floor(Math.random() * 21) + 75, // 75-95
        originalityScore: Math.floor(Math.random() * 31) + 65, // 65-95
      }

      setTestResult(result)
      setIsTestingEvaluation(false)

      toast({
        title: "Evaluation complete",
        description: "Test evaluation has been completed successfully",
      })
    }, 2000)
  }

  // Handle saving AI settings
  const handleSaveAISettings = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      toast({
        title: "Settings saved",
        description: "AI evaluation settings have been saved successfully",
      })
    }, 1000)
  }

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get category color and icon
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "grammar":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: <BookOpen className="h-4 w-4" />,
          label: "Grammar & Language",
        }
      case "content":
        return {
          color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: <FileText className="h-4 w-4" />,
          label: "Content",
        }
      case "originality":
        return {
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          icon: <Lightbulb className="h-4 w-4" />,
          label: "Originality",
        }
      case "presentation":
        return {
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          icon: <Mic className="h-4 w-4" />,
          label: "Presentation",
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: <PenTool className="h-4 w-4" />,
          label: "Custom",
        }
    }
  }

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "success":
        return {
          color: "text-green-500",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          icon: <CheckCircle2 className="h-4 w-4" />,
        }
      case "failed":
        return {
          color: "text-red-500",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          icon: <XCircle className="h-4 w-4" />,
        }
      case "pending":
        return {
          color: "text-amber-500",
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        }
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          icon: <Info className="h-4 w-4" />,
        }
    }
  }

  // Format processing time
  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
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

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
              AI Scoring Management
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure how AI evaluates and scores user submissions after completing challenges
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowTestEvaluationDialog(true)}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Test Evaluation
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Test the AI evaluation with sample content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
            onClick={handleSaveAISettings}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger
              value="criteria"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Sliders className="h-4 w-4" />
              <span>Scoring Criteria</span>
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Clipboard className="h-4 w-4" />
              <span>Scoring Templates</span>
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <History className="h-4 w-4" />
              <span>Evaluation Logs</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Settings className="h-4 w-4" />
              <span>AI Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Scoring Criteria Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "criteria" && (
              <motion.div
                key="criteria"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="criteria" className="space-y-6 mt-0">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search criteria..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="grammar">Grammar & Language</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="originality">Originality</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => setShowAddCriterionDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Criterion
                      </Button>
                    </div>
                  </div>

                  {/* Criteria List */}
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {isLoading ? (
                      // Loading skeletons
                      Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={`skeleton-${i}`}
                          variants={itemVariants}
                          className="rounded-lg border p-4 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </motion.div>
                      ))
                    ) : filteredCriteria.length === 0 ? (
                      // Empty state
                      <motion.div variants={fadeInVariants} className="text-center py-12 border rounded-lg">
                        <Sliders className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-medium">No scoring criteria found</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                          {searchQuery || filterCategory !== "all"
                            ? "Try adjusting your search or filters"
                            : "Add your first scoring criterion to get started"}
                        </p>
                        <Button onClick={() => setShowAddCriterionDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Scoring Criterion
                        </Button>
                      </motion.div>
                    ) : (
                      // Criteria list
                      filteredCriteria.map((criterion) => {
                        const categoryInfo = getCategoryInfo(criterion.category)
                        return (
                          <motion.div
                            key={criterion.id}
                            variants={itemVariants}
                            className={`rounded-lg border ${
                              expandedCard === criterion.id ? "shadow-lg" : "hover:shadow-md"
                            } transition-all duration-300`}
                          >
                            <div className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryInfo.color}`}
                                  >
                                    {categoryInfo.icon}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">{criterion.name}</h3>
                                      <Badge variant="outline" className={categoryInfo.color}>
                                        {categoryInfo.label}
                                      </Badge>
                                      {!criterion.enabled && (
                                        <Badge
                                          variant="outline"
                                          className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        >
                                          Disabled
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                  <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-1">
                                    <span className="text-sm font-medium">Weight:</span>
                                    <span className="text-sm">{criterion.weight}%</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setExpandedCard(expandedCard === criterion.id ? null : criterion.id)
                                    }}
                                  >
                                    {expandedCard === criterion.id ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded details */}
                              <AnimatePresence>
                                {expandedCard === criterion.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="border-t mt-4 pt-4 space-y-4">
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Prompt Instructions</h4>
                                        <div className="bg-muted/50 rounded-md p-3 text-sm">
                                          {criterion.promptInstructions || "No specific instructions provided."}
                                        </div>
                                      </div>

                                      {criterion.subCriteria && criterion.subCriteria.length > 0 && (
                                        <div className="space-y-2">
                                          <h4 className="text-sm font-medium">Sub-criteria</h4>
                                          <div className="space-y-2">
                                            {criterion.subCriteria.map((sub) => (
                                              <div
                                                key={sub.id}
                                                className="flex justify-between items-center bg-muted/30 rounded-md p-2"
                                              >
                                                <div>
                                                  <p className="text-sm font-medium">{sub.name}</p>
                                                  <p className="text-xs text-muted-foreground">{sub.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs">Weight: {sub.weight}%</span>
                                                  {!sub.enabled && (
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                    >
                                                      Disabled
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedCriterion(criterion)
                                            setNewCriterion({
                                              name: criterion.name,
                                              description: criterion.description,
                                              weight: criterion.weight,
                                              enabled: criterion.enabled,
                                              promptInstructions: criterion.promptInstructions,
                                              category: criterion.category,
                                            })
                                            setShowEditCriterionDialog(true)
                                          }}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleToggleCriterionEnabled(criterion.id, !criterion.enabled)}
                                        >
                                          {criterion.enabled ? (
                                            <>
                                              <EyeOff className="h-4 w-4 mr-2" />
                                              Disable
                                            </>
                                          ) : (
                                            <>
                                              <Eye className="h-4 w-4 mr-2" />
                                              Enable
                                            </>
                                          )}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                          onClick={() => {
                                            setSelectedCriterion(criterion)
                                            setShowDeleteConfirmDialog(true)
                                          }}
                                        >
                                          <Trash className="h-4 w-4 mr-2" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </motion.div>
                </TabsContent>
              </motion.div>
            )}

            {/* Scoring Templates Tab */}
            {activeTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="templates" className="space-y-6 mt-0">
                  {/* Search and Add Button */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => setShowAddTemplateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </div>

                  {/* Templates Grid */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {isLoading ? (
                      // Loading skeletons
                      Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={`skeleton-${i}`}
                          variants={itemVariants}
                          className="rounded-lg border p-4 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </motion.div>
                      ))
                    ) : filteredTemplates.length === 0 ? (
                      // Empty state
                      <motion.div
                        variants={fadeInVariants}
                        className="text-center py-12 border rounded-lg col-span-full"
                      >
                        <Clipboard className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-medium">No scoring templates found</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                          {searchQuery ? "Try adjusting your search" : "Add your first scoring template to get started"}
                        </p>
                        <Button onClick={() => setShowAddTemplateDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Scoring Template
                        </Button>
                      </motion.div>
                    ) : (
                      // Templates grid
                      filteredTemplates.map((template) => (
                        <motion.div
                          key={template.id}
                          variants={itemVariants}
                          className={`rounded-lg border ${
                            template.isDefault
                              ? "border-neo-mint/50 dark:border-purist-blue/50 bg-neo-mint/5 dark:bg-purist-blue/5"
                              : ""
                          } hover:shadow-md transition-all duration-300`}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{template.name}</h3>
                              {template.isDefault && (
                                <Badge
                                  variant="outline"
                                  className="bg-neo-mint/20 text-neo-mint-foreground border-neo-mint/30"
                                >
                                  Default
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mt-2">{template.description}</p>

                            <div className="mt-3">
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Included Criteria:</h4>
                              <div className="flex flex-wrap gap-2">
                                {template.criteria.map((criterionId) => {
                                  const criterion = scoringCriteria.find((c) => c.id === criterionId)
                                  if (!criterion) return null
                                  const categoryInfo = getCategoryInfo(criterion.category)
                                  return (
                                    <Badge key={criterionId} variant="outline" className={categoryInfo.color}>
                                      {categoryInfo.icon}
                                      <span className="ml-1">{criterion.name}</span>
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>

                            <div className="mt-3">
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Challenge Types:</h4>
                              <div className="flex flex-wrap gap-2">
                                {template.challengeTypes.map((type) => (
                                  <Badge key={type} variant="outline">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="block">Created</span>
                                <span className="font-medium text-foreground">{formatDate(template.createdAt)}</span>
                              </div>
                              <div>
                                <span className="block">Last Used</span>
                                <span className="font-medium text-foreground">{formatDate(template.lastUsed)}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedTemplate(template)
                                  setNewTemplate({
                                    name: template.name,
                                    description: template.description,
                                    criteria: template.criteria,
                                    challengeTypes: template.challengeTypes,
                                  })
                                  setShowEditTemplateDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              {!template.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleSetDefaultTemplate(template.id)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Set Default
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </TabsContent>
              </motion.div>
            )}

            {/* Evaluation Logs Tab */}
            {activeTab === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="logs" className="space-y-6 mt-0">
                  {/* Search and Time Range */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Time range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setTimeRange(timeRange)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Logs Table */}
                  <motion.div
                    variants={fadeInVariants}
                    className="rounded-lg border overflow-hidden bg-white dark:bg-gray-950"
                  >
                    {isLoading ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredLogs.length === 0 ? (
                      <div className="text-center py-12">
                        <History className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-medium">No evaluation logs found</h3>
                        <p className="text-muted-foreground mt-2">
                          {searchQuery ? "Try adjusting your search" : "Evaluation logs will appear here"}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Challenge</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Template</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Processing</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLogs.map((log) => {
                              const statusInfo = getStatusInfo(log.status)
                              return (
                                <TableRow key={log.id}>
                                  <TableCell className="font-medium">{log.username}</TableCell>
                                  <TableCell className="max-w-[200px] truncate">{log.challengeName}</TableCell>
                                  <TableCell>
                                    <span
                                      className={
                                        log.score >= 80
                                          ? "text-green-500"
                                          : log.score >= 60
                                            ? "text-amber-500"
                                            : "text-red-500"
                                      }
                                    >
                                      {log.score}
                                    </span>
                                  </TableCell>
                                  <TableCell className="max-w-[150px] truncate">{log.template}</TableCell>
                                  <TableCell>
                                    <div
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}
                                    >
                                      {statusInfo.icon}
                                      <span className="ml-1 capitalize">{log.status}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                                  <TableCell>{formatProcessingTime(log.processingTime)}</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View details</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </motion.div>
            )}

            {/* AI Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="settings" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Provider Settings */}
                    <motion.div
                      variants={itemVariants}
                      className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
                        <h3 className="text-lg font-medium">AI Provider Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ai-provider">AI Provider</Label>
                          <Select value={aiProvider} onValueChange={setAiProvider}>
                            <SelectTrigger id="ai-provider">
                              <SelectValue placeholder="Select AI provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="gemini">Gemini (Google)</SelectItem>
                              <SelectItem value="anthropic">Anthropic</SelectItem>
                              <SelectItem value="mistral">Mistral AI</SelectItem>
                              <SelectItem value="cohere">Cohere</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ai-model">AI Model</Label>
                          <Select value={aiModel} onValueChange={setAiModel}>
                            <SelectTrigger id="ai-model">
                              <SelectValue placeholder="Select AI model" />
                            </SelectTrigger>
                            <SelectContent>
                              {aiProvider === "openai" ? (
                                <>
                                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                </>
                              ) : aiProvider === "gemini" ? (
                                <>
                                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                  <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                                </>
                              ) : aiProvider === "anthropic" ? (
                                <>
                                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                </>
                              ) : aiProvider === "mistral" ? (
                                <>
                                  <SelectItem value="mistral-large">Mistral Large</SelectItem>
                                  <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
                                  <SelectItem value="mistral-small">Mistral Small</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="cohere-command">Command</SelectItem>
                                  <SelectItem value="cohere-command-r">Command R</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="api-key">API Key</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-5 px-1">
                                    <HelpCircle className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Manage API keys in the AI Settings section</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => router.push("/admin/ai-settings")}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Manage API Keys
                          </Button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Evaluation Settings */}
                    <motion.div
                      variants={itemVariants}
                      className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
                        <h3 className="text-lg font-medium">Evaluation Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="auto-evaluation">Automatic Evaluation</Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically evaluate submissions when they are created
                            </p>
                          </div>
                          <Switch
                            id="auto-evaluation"
                            checked={autoEvaluationEnabled}
                            onCheckedChange={setAutoEvaluationEnabled}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="min-score-threshold">Minimum Score Threshold</Label>
                            <span className="text-sm">{minimumScoreThreshold}</span>
                          </div>
                          <Slider
                            id="min-score-threshold"
                            min={0}
                            max={100}
                            step={1}
                            value={[minimumScoreThreshold]}
                            onValueChange={(value) => setMinimumScoreThreshold(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            Submissions below this score will be flagged for manual review
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-publish-threshold">Auto-Publish Threshold</Label>
                            <span className="text-sm">{autoPublishThreshold}</span>
                          </div>
                          <Slider
                            id="auto-publish-threshold"
                            min={0}
                            max={100}
                            step={1}
                            value={[autoPublishThreshold]}
                            onValueChange={(value) => setAutoPublishThreshold(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            Submissions above this score will be automatically published to the feed
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Prompt Settings */}
                    <motion.div
                      variants={itemVariants}
                      className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
                        <h3 className="text-lg font-medium">Prompt Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="system-prompt">System Prompt</Label>
                          <Textarea
                            id="system-prompt"
                            className="min-h-[100px]"
                            placeholder="Enter system prompt for AI evaluation"
                            defaultValue="You are an expert English language evaluator. Your task is to evaluate the user's submission based on the provided criteria. Be fair, objective, and provide constructive feedback."
                          />
                          <p className="text-xs text-muted-foreground">
                            This prompt will be used as the system instruction for the AI
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="feedback-style">Feedback Style</Label>
                          <Select defaultValue="balanced">
                            <SelectTrigger id="feedback-style">
                              <SelectValue placeholder="Select feedback style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="encouraging">Encouraging</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                              <SelectItem value="concise">Concise</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Determines the tone and detail level of the feedback
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Output Settings */}
                    <motion.div
                      variants={itemVariants}
                      className="rounded-lg border p-6 space-y-4 bg-white dark:bg-gray-950"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
                        <h3 className="text-lg font-medium">Output Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="include-strengths">Include Strengths</Label>
                            <p className="text-xs text-muted-foreground">Include positive aspects in the evaluation</p>
                          </div>
                          <Switch id="include-strengths" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="include-weaknesses">Include Areas to Improve</Label>
                            <p className="text-xs text-muted-foreground">Include suggestions for improvement</p>
                          </div>
                          <Switch id="include-weaknesses" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="include-examples">Include Examples</Label>
                            <p className="text-xs text-muted-foreground">
                              Include examples to illustrate feedback points
                            </p>
                          </div>
                          <Switch id="include-examples" defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="max-feedback-length">Maximum Feedback Length</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger id="max-feedback-length">
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short">Short (100 words)</SelectItem>
                              <SelectItem value="medium">Medium (200 words)</SelectItem>
                              <SelectItem value="long">Long (300 words)</SelectItem>
                              <SelectItem value="detailed">Detailed (500+ words)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
                      onClick={handleSaveAISettings}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save All Settings
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Add Criterion Dialog */}
      <Dialog open={showAddCriterionDialog} onOpenChange={setShowAddCriterionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Scoring Criterion</DialogTitle>
            <DialogDescription>Create a new criterion for evaluating user submissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="criterion-name">Criterion Name</Label>
              <Input
                id="criterion-name"
                placeholder="e.g., Grammar & Syntax"
                value={newCriterion.name}
                onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterion-category">Category</Label>
              <Select
                value={newCriterion.category}
                onValueChange={(value: any) => setNewCriterion({ ...newCriterion, category: value })}
              >
                <SelectTrigger id="criterion-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grammar">Grammar & Language</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="originality">Originality</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterion-description">Description</Label>
              <Textarea
                id="criterion-description"
                placeholder="Describe what this criterion evaluates"
                value={newCriterion.description}
                onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="criterion-weight">Weight (%)</Label>
                <span className="text-sm">{newCriterion.weight}%</span>
              </div>
              <Slider
                id="criterion-weight"
                min={1}
                max={100}
                step={1}
                value={[newCriterion.weight || 1]}
                onValueChange={(value) => setNewCriterion({ ...newCriterion, weight: value[0] })}
              />
              <p className="text-xs text-muted-foreground">
                The relative importance of this criterion in the overall evaluation
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterion-prompt">Prompt Instructions</Label>
              <Textarea
                id="criterion-prompt"
                placeholder="Instructions for the AI on how to evaluate this criterion"
                value={newCriterion.promptInstructions}
                onChange={(e) => setNewCriterion({ ...newCriterion, promptInstructions: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                These instructions will be included in the prompt to the AI evaluator
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="criterion-enabled"
                checked={newCriterion.enabled}
                onCheckedChange={(checked) => setNewCriterion({ ...newCriterion, enabled: !!checked })}
              />
              <label
                htmlFor="criterion-enabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable this criterion
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCriterionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCriterion} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Criterion
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Criterion Dialog */}
      <Dialog open={showEditCriterionDialog} onOpenChange={setShowEditCriterionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Scoring Criterion</DialogTitle>
            <DialogDescription>Update the scoring criterion details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-criterion-name">Criterion Name</Label>
              <Input
                id="edit-criterion-name"
                placeholder="e.g., Grammar & Syntax"
                value={newCriterion.name}
                onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-criterion-category">Category</Label>
              <Select
                value={newCriterion.category}
                onValueChange={(value: any) => setNewCriterion({ ...newCriterion, category: value })}
              >
                <SelectTrigger id="edit-criterion-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grammar">Grammar & Language</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="originality">Originality</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-criterion-description">Description</Label>
              <Textarea
                id="edit-criterion-description"
                placeholder="Describe what this criterion evaluates"
                value={newCriterion.description}
                onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-criterion-weight">Weight (%)</Label>
                <span className="text-sm">{newCriterion.weight}%</span>
              </div>
              <Slider
                id="edit-criterion-weight"
                min={1}
                max={100}
                step={1}
                value={[newCriterion.weight || 1]}
                onValueChange={(value) => setNewCriterion({ ...newCriterion, weight: value[0] })}
              />
              <p className="text-xs text-muted-foreground">
                The relative importance of this criterion in the overall evaluation
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-criterion-prompt">Prompt Instructions</Label>
              <Textarea
                id="edit-criterion-prompt"
                placeholder="Instructions for the AI on how to evaluate this criterion"
                value={newCriterion.promptInstructions}
                onChange={(e) => setNewCriterion({ ...newCriterion, promptInstructions: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                These instructions will be included in the prompt to the AI evaluator
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-criterion-enabled"
                checked={newCriterion.enabled}
                onCheckedChange={(checked) => setNewCriterion({ ...newCriterion, enabled: !!checked })}
              />
              <label
                htmlFor="edit-criterion-enabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable this criterion
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCriterionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCriterion} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Criterion
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scoring criterion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCriterion && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{selectedCriterion.name}</p>
                    <p className="text-sm opacity-80">{getCategoryInfo(selectedCriterion.category).label}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCriterion} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Criterion
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Template Dialog */}
      <Dialog open={showAddTemplateDialog} onOpenChange={setShowAddTemplateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Scoring Template</DialogTitle>
            <DialogDescription>Create a new template for evaluating user submissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Standard Content Evaluation"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Describe the purpose of this template"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Included Criteria</Label>
              <div className="border rounded-md p-4 space-y-2">
                {scoringCriteria.map((criterion) => (
                  <div key={criterion.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`criterion-${criterion.id}`}
                      checked={(newTemplate.criteria || []).includes(criterion.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewTemplate({
                            ...newTemplate,
                            criteria: [...(newTemplate.criteria || []), criterion.id],
                          })
                        } else {
                          setNewTemplate({
                            ...newTemplate,
                            criteria: (newTemplate.criteria || []).filter((id) => id !== criterion.id),
                          })
                        }
                      }}
                      disabled={!criterion.enabled}
                    />
                    <label
                      htmlFor={`criterion-${criterion.id}`}
                      className={`text-sm font-medium leading-none ${
                        !criterion.enabled ? "text-muted-foreground" : ""
                      }`}
                    >
                      {criterion.name}
                    </label>
                    {!criterion.enabled && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      >
                        Disabled
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge-types">Challenge Types</Label>
              <div className="border rounded-md p-4 space-y-2">
                {["writing", "speaking", "presentation", "comprehension", "grammar", "vocabulary", "final-project"].map(
                  (type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={(newTemplate.challengeTypes || []).includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewTemplate({
                              ...newTemplate,
                              challengeTypes: [...(newTemplate.challengeTypes || []), type],
                            })
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              challengeTypes: (newTemplate.challengeTypes || []).filter((t) => t !== type),
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTemplate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditTemplateDialog} onOpenChange={setShowEditTemplateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Scoring Template</DialogTitle>
            <DialogDescription>Update the scoring template details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-template-name">Template Name</Label>
              <Input
                id="edit-template-name"
                placeholder="e.g., Standard Content Evaluation"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-template-description">Description</Label>
              <Textarea
                id="edit-template-description"
                placeholder="Describe the purpose of this template"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Included Criteria</Label>
              <div className="border rounded-md p-4 space-y-2">
                {scoringCriteria.map((criterion) => (
                  <div key={criterion.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-criterion-${criterion.id}`}
                      checked={(newTemplate.criteria || []).includes(criterion.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewTemplate({
                            ...newTemplate,
                            criteria: [...(newTemplate.criteria || []), criterion.id],
                          })
                        } else {
                          setNewTemplate({
                            ...newTemplate,
                            criteria: (newTemplate.criteria || []).filter((id) => id !== criterion.id),
                          })
                        }
                      }}
                      disabled={!criterion.enabled}
                    />
                    <label
                      htmlFor={`edit-criterion-${criterion.id}`}
                      className={`text-sm font-medium leading-none ${
                        !criterion.enabled ? "text-muted-foreground" : ""
                      }`}
                    >
                      {criterion.name}
                    </label>
                    {!criterion.enabled && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      >
                        Disabled
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-challenge-types">Challenge Types</Label>
              <div className="border rounded-md p-4 space-y-2">
                {["writing", "speaking", "presentation", "comprehension", "grammar", "vocabulary", "final-project"].map(
                  (type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-type-${type}`}
                        checked={(newTemplate.challengeTypes || []).includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewTemplate({
                              ...newTemplate,
                              challengeTypes: [...(newTemplate.challengeTypes || []), type],
                            })
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              challengeTypes: (newTemplate.challengeTypes || []).filter((t) => t !== type),
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-type-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTemplate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Evaluation Dialog */}
      <Dialog open={showTestEvaluationDialog} onOpenChange={setShowTestEvaluationDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Test AI Evaluation</DialogTitle>
            <DialogDescription>Test how the AI would evaluate a sample submission</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-content">Content to Evaluate</Label>
              <Textarea
                id="test-content"
                className="min-h-[150px]"
                placeholder="Enter content to evaluate..."
                value={testSubmission.content}
                onChange={(e) => setTestSubmission({ ...testSubmission, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-video-transcript">Video Transcript (Optional)</Label>
              <Textarea
                id="test-video-transcript"
                className="min-h-[100px]"
                placeholder="Enter video transcript if testing a video submission..."
                value={testSubmission.videoTranscript || ""}
                onChange={(e) => setTestSubmission({ ...testSubmission, videoTranscript: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-template">Evaluation Template</Label>
              <Select defaultValue={scoringTemplates.find((t) => t.isDefault)?.id || scoringTemplates[0]?.id}>
                <SelectTrigger id="test-template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {scoringTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.isDefault && " (Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowTestEvaluationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestEvaluation} disabled={isTestingEvaluation}>
              {isTestingEvaluation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run Test Evaluation
                </>
              )}
            </Button>
          </DialogFooter>

          {/* Test Results */}
          {testResult && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Evaluation Results</h3>
              {/* <AIEvaluationDisplay evaluation={testResult} title="Test Evaluation" /> */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Missing component definition */}
      <div className="hidden">
        <Checkbox id="hidden-checkbox" />
      </div>
    </div>
  )
}
