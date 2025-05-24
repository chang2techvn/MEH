"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, Search, Filter, BookOpen, Clock, Award, CheckCircle, Star, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import SEOMeta from "@/components/seo-meta"

interface LearningPath {
  id: number
  title: string
  description: string
  image: string
  level: "beginner" | "intermediate" | "advanced" | "all-levels"
  duration: string
  modules: number
  progress?: number
  enrolled: boolean
  category: "speaking" | "writing" | "grammar" | "vocabulary" | "pronunciation" | "business" | "academic" | "general"
  featured: boolean
  completions: number
  rating: number
  isPremium: boolean
}

export default function LearningPathsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setPaths(generateMockLearningPaths())
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const generateMockLearningPaths = (): LearningPath[] => {
    return [
      {
        id: 1,
        title: "Business English Mastery",
        description:
          "Develop professional English skills for workplace communication, presentations, emails, and networking in international business contexts.",
        image: "/placeholder.svg?height=200&width=400",
        level: "intermediate",
        duration: "8 weeks",
        modules: 24,
        progress: 65,
        enrolled: true,
        category: "business",
        featured: true,
        completions: 1245,
        rating: 4.8,
        isPremium: true,
      },
      {
        id: 2,
        title: "Pronunciation Fundamentals",
        description:
          "Master the basics of English pronunciation with focused practice on vowels, consonants, stress, and intonation patterns.",
        image: "/placeholder.svg?height=200&width=400",
        level: "beginner",
        duration: "6 weeks",
        modules: 18,
        progress: 100,
        enrolled: true,
        category: "pronunciation",
        featured: false,
        completions: 2567,
        rating: 4.7,
        isPremium: false,
      },
      {
        id: 3,
        title: "Advanced Grammar Intensive",
        description:
          "Deep dive into complex grammatical structures, tenses, and nuanced usage for advanced English proficiency.",
        image: "/placeholder.svg?height=200&width=400",
        level: "advanced",
        duration: "10 weeks",
        modules: 30,
        enrolled: false,
        category: "grammar",
        featured: true,
        completions: 876,
        rating: 4.9,
        isPremium: true,
      },
      {
        id: 4,
        title: "Academic Writing Excellence",
        description:
          "Learn to write clear, structured academic essays, research papers, and reports with proper citations and academic vocabulary.",
        image: "/placeholder.svg?height=200&width=400",
        level: "intermediate",
        duration: "12 weeks",
        modules: 36,
        enrolled: false,
        category: "academic",
        featured: false,
        completions: 1089,
        rating: 4.6,
        isPremium: true,
      },
      {
        id: 5,
        title: "Everyday Conversation Skills",
        description:
          "Build confidence in daily English conversations with practical phrases, cultural insights, and real-life scenarios.",
        image: "/placeholder.svg?height=200&width=400",
        level: "beginner",
        duration: "4 weeks",
        modules: 16,
        progress: 25,
        enrolled: true,
        category: "speaking",
        featured: true,
        completions: 3421,
        rating: 4.5,
        isPremium: false,
      },
      {
        id: 6,
        title: "Vocabulary Expansion",
        description:
          "Systematically expand your English vocabulary with thematic word groups, collocations, idioms, and effective memorization techniques.",
        image: "/placeholder.svg?height=200&width=400",
        level: "all-levels",
        duration: "Ongoing",
        modules: 40,
        enrolled: false,
        category: "vocabulary",
        featured: false,
        completions: 1876,
        rating: 4.7,
        isPremium: false,
      },
      {
        id: 7,
        title: "IELTS Exam Preparation",
        description:
          "Comprehensive preparation for all sections of the IELTS exam with strategies, practice tests, and personalized feedback.",
        image: "/placeholder.svg?height=200&width=400",
        level: "intermediate",
        duration: "12 weeks",
        modules: 48,
        enrolled: false,
        category: "academic",
        featured: true,
        completions: 2345,
        rating: 4.9,
        isPremium: true,
      },
      {
        id: 8,
        title: "Public Speaking Confidence",
        description:
          "Overcome speaking anxiety and develop compelling presentation skills for academic and professional contexts.",
        image: "/placeholder.svg?height=200&width=400",
        level: "intermediate",
        duration: "8 weeks",
        modules: 24,
        enrolled: false,
        category: "speaking",
        featured: false,
        completions: 1432,
        rating: 4.8,
        isPremium: true,
      },
    ]
  }

  const handleEnroll = (pathId: number) => {
    setPaths(
      paths.map((path) =>
        path.id === pathId ? { ...path, enrolled: !path.enrolled, progress: path.enrolled ? undefined : 0 } : path,
      ),
    )
  }

  const filteredPaths = paths.filter((path) => {
    // Filter by tab
    if (activeTab === "my-paths" && !path.enrolled) return false
    if (activeTab === "in-progress" && (!path.enrolled || path.progress === 100)) return false
    if (activeTab === "completed" && (!path.enrolled || path.progress !== 100)) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        path.title.toLowerCase().includes(query) ||
        path.description.toLowerCase().includes(query) ||
        path.category.toLowerCase().includes(query) ||
        path.level.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <>
      <SEOMeta
        title="Learning Paths | EnglishMastery - Structured English Learning Journeys"
        description="Follow structured learning paths to master English systematically. From beginner to advanced, find the perfect curriculum for your language learning goals."
        keywords={[
          "English learning paths",
          "language curriculum",
          "structured English courses",
          "English learning journey",
          "language progression",
        ]}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Learning Paths</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search learning paths..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All Paths</TabsTrigger>
              <TabsTrigger value="my-paths">My Paths</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {renderFeaturedPaths(
                filteredPaths.filter((p) => p.featured),
                loading,
              )}
              {renderPathsList(filteredPaths, loading, handleEnroll)}
            </TabsContent>

            <TabsContent value="my-paths" className="space-y-6">
              {renderPathsList(filteredPaths, loading, handleEnroll)}
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-6">
              {renderPathsList(filteredPaths, loading, handleEnroll)}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {renderPathsList(filteredPaths, loading, handleEnroll)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )

  function renderFeaturedPaths(featuredPaths: LearningPath[], isLoading: boolean) {
    if (isLoading) {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Featured Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeaturedPathSkeleton />
            <FeaturedPathSkeleton />
          </div>
        </div>
      )
    }

    if (featuredPaths.length === 0) return null

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Featured Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredPaths.slice(0, 2).map((path) => (
            <FeaturedPathCard key={path.id} path={path} onEnroll={handleEnroll} />
          ))}
        </div>
      </div>
    )
  }

  function renderPathsList(paths: LearningPath[], isLoading: boolean, onEnroll: (id: number) => void) {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <PathCardSkeleton key={i} />
            ))}
        </div>
      )
    }

    if (paths.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No learning paths found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {activeTab === "my-paths"
              ? "You haven't enrolled in any learning paths yet"
              : activeTab === "in-progress"
                ? "You don't have any paths in progress"
                : activeTab === "completed"
                  ? "You haven't completed any paths yet"
                  : "No paths match your search criteria"}
          </p>
          <Button>Browse All Paths</Button>
        </div>
      )
    }

    return (
      <>
        <h2 className="text-xl font-bold mb-4">
          {activeTab === "all"
            ? "All Learning Paths"
            : activeTab === "my-paths"
              ? "My Learning Paths"
              : activeTab === "in-progress"
                ? "In Progress"
                : "Completed Paths"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} onEnroll={onEnroll} />
          ))}
        </div>
      </>
    )
  }
}

