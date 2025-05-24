"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  FileText,
  Video,
  LinkIcon,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Copy,
  CheckCircle,
  ArrowUpDown,
  ChevronDown,
  Layers,
  Clock,
  Users,
  Star,
  FileUp,
  Sparkles,
  Lightbulb,
  Mic,
  PenTool,
  MessageSquare,
  GraduationCap,
} from "lucide-react"
import { formatRelativeTime, truncateText } from "@/lib/utils"

// Resource types
type ResourceType = "article" | "video" | "document" | "link" | "template" | "ai-prompt"
type ResourceStatus = "published" | "draft" | "archived"
type ResourceCategory = "grammar" | "vocabulary" | "pronunciation" | "writing" | "conversation" | "culture"
type ResourceLevel = "beginner" | "intermediate" | "advanced" | "all-levels"

interface Resource {
  id: string
  title: string
  description: string
  type: ResourceType
  category: ResourceCategory
  level: ResourceLevel
  status: ResourceStatus
  url?: string
  thumbnailUrl?: string
  createdAt: Date
  updatedAt: Date
  author: string
  views: number
  downloads: number
  likes: number
  featured: boolean
  tags: string[]
}

// Mock data for resources
const mockResources: Resource[] = [
  {
    id: "res-001",
    title: "Present Perfect vs. Past Simple Guide",
    description:
      "A comprehensive guide explaining the differences between Present Perfect and Past Simple tenses with examples and exercises.",
    type: "article",
    category: "grammar",
    level: "intermediate",
    status: "published",
    url: "/resources/grammar/present-perfect-vs-past-simple",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-04-15"),
    updatedAt: new Date("2025-05-01"),
    author: "Emma Johnson",
    views: 1245,
    downloads: 328,
    likes: 87,
    featured: true,
    tags: ["grammar", "tenses", "exercises"],
  },
  {
    id: "res-002",
    title: "Business English Vocabulary Pack",
    description: "Essential vocabulary for business meetings, negotiations, and professional emails.",
    type: "document",
    category: "vocabulary",
    level: "advanced",
    status: "published",
    url: "/resources/vocabulary/business-english-pack",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-04-10"),
    updatedAt: new Date("2025-04-10"),
    author: "Michael Chen",
    views: 876,
    downloads: 412,
    likes: 65,
    featured: false,
    tags: ["business", "vocabulary", "professional"],
  },
  {
    id: "res-003",
    title: "Pronunciation: The TH Sound",
    description: "Video tutorial on mastering the 'th' sound in English with practice exercises.",
    type: "video",
    category: "pronunciation",
    level: "beginner",
    status: "published",
    url: "https://youtube.com/watch?v=example",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-03-28"),
    updatedAt: new Date("2025-03-30"),
    author: "Sarah Williams",
    views: 2134,
    downloads: 0,
    likes: 156,
    featured: true,
    tags: ["pronunciation", "sounds", "video-tutorial"],
  },
  {
    id: "res-004",
    title: "Essay Structure Template",
    description: "Template for structuring academic essays with examples and guidelines.",
    type: "template",
    category: "writing",
    level: "intermediate",
    status: "published",
    url: "/resources/writing/essay-structure-template",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-03-15"),
    updatedAt: new Date("2025-03-20"),
    author: "David Thompson",
    views: 945,
    downloads: 523,
    likes: 78,
    featured: false,
    tags: ["writing", "academic", "template"],
  },
  {
    id: "res-005",
    title: "Conversation Practice: Job Interviews",
    description: "Interactive conversation scenarios for practicing job interview questions and answers.",
    type: "article",
    category: "conversation",
    level: "advanced",
    status: "published",
    url: "/resources/conversation/job-interviews",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-02-20"),
    updatedAt: new Date("2025-03-05"),
    author: "Jennifer Lee",
    views: 1567,
    downloads: 245,
    likes: 112,
    featured: true,
    tags: ["conversation", "job", "interview"],
  },
  {
    id: "res-006",
    title: "American vs. British English",
    description:
      "Guide to the key differences between American and British English in vocabulary, spelling, and pronunciation.",
    type: "document",
    category: "culture",
    level: "all-levels",
    status: "draft",
    url: "/resources/culture/american-vs-british-english",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-05-05"),
    updatedAt: new Date("2025-05-10"),
    author: "Robert Clark",
    views: 0,
    downloads: 0,
    likes: 0,
    featured: false,
    tags: ["culture", "american", "british"],
  },
  {
    id: "res-007",
    title: "Daily Conversation Practice Prompts",
    description: "AI prompts designed to help practice everyday English conversations with AI assistants.",
    type: "ai-prompt",
    category: "conversation",
    level: "beginner",
    status: "published",
    url: "/resources/ai-prompts/daily-conversation",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-04-25"),
    updatedAt: new Date("2025-04-28"),
    author: "AI Team",
    views: 876,
    downloads: 345,
    likes: 67,
    featured: true,
    tags: ["ai", "prompts", "conversation"],
  },
  {
    id: "res-008",
    title: "Advanced Grammar Exercises",
    description: "Collection of exercises focusing on complex grammar structures for advanced learners.",
    type: "document",
    category: "grammar",
    level: "advanced",
    status: "published",
    url: "/resources/grammar/advanced-exercises",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-15"),
    author: "Patricia Moore",
    views: 723,
    downloads: 289,
    likes: 45,
    featured: false,
    tags: ["grammar", "advanced", "exercises"],
  },
  {
    id: "res-009",
    title: "Idioms in Business Context",
    description: "Video explaining common English idioms used in business settings with examples.",
    type: "video",
    category: "vocabulary",
    level: "intermediate",
    status: "archived",
    url: "https://youtube.com/watch?v=example2",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2024-12-05"),
    updatedAt: new Date("2025-01-10"),
    author: "James Wilson",
    views: 1245,
    downloads: 0,
    likes: 98,
    featured: false,
    tags: ["idioms", "business", "vocabulary"],
  },
  {
    id: "res-010",
    title: "Email Writing Templates",
    description: "Professional email templates for various business situations with guidelines.",
    type: "template",
    category: "writing",
    level: "intermediate",
    status: "published",
    url: "/resources/writing/email-templates",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2025-02-20"),
    author: "Lisa Brown",
    views: 1876,
    downloads: 765,
    likes: 134,
    featured: true,
    tags: ["email", "writing", "business"],
  },
  {
    id: "res-011",
    title: "English Intonation Patterns",
    description: "Guide to understanding and practicing English intonation patterns for natural speech.",
    type: "article",
    category: "pronunciation",
    level: "intermediate",
    status: "published",
    url: "/resources/pronunciation/intonation-patterns",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-25"),
    author: "Thomas Garcia",
    views: 945,
    downloads: 213,
    likes: 76,
    featured: false,
    tags: ["pronunciation", "intonation", "speaking"],
  },
  {
    id: "res-012",
    title: "Cultural References in English Literature",
    description: "Overview of important cultural references commonly found in English literature.",
    type: "document",
    category: "culture",
    level: "advanced",
    status: "published",
    url: "/resources/culture/literary-references",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-10"),
    author: "Elizabeth Taylor",
    views: 567,
    downloads: 189,
    likes: 42,
    featured: false,
    tags: ["culture", "literature", "references"],
  },
]

