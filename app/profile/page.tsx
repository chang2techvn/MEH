"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Calendar,
  Camera,
  ChevronRight,
  Edit2,
  Film,
  MessageCircle,
  Pencil,
  Settings,
  Share2,
  Trophy,
  Users,
  Video,
} from "lucide-react"
import FeedPost from "@/components/feed/feed-post"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState("submissions")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    points: 1245,
    completionRate: 87,
    followers: 24,
    following: 36,
    streak: 120,
    level: "Intermediate",
  })

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Profile link copied!",
      description: "You can now share your profile with others.",
    })
  }

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile editing functionality will be available soon.",
    })
  }

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
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-xl animate-pulse"></div>
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen pb-12">
      {/* Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="relative h-64 md:h-80 bg-gradient-to-r from-neo-mint/30 to-purist-blue/30 dark:from-purist-blue/20 dark:to-cassis/20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>

        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/20 backdrop-blur-sm">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <div className="container relative z-10">
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="relative -mt-20 mb-8">
          <Card className="border-none shadow-xl dark:shadow-gray-900/30 overflow-visible">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Profile Info */}
                <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neo-mint to-purist-blue rounded-full blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
                    <Avatar className="w-28 h-28 border-4 border-background">
                      <AvatarImage src="/placeholder.svg?height=112&width=112" alt="John Doe" />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-3xl font-bold">{user?.name || "John Doe"}</h1>
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-neo-mint/10 to-purist-blue/10 border-neo-mint/20"
                          >
                            {stats.level}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Joined April 2023</span>
                          <span className="mx-1.5">•</span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="text-yellow-500 dark:text-yellow-400 font-medium">
                              {stats.streak} day streak
                            </span>
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleEditProfile}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 border-0"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <Video className="h-3 w-3 mr-1" />
                        <span>32 Videos</span>
                      </Badge>
                      <Badge variant="secondary" className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <Pencil className="h-3 w-3 mr-1" />
                        <span>45 Writings</span>
                      </Badge>
                      <Badge variant="secondary" className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span>15 Challenges</span>
                      </Badge>
                      <Badge variant="secondary" className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        <span>128 Comments</span>
                      </Badge>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3"
                      >
                        <p className="text-2xl font-bold gradient-text">{stats.points}</p>
                        <p className="text-sm text-muted-foreground">Points</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3"
                      >
                        <p className="text-2xl font-bold gradient-text">{stats.completionRate}%</p>
                        <p className="text-sm text-muted-foreground">Completion</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3"
                      >
                        <div className="flex justify-center gap-4">
                          <div>
                            <p className="text-xl font-bold">{stats.followers}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                          </div>
                          <div className="border-l border-gray-200 dark:border-gray-700"></div>
                          <div>
                            <p className="text-xl font-bold">{stats.following}</p>
                            <p className="text-xs text-muted-foreground">Following</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress to Advanced Level</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="submissions" className="w-full" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
              <TabsTrigger
                value="submissions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/80 data-[state=active]:to-purist-blue/80 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Video className="h-4 w-4 mr-2" />
                Submissions
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/80 data-[state=active]:to-purist-blue/80 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Chart className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/80 data-[state=active]:to-purist-blue/80 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/80 data-[state=active]:to-purist-blue/80 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial="hidden" animate="visible" exit="exit" variants={tabVariants}>
                <TabsContent value="submissions" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      <FeedPost
                        username="John Doe"
                        userImage="/placeholder.svg?height=40&width=40"
                        timeAgo="3 days ago"
                        content="My video analysis on 'The Impact of Social Media'. I focused on improving my pronunciation of technical terms."
                        mediaType="video"
                        mediaUrl="https://example.com/videos/john-social-media"
                        likes={18}
                        comments={5}
                      />
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      <FeedPost
                        username="John Doe"
                        userImage="/placeholder.svg?height=40&width=40"
                        timeAgo="1 week ago"
                        content="Written analysis of 'Climate Change Solutions' video. I tried to use more advanced vocabulary and complex sentence structures."
                        mediaType="text"
                        textContent="The video presents a comprehensive overview of potential solutions to climate change, categorized into three main approaches: mitigation, adaptation, and geoengineering. Mitigation strategies focus on reducing greenhouse gas emissions through renewable energy adoption, improved energy efficiency, and carbon capture technologies..."
                        likes={24}
                        comments={7}
                      />
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      <FeedPost
                        username="John Doe"
                        userImage="/placeholder.svg?height=40&width=40"
                        timeAgo="2 weeks ago"
                        content="My presentation on 'Digital Marketing Trends'. This was challenging but I'm proud of my progress!"
                        mediaType="video"
                        mediaUrl="https://example.com/videos/marketing-trends"
                        likes={32}
                        comments={12}
                      />
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      <FeedPost
                        username="John Doe"
                        userImage="/placeholder.svg?height=40&width=40"
                        timeAgo="3 weeks ago"
                        content="Essay on 'The Future of Artificial Intelligence'. I tried to incorporate the new vocabulary we learned last month."
                        mediaType="text"
                        textContent="Artificial Intelligence (AI) continues to evolve at an unprecedented pace, transforming industries and reshaping our daily lives. The future of AI promises even more revolutionary changes, from fully autonomous vehicles to advanced medical diagnostics systems..."
                        likes={41}
                        comments={15}
                      />
                    </motion.div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button variant="outline" className="group">
                      View All Submissions
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="progress" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-none shadow-lg">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                          <Chart className="mr-2 h-5 w-5 text-neo-mint" />
                          Learning Progress
                        </h2>

                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">Listening Skills</h3>
                              <span className="text-sm font-medium text-neo-mint">Advanced</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-neo-mint to-purist-blue h-2.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "75%" }}
                                transition={{ duration: 1, delay: 0.2 }}
                              ></motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Beginner</span>
                              <span>Intermediate</span>
                              <span>Advanced</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">Speaking Skills</h3>
                              <span className="text-sm font-medium text-neo-mint">Intermediate</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-neo-mint to-purist-blue h-2.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "60%" }}
                                transition={{ duration: 1, delay: 0.4 }}
                              ></motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Beginner</span>
                              <span>Intermediate</span>
                              <span>Advanced</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">Reading Skills</h3>
                              <span className="text-sm font-medium text-neo-mint">Advanced</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-neo-mint to-purist-blue h-2.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "80%" }}
                                transition={{ duration: 1, delay: 0.6 }}
                              ></motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Beginner</span>
                              <span>Intermediate</span>
                              <span>Advanced</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">Writing Skills</h3>
                              <span className="text-sm font-medium text-neo-mint">Intermediate</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-neo-mint to-purist-blue h-2.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "70%" }}
                                transition={{ duration: 1, delay: 0.8 }}
                              ></motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Beginner</span>
                              <span>Intermediate</span>
                              <span>Advanced</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-lg">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                          <Calendar className="mr-2 h-5 w-5 text-purist-blue" />
                          Activity Overview
                        </h2>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-neo-mint/10 flex items-center justify-center mr-3">
                                <Video className="h-5 w-5 text-neo-mint" />
                              </div>
                              <div>
                                <h3 className="font-medium">Video Submissions</h3>
                                <p className="text-xs text-muted-foreground">Last 30 days</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">12</p>
                              <p className="text-xs text-green-500">+20% from last month</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-purist-blue/10 flex items-center justify-center mr-3">
                                <Pencil className="h-5 w-5 text-purist-blue" />
                              </div>
                              <div>
                                <h3 className="font-medium">Writing Submissions</h3>
                                <p className="text-xs text-muted-foreground">Last 30 days</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">18</p>
                              <p className="text-xs text-green-500">+15% from last month</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-cassis/10 flex items-center justify-center mr-3">
                                <MessageCircle className="h-5 w-5 text-cassis" />
                              </div>
                              <div>
                                <h3 className="font-medium">Comments Made</h3>
                                <p className="text-xs text-muted-foreground">Last 30 days</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">42</p>
                              <p className="text-xs text-green-500">+35% from last month</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-cantaloupe/10 flex items-center justify-center mr-3">
                                <Users className="h-5 w-5 text-cantaloupe" />
                              </div>
                              <div>
                                <h3 className="font-medium">New Followers</h3>
                                <p className="text-xs text-muted-foreground">Last 30 days</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">8</p>
                              <p className="text-xs text-green-500">+60% from last month</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="border-none shadow-lg overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neo-mint/20 to-neo-mint/40 flex items-center justify-center mb-4 shadow-glow-sm">
                            <Film className="h-10 w-10 text-neo-mint" />
                          </div>
                          <h3 className="font-bold text-lg">Video Master</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Completed 30+ video analyses with excellent feedback
                          </p>
                          <Badge className="mt-4 bg-gradient-to-r from-neo-mint/20 to-neo-mint/40 text-neo-mint border-neo-mint/20">
                            Earned April 2023
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="border-none shadow-lg overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purist-blue/20 to-purist-blue/40 flex items-center justify-center mb-4 shadow-glow-sm">
                            <Pencil className="h-10 w-10 text-purist-blue" />
                          </div>
                          <h3 className="font-bold text-lg">Writing Expert</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Submitted 40+ written analyses with advanced vocabulary
                          </p>
                          <Badge className="mt-4 bg-gradient-to-r from-purist-blue/20 to-purist-blue/40 text-purist-blue border-purist-blue/20">
                            Earned June 2023
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="border-none shadow-lg overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cassis/20 to-cassis/40 flex items-center justify-center mb-4 shadow-glow-sm">
                            <Calendar className="h-10 w-10 text-cassis" />
                          </div>
                          <h3 className="font-bold text-lg">Consistency King</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Maintained a 100+ day streak of daily practice
                          </p>
                          <Badge className="mt-4 bg-gradient-to-r from-cassis/20 to-cassis/40 text-cassis border-cassis/20">
                            Earned August 2023
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="border-none shadow-lg overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cantaloupe/20 to-cantaloupe/40 flex items-center justify-center mb-4 shadow-glow-sm">
                            <Trophy className="h-10 w-10 text-cantaloupe" />
                          </div>
                          <h3 className="font-bold text-lg">Challenge Champion</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Completed 15 advanced language challenges
                          </p>
                          <Badge className="mt-4 bg-gradient-to-r from-cantaloupe/20 to-cantaloupe/40 text-cantaloupe border-cantaloupe/20">
                            Earned October 2023
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="border-none shadow-lg overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mellow-yellow/20 to-mellow-yellow/40 flex items-center justify-center mb-4 shadow-glow-sm">
                            <Users className="h-10 w-10 text-mellow-yellow" />
                          </div>
                          <h3 className="font-bold text-lg">Community Mentor</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Helped 20+ students with valuable feedback
                          </p>
                          <Badge className="mt-4 bg-gradient-to-r from-mellow-yellow/20 to-mellow-yellow/40 text-mellow-yellow border-mellow-yellow/20">
                            Earned December 2023
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-4">
                            <Lock className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-400 dark:text-gray-500">Locked Achievement</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Complete more challenges to unlock this achievement
                          </p>
                          <Badge variant="outline" className="mt-4 border-gray-300 dark:border-gray-600">
                            In Progress
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="mt-6">
                  <Card className="border-none shadow-lg overflow-hidden">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center">
                        <MessageCircle className="mr-2 h-5 w-5 text-purist-blue" />
                        Recent Feedback
                      </h2>

                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-10 h-10 border-2 border-neo-mint/20">
                              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Sarah Chen" />
                              <AvatarFallback className="bg-neo-mint/10 text-neo-mint">SC</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">Sarah Chen</p>
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs px-1.5 py-0 bg-neo-mint/10 text-neo-mint border-neo-mint/20"
                                >
                                  English Teacher
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                          </div>
                          <p className="text-sm">
                            Your pronunciation has improved significantly in your latest video! I noticed you're more
                            confident with the 'th' sound. Keep practicing the intonation patterns we discussed last
                            week.
                          </p>
                          <div className="mt-3 flex items-center text-xs text-muted-foreground">
                            <Video className="h-3 w-3 mr-1" />
                            <span>On "The Impact of Social Media" video</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-10 h-10 border-2 border-purist-blue/20">
                              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Mike Johnson" />
                              <AvatarFallback className="bg-purist-blue/10 text-purist-blue">MJ</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">Mike Johnson</p>
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs px-1.5 py-0 bg-purist-blue/10 text-purist-blue border-purist-blue/20"
                                >
                                  Community Mentor
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">5 days ago</p>
                            </div>
                          </div>
                          <p className="text-sm">
                            Your written analysis shows great improvement in grammar. I particularly liked your use of
                            complex sentences and academic vocabulary. Consider varying your sentence structure a bit
                            more for better flow.
                          </p>
                          <div className="mt-3 flex items-center text-xs text-muted-foreground">
                            <Pencil className="h-3 w-3 mr-1" />
                            <span>On "Climate Change Solutions" writing</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-10 h-10 border-2 border-cassis/20">
                              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="David Kim" />
                              <AvatarFallback className="bg-cassis/10 text-cassis">DK</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">David Kim</p>
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs px-1.5 py-0 bg-cassis/10 text-cassis border-cassis/20"
                                >
                                  Pronunciation Expert
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">1 week ago</p>
                            </div>
                          </div>
                          <p className="text-sm">
                            I'm impressed with your progress on the 'r' sound! Your presentation on Digital Marketing
                            was clear and well-articulated. Let's work on the stress patterns in multi-syllable words
                            next time.
                          </p>
                          <div className="mt-3 flex items-center text-xs text-muted-foreground">
                            <Video className="h-3 w-3 mr-1" />
                            <span>On "Digital Marketing Trends" presentation</span>
                          </div>
                        </motion.div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <Button variant="outline" className="group">
                          View All Feedback
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Custom Chart component
function Chart(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}

// Custom Lock component
function Lock(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