function FeaturedPathCard({ path, onEnroll }: { path: LearningPath; onEnroll: (id: number) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex flex-col sm:flex-row h-full">
        <div className="relative w-full sm:w-1/3 h-40 sm:h-auto">
          <Image src={path.image || "/placeholder.svg"} alt={path.title} fill className="object-cover" />
          {path.isPremium && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white border-0">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Premium
            </Badge>
          )}
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <Badge
              className={`
              ${
                path.level === "beginner"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : path.level === "intermediate"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    : path.level === "advanced"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              }
            `}
            >
              {path.level.charAt(0).toUpperCase() + path.level.slice(1)}
            </Badge>

            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="ml-1 font-medium">{path.rating}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">{path.title}</h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">{path.description}</p>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{path.duration}</span>
            <span className="mx-2">•</span>
            <BookOpen className="h-4 w-4 mr-1.5" />
            <span>{path.modules} modules</span>
            <span className="mx-2">•</span>
            <Award className="h-4 w-4 mr-1.5" />
            <span>{path.completions.toLocaleString()} completions</span>
          </div>

          {path.enrolled && path.progress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Your progress</span>
                <span>{path.progress}%</span>
              </div>
              <Progress value={path.progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <Badge variant="outline" className="font-normal">
              {path.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>

            <Button
              variant={path.enrolled ? "outline" : "default"}
              className={path.enrolled ? "" : "bg-neo-mint hover:bg-neo-mint/90 text-white"}
              onClick={() => onEnroll(path.id)}
            >
              {path.enrolled ? (
                path.progress === 100 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" /> Completed
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Continue
                  </>
                )
              ) : (
                "Enroll Now"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function PathCard({ path, onEnroll }: { path: LearningPath; onEnroll: (id: number) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
      <div className="relative h-40">
        <Image src={path.image || "/placeholder.svg"} alt={path.title} fill className="object-cover" />
        {path.isPremium && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-white border-0">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Premium
          </Badge>
        )}
        <Badge
          className={`
          absolute top-2 right-2
          ${
            path.level === "beginner"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : path.level === "intermediate"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : path.level === "advanced"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
          }
        `}
        >
          {path.level.charAt(0).toUpperCase() + path.level.slice(1)}
        </Badge>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="font-normal">
            {path.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>

          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="ml-1 font-medium">{path.rating}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{path.title}</h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">{path.description}</p>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Clock className="h-4 w-4 mr-1.5" />
          <span>{path.duration}</span>
          <span className="mx-2">•</span>
          <BookOpen className="h-4 w-4 mr-1.5" />
          <span>{path.modules} modules</span>
        </div>

        {path.enrolled && path.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Your progress</span>
              <span>{path.progress}%</span>
            </div>
            <Progress value={path.progress} className="h-2" />
          </div>
        )}

        <Button
          variant={path.enrolled ? "outline" : "default"}
          className={`mt-auto ${path.enrolled ? "" : "bg-neo-mint hover:bg-neo-mint/90 text-white"}`}
          onClick={() => onEnroll(path.id)}
        >
          {path.enrolled ? (
            path.progress === 100 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" /> Completed
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Continue
              </>
            )
          ) : (
            "Enroll Now"
          )}
        </Button>
      </div>
    </Card>
  )
}

function FeaturedPathSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row h-full">
        <Skeleton className="w-full sm:w-1/3 h-40 sm:h-auto" />

        <div className="p-4 sm:p-6 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-12" />
          </div>

          <Skeleton className="h-6 w-3/4 mb-2" />

          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </Card>
  )
}

function PathCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-40 w-full" />

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>

        <Skeleton className="h-6 w-3/4 mb-2" />

        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="h-9 w-full mt-auto" />
      </div>
    </Card>
  )
}