// Resource type icons mapping
const resourceTypeIcons: Record<ResourceType, React.ReactNode> = {
  article: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  document: <BookOpen className="h-4 w-4" />,
  link: <LinkIcon className="h-4 w-4" />,
  template: <Layers className="h-4 w-4" />,
  "ai-prompt": <Sparkles className="h-4 w-4" />,
}

// Resource category icons mapping
const resourceCategoryIcons: Record<ResourceCategory, React.ReactNode> = {
  grammar: <BookOpen className="h-4 w-4" />,
  vocabulary: <Lightbulb className="h-4 w-4" />,
  pronunciation: <Mic className="h-4 w-4" />,
  writing: <PenTool className="h-4 w-4" />,
  conversation: <MessageSquare className="h-4 w-4" />,
  culture: <GraduationCap className="h-4 w-4" />,
}

// Resource level colors
const resourceLevelColors: Record<ResourceLevel, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "all-levels": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

// Resource status colors
const resourceStatusColors: Record<ResourceStatus, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

// Analytics data
const analyticsData = {
  totalResources: 156,
  totalViews: 45678,
  totalDownloads: 12345,
  totalLikes: 5678,
  resourcesByType: [
    { type: "article", count: 45 },
    { type: "video", count: 32 },
    { type: "document", count: 38 },
    { type: "link", count: 15 },
    { type: "template", count: 18 },
    { type: "ai-prompt", count: 8 },
  ],
  resourcesByCategory: [
    { category: "grammar", count: 35 },
    { category: "vocabulary", count: 42 },
    { category: "pronunciation", count: 28 },
    { category: "writing", count: 22 },
    { category: "conversation", count: 19 },
    { category: "culture", count: 10 },
  ],
  resourcesByLevel: [
    { level: "beginner", count: 48 },
    { level: "intermediate", count: 65 },
    { level: "advanced", count: 35 },
    { level: "all-levels", count: 8 },
  ],
  topResources: [
    { title: "Present Perfect vs. Past Simple Guide", views: 1245 },
    { title: "Pronunciation: The TH Sound", views: 2134 },
    { title: "Email Writing Templates", views: 1876 },
    { title: "Conversation Practice: Job Interviews", views: 1567 },
    { title: "Business English Vocabulary Pack", views: 876 },
  ],
}

// Resource Card Component
const ResourceCard = ({
  resource,
  onEdit,
  onDelete,
  onView,
}: {
  resource: Resource
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}) => {
  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 group">
      <div className="relative overflow-hidden aspect-video">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${resource.thumbnailUrl})` }}
        ></div>
        <Badge className={`absolute top-2 right-2 z-20 ${resourceStatusColors[resource.status]}`}>
          {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
        </Badge>
        <Badge className="absolute top-2 left-2 z-20 bg-black/70 text-white">
          {resourceTypeIcons[resource.type]}
          <span className="ml-1">{resource.type.replace("-", " ")}</span>
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={`${resourceLevelColors[resource.level]}`}>
            {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(resource.id)}>
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(resource.id)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(resource.url || "")}>
                <Copy className="h-4 w-4 mr-2" /> Copy URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(resource.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {resource.title}
        </CardTitle>
        <CardDescription className="flex items-center text-xs">
          <Clock className="h-3 w-3 mr-1" /> {formatRelativeTime(resource.updatedAt)}
          {resource.featured && (
            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{resource.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-0">
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1" /> {resource.views.toLocaleString()}
        </div>
        <div className="flex items-center">
          <Download className="h-3 w-3 mr-1" /> {resource.downloads.toLocaleString()}
        </div>
        <div className="flex items-center">
          <Star className="h-3 w-3 mr-1" /> {resource.likes.toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  )
}

// Resource Table Row Component
const ResourceTableRow = ({
  resource,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}: {
  resource: Resource
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}) => {
  return (
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      <TableCell className="w-12">
        <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(resource.id, !!checked)} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center">
            {resourceTypeIcons[resource.type]}
          </div>
          <div>
            <div className="font-medium">{truncateText(resource.title, 40)}</div>
            <div className="text-xs text-muted-foreground">{resource.author}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={resourceLevelColors[resource.level]}>{resource.level}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {resourceCategoryIcons[resource.category]}
          <span>{resource.category}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={resourceStatusColors[resource.status]}>{resource.status}</Badge>
      </TableCell>
      <TableCell>{formatRelativeTime(resource.updatedAt)}</TableCell>
      <TableCell className="text-right">{resource.views.toLocaleString()}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(resource.id)}>
              <Eye className="h-4 w-4 mr-2" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(resource.id)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(resource.url || "")}>
              <Copy className="h-4 w-4 mr-2" /> Copy URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(resource.id)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Analytics Card Component
const AnalyticsCard = ({
  title,
  value,
  icon,
  change,
}: { title: string; value: string | number; icon: React.ReactNode; change?: number }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? (
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                    clipRule="evenodd"
                  />
                </svg>
                {change}% from last month
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                    clipRule="evenodd"
                  />
                </svg>
                {Math.abs(change)}% from last month
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Resource Form Component
const ResourceForm = ({
  resource,
  onSubmit,
  onCancel,
}: {
  resource?: Resource
  onSubmit: (data: Partial<Resource>) => void
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<Partial<Resource>>(
    resource || {
      title: "",
      description: "",
      type: "article",
      category: "grammar",
      level: "intermediate",
      status: "draft",
      url: "",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      featured: false,
      tags: [],
    },
  )
  const [tagInput, setTagInput] = useState("")

  const handleChange = (field: keyof Resource, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Resource title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="Resource URL"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Resource description"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange("type", value as ResourceType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="ai-prompt">AI Prompt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange("category", value as ResourceCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grammar">Grammar</SelectItem>
              <SelectItem value="vocabulary">Vocabulary</SelectItem>
              <SelectItem value="pronunciation">Pronunciation</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="conversation">Conversation</SelectItem>
              <SelectItem value="culture">Culture</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select value={formData.level} onValueChange={(value) => handleChange("level", value as ResourceLevel)}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="all-levels">All Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
          <Input
            id="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
            placeholder="Thumbnail URL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value as ResourceStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tags">Tags</Label>
          <div className="text-xs text-muted-foreground">{formData.tags?.length || 0} tags added</div>
        </div>
        <div className="flex gap-2">
          <Input
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button type="button" onClick={handleAddTag} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => handleChange("featured", checked)}
        />
        <Label htmlFor="featured">Featured resource</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Resource</Button>
      </DialogFooter>
    </form>
  )
}

// Main Page Component
export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Resource>("updatedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load resources
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setResources(mockResources)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle success message timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        // Search query filter
        const matchesSearch =
          searchQuery === "" ||
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        // Type filter
        const matchesType = selectedType === "all" || resource.type === selectedType

        // Category filter
        const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory

        // Level filter
        const matchesLevel = selectedLevel === "all" || resource.level === selectedLevel

        // Status filter
        const matchesStatus = selectedStatus === "all" || resource.status === selectedStatus

        return matchesSearch && matchesType && matchesCategory && matchesLevel && matchesStatus
      })
      .sort((a, b) => {
        // Handle date fields specially
        if (sortField === "createdAt" || sortField === "updatedAt") {
          return sortDirection === "asc"
            ? new Date(a[sortField] || "").getTime() - new Date(b[sortField] || "").getTime()
            : new Date(b[sortField] || "").getTime() - new Date(a[sortField] || "").getTime()
        }

        // Handle other fields with safe null checks
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
  }, [resources, searchQuery, selectedType, selectedCategory, selectedLevel, selectedStatus, sortField, sortDirection])

  // Pagination
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredResources.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredResources, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)

  // Handle sort
  const handleSort = (field: keyof Resource) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Handle resource selection
  const handleSelectResource = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedResources((prev) => [...prev, id])
    } else {
      setSelectedResources((prev) => prev.filter((resId) => resId !== id))
    }
  }

  // Handle select all resources
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResources(paginatedResources.map((res) => res.id))
    } else {
      setSelectedResources([])
    }
  }

  // Handle resource edit
  const handleEditResource = (id: string) => {
    const resource = resources.find((res) => res.id === id)
    if (resource) {
      setEditingResource(resource)
      setIsAddDialogOpen(true)
    }
  }

  // Handle resource view
  const handleViewResource = (id: string) => {
    // In a real app, this would navigate to the resource view page
    window.open(`/resources/view/${id}`, "_blank")
  }

  // Handle resource delete confirmation
  const handleDeleteConfirm = (id: string) => {
    setResourceToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Handle resource delete
  const handleDeleteResource = () => {
    if (resourceToDelete) {
      setResources((prev) => prev.filter((res) => res.id !== resourceToDelete))
      setSelectedResources((prev) => prev.filter((id) => id !== resourceToDelete))
      setSuccessMessage("Resource deleted successfully")
    }
    setIsDeleteDialogOpen(false)
    setResourceToDelete(null)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    setResources((prev) => prev.filter((res) => !selectedResources.includes(res.id)))
    setSuccessMessage(`${selectedResources.length} resources deleted successfully`)
    setSelectedResources([])
  }

  // Handle resource save
  const handleSaveResource = (data: Partial<Resource>) => {
    if (editingResource) {
      // Update existing resource
      setResources((prev) =>
        prev.map((res) => (res.id === editingResource.id ? { ...res, ...data, updatedAt: new Date() } : res)),
      )
      setSuccessMessage("Resource updated successfully")
    } else {
      // Add new resource
      const newResource: Resource = {
        id: `res-${Math.random().toString(36).substr(2, 9)}`,
        title: data.title || "Untitled Resource",
        description: data.description || "",
        type: data.type || "article",
        category: data.category || "grammar",
        level: data.level || "intermediate",
        status: data.status || "draft",
        url: data.url || "",
        thumbnailUrl: data.thumbnailUrl || "/placeholder.svg?height=200&width=300",
        createdAt: new Date(),
        updatedAt: new Date(),
        author: "Admin User",
        views: 0,
        downloads: 0,
        likes: 0,
        featured: data.featured || false,
        tags: data.tags || [],
      }
      setResources((prev) => [newResource, ...prev])
      setSuccessMessage("Resource created successfully")
    }
    setIsAddDialogOpen(false)
    setEditingResource(null)
  }

  // Handle bulk status change
  const handleBulkStatusChange = (status: ResourceStatus) => {
    setResources((prev) =>
      prev.map((res) => (selectedResources.includes(res.id) ? { ...res, status, updatedAt: new Date() } : res)),
    )
    setSuccessMessage(`${selectedResources.length} resources updated to ${status}`)
    setSelectedResources([])
  }

  // Handle export resources
  const handleExportResources = () => {
    // In a real app, this would generate a CSV or Excel file
    const dataToExport =
      selectedResources.length > 0 ? resources.filter((res) => selectedResources.includes(res.id)) : filteredResources

    const json = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resources-export.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setSuccessMessage(`${dataToExport.length} resources exported successfully`)
  }

  // Resource type counts
  const resourceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: resources.length }
    resources.forEach((res) => {
      counts[res.type] = (counts[res.type] || 0) + 1
    })
    return counts
  }, [resources])

  // Resource category counts
  const resourceCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: resources.length }
    resources.forEach((res) => {
      counts[res.category] = (counts[res.category] || 0) + 1
    })
    return counts
  }, [resources])

  return (
    <div className="animate-in fade-in duration-500">
      <AdminHeader title="Resource Management" description="Manage learning resources for students" />

      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingResource(null)
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
                    <DialogDescription>
                      {editingResource
                        ? "Edit the details of the existing resource."
                        : "Fill in the details to create a new learning resource."}
                    </DialogDescription>
                  </DialogHeader>
                  <ResourceForm
                    resource={editingResource || undefined}
                    onSubmit={handleSaveResource}
                    onCancel={() => {
                      setIsAddDialogOpen(false)
                      setEditingResource(null)
                    }}
                  />
                </DialogContent>
              </Dialog>

              {selectedResources.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5 duration-200">
                  <span className="text-sm text-muted-foreground">{selectedResources.length} selected</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange("published")}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Mark as Published
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange("draft")}>
                        <Clock className="h-4 w-4 mr-2 text-yellow-600" /> Mark as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange("archived")}>
                        <Archive className="h-4 w-4 mr-2 text-gray-600" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1) // Reset to first page on search
                  }}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filter Resources</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <Label className="text-xs">Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="article">Articles</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                        <SelectItem value="link">Links</SelectItem>
                        <SelectItem value="template">Templates</SelectItem>
                        <SelectItem value="ai-prompt">AI Prompts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-2">
                    <Label className="text-xs">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="pronunciation">Pronunciation</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="conversation">Conversation</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-2">
                    <Label className="text-xs">Level</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="all-levels">Multi-level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-2">
                    <Label className="text-xs">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleExportResources}>
                    <FileText className="h-4 w-4 mr-2" /> Export to JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileUp className="h-4 w-4 mr-2" /> Export to CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("table")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Resource Type Tabs */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-2 pb-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
                className="flex items-center gap-1"
              >
                All{" "}
                <Badge variant="secondary" className="ml-1">
                  {resourceTypeCounts.all || 0}
                </Badge>
              </Button>
              <Button
                variant={selectedType === "article" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("article")}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4 mr-1" /> Articles{" "}
                <Badge variant="secondary" className="ml-1">
                  {resourceTypeCounts.article || 0}
                </Badge>
              </Button>
              <Button
                variant={selectedType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("video")}
                className="flex items-center gap-1"
              >
                <Video className="h-4 w-4 mr-1" /> Videos{" "}
                <Badge variant="secondary" className="ml-1">
                  {resourceTypeCounts.video || 0}
                </Badge>
              </Button>
              <Button
                variant={selectedType === "document" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("document")}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4 mr-1" /> Documents{" "}
                <Badge variant="secondary" className="ml-1">
                  {resourceTypeCounts.document || 0}
                </Badge>
              </Button>
              <Button
                variant={selectedType === "template" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("template")}
                className="flex items-center gap-1"
              >
                <Layers className="h-4 w-4 mr-1" /> Templates{" "}
                <Badge variant="secondary" className="ml-1">
                  {resourceTypeCounts.template || 0}
                </Badge>
              </Button>
              <Button
                variant={selectedType === "link" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("link")}
                className="flex items-center gap-1"
              >
                <LinkIcon className="h-4 w-4 mr-1" /> Links{" "}
                <Badge variant="secondary" className="ml-1">
                  {resourceTypeCounts.link || 0}
                </Badge>
              </Button>
              <Button
                variant={selectedType === "ai-prompt" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("ai-prompt")}
                className="flex items-center gap-1"
              >
                <Sparkles className="h-4 w-4 mr-1" /> AI Prompts{" "}
                <Badge variant="secondary" className="ml-1">
                  {resourceTypeCounts["ai-prompt"] || 0}
                </Badge>
              </Button>
            </div>
          </ScrollArea>

          {/* Resources Display */}
          {loading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-video bg-muted animate-pulse" />
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6 mt-2" />
                      <div className="flex gap-1 mt-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-3 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div>
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-24 mt-1" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-12 ml-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No resources found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("all")
                  setSelectedCategory("all")
                  setSelectedLevel("all")
                  setSelectedStatus("all")
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onEdit={handleEditResource}
                  onDelete={handleDeleteConfirm}
                  onView={handleViewResource}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          paginatedResources.length > 0 && selectedResources.length === paginatedResources.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                        onClick={() => handleSort("title")}
                      >
                        Title
                        {sortField === "title" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                        onClick={() => handleSort("level")}
                      >
                        Level
                        {sortField === "level" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                        onClick={() => handleSort("category")}
                      >
                        Category
                        {sortField === "category" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {sortField === "status" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                        onClick={() => handleSort("updatedAt")}
                      >
                        Updated
                        {sortField === "updatedAt" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium ml-auto"
                        onClick={() => handleSort("views")}
                      >
                        Views
                        {sortField === "views" && (
                          <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResources.map((resource) => (
                    <ResourceTableRow
                      key={resource.id}
                      resource={resource}
                      isSelected={selectedResources.includes(resource.id)}
                      onSelect={handleSelectResource}
                      onEdit={handleEditResource}
                      onDelete={handleDeleteConfirm}
                      onView={handleViewResource}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredResources.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredResources.length)} of {filteredResources.length} resources
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      if (currentPage > 3 && currentPage < totalPages - 1) {
                        pageNum = currentPage - 2 + i
                      } else if (currentPage >= totalPages - 1) {
                        pageNum = totalPages - 4 + i
                      }
                    }
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="mx-1">...</span>
                      <Button variant="outline" size="sm" className="w-9" onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number.parseInt(value))
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                    <SelectItem value="96">96 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this resource? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteResource}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              title="Total Resources"
              value={analyticsData.totalResources}
              icon={<BookOpen className="h-4 w-4" />}
              change={5.2}
            />
            <AnalyticsCard
              title="Total Views"
              value={analyticsData.totalViews.toLocaleString()}
              icon={<Eye className="h-4 w-4" />}
              change={12.8}
            />
            <AnalyticsCard
              title="Total Downloads"
              value={analyticsData.totalDownloads.toLocaleString()}
              icon={<Download className="h-4 w-4" />}
              change={8.4}
            />
            <AnalyticsCard
              title="Total Likes"
              value={analyticsData.totalLikes.toLocaleString()}
              icon={<Star className="h-4 w-4" />}
              change={-2.1}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources by Type</CardTitle>
                <CardDescription>Distribution of resources across different types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.resourcesByType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === "article" && <FileText className="h-4 w-4 text-blue-500" />}
                        {item.type === "video" && <Video className="h-4 w-4 text-red-500" />}
                        {item.type === "document" && <BookOpen className="h-4 w-4 text-green-500" />}
                        {item.type === "link" && <LinkIcon className="h-4 w-4 text-purple-500" />}
                        {item.type === "template" && <Layers className="h-4 w-4 text-orange-500" />}
                        {item.type === "ai-prompt" && <Sparkles className="h-4 w-4 text-pink-500" />}
                        <span className="capitalize">{item.type.replace("-", " ")}s</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={(item.count / analyticsData.totalResources) * 100} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources by Category</CardTitle>
                <CardDescription>Distribution of resources across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.resourcesByCategory.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.category === "grammar" && <BookOpen className="h-4 w-4 text-blue-500" />}
                        {item.category === "vocabulary" && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                        {item.category === "pronunciation" && <Mic className="h-4 w-4 text-red-500" />}
                        {item.category === "writing" && <PenTool className="h-4 w-4 text-green-500" />}
                        {item.category === "conversation" && <MessageSquare className="h-4 w-4 text-purple-500" />}
                        {item.category === "culture" && <GraduationCap className="h-4 w-4 text-orange-500" />}
                        <span className="capitalize">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={(item.count / analyticsData.totalResources) * 100} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources by Level</CardTitle>
                <CardDescription>Distribution of resources across different levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.resourcesByLevel.map((item) => (
                    <div key={item.level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${resourceLevelColors[item.level as ResourceLevel]}`}>{item.level}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={(item.count / analyticsData.totalResources) * 100} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Resources by Views</CardTitle>
                <CardDescription>Most viewed resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topResources.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm truncate max-w-[200px]">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.views.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Grammar
                  </CardTitle>
                  <Badge variant="outline">{resourceCategoryCounts.grammar || 0} resources</Badge>
                </div>
                <CardDescription>Grammar rules, tenses, structures, and exercises</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Resource completion</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Vocabulary
                  </CardTitle>
                  <Badge variant="outline">{resourceCategoryCounts.vocabulary || 0} resources</Badge>
                </div>
                <CardDescription>Word lists, idioms, collocations, and usage examples</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Resource completion</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="h-5 w-5 text-red-500" />
                    Pronunciation
                  </CardTitle>
                  <Badge variant="outline">{resourceCategoryCounts.pronunciation || 0} resources</Badge>
                </div>
                <CardDescription>Sounds, intonation, stress patterns, and speaking exercises</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Resource completion</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-green-500" />
                    Writing
                  </CardTitle>
                  <Badge variant="outline">{resourceCategoryCounts.writing || 0} resources</Badge>
                </div>
                <CardDescription>
                  Essay structures, email formats, creative writing, and academic writing
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Resource completion</span>
                    <span className="font-medium">83%</span>
                  </div>
                  <Progress value={83} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Conversation
                  </CardTitle>
                  <Badge variant="outline">{resourceCategoryCounts.conversation || 0} resources</Badge>
                </div>
                <CardDescription>Dialogue examples, speaking prompts, and conversation scenarios</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Resource completion</span>
                    <span className="font-medium">71%</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-orange-500" />
                    Culture
                  </CardTitle>
                  <Badge variant="outline">{resourceCategoryCounts.culture || 0} resources</Badge>
                </div>
                <CardDescription>Cultural references, traditions, customs, and social norms</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Resource completion</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Add, edit, or remove resource categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      Grammar
                    </TableCell>
                    <TableCell>Grammar rules, tenses, structures, and exercises</TableCell>
                    <TableCell>{resourceCategoryCounts.grammar || 0}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Vocabulary
                    </TableCell>
                    <TableCell>Word lists, idioms, collocations, and usage examples</TableCell>
                    <TableCell>{resourceCategoryCounts.vocabulary || 0}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Mic className="h-4 w-4 text-red-500" />
                      Pronunciation
                    </TableCell>
                    <TableCell>Sounds, intonation, stress patterns, and speaking exercises</TableCell>
                    <TableCell>{resourceCategoryCounts.pronunciation || 0}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-green-500" />
                      Writing
                    </TableCell>
                    <TableCell>Essay structures, email formats, creative writing, and academic writing</TableCell>
                    <TableCell>{resourceCategoryCounts.writing || 0}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      Conversation
                    </TableCell>
                    <TableCell>Dialogue examples, speaking prompts, and conversation scenarios</TableCell>
                    <TableCell>{resourceCategoryCounts.conversation || 0}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-orange-500" />
                      Culture
                    </TableCell>
                    <TableCell>Cultural references, traditions, customs, and social norms</TableCell>
                    <TableCell>{resourceCategoryCounts.culture || 0}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing Archive icon
function Archive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}
