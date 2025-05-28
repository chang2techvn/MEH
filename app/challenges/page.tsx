"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Search, Plus, Loader2, BookOpen } from "lucide-react"
import AssignedTask from "@/components/assigned-task"
import ChallengeCard from "@/components/challenge-card"
import CreateChallengeModal from "@/components/create-challenge-modal"
import { fetchAllChallenges, fetchCurrentChallenge} from "@/app/actions/challenge-videos"
import { challengeTopics, type Challenge } from '../utils/challenge-constants'
import { toast } from "@/hooks/use-toast"
import MainHeader from "@/components/main-header"

// Add these imports at the top of the file
import { AIChatBox } from "@/components/ai-chat-box"
import { AIChatButton } from "@/components/ai-chat-button"

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Add these state variables inside the ChallengesPage component
  const [showChatBox, setShowChatBox] = useState(false)
  const [minimizedChat, setMinimizedChat] = useState(true)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Tải thử thách khi component được mount
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true)

        // Lấy thử thách hiện tại
        const todayChallenge = await fetchCurrentChallenge()
        setCurrentChallenge(todayChallenge)

        // Lấy tất cả các thử thách
        const allChallenges = await fetchAllChallenges(2) // 2 thử thách cho mỗi cấp độ

        // Kiểm tra xem có thử thách đã lưu trong localStorage không
        const savedChallenges = localStorage.getItem("userChallenges")
        let combinedChallenges = allChallenges

        if (savedChallenges) {
          const parsedChallenges = JSON.parse(savedChallenges)
          combinedChallenges = [...parsedChallenges, ...allChallenges]
        }

        setChallenges(combinedChallenges)
        setFilteredChallenges(combinedChallenges)
      } catch (error) {
        console.error("Error loading challenges:", error)
        toast({
          title: "Error",
          description: "Failed to load challenges. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  // Lọc thử thách khi tab hoặc từ khóa tìm kiếm thay đổi
  useEffect(() => {
    let filtered = challenges

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        (challenge) =>
          challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          challenge.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Lọc theo tab
    if (activeTab !== "all") {
      filtered = filtered.filter((challenge) => challenge.difficulty === activeTab)
    }

    setFilteredChallenges(filtered)
  }, [challenges, searchTerm, activeTab])

  // Xử lý khi người dùng tạo thử thách mới
  const handleChallengeCreated = (newChallenge: Challenge) => {
    // Thêm thử thách mới vào danh sách
    const updatedChallenges = [newChallenge, ...challenges]
    setChallenges(updatedChallenges)

    // Lưu vào localStorage
    const savedChallenges = localStorage.getItem("userChallenges")
    let userChallenges = savedChallenges ? JSON.parse(savedChallenges) : []
    userChallenges = [newChallenge, ...userChallenges]
    localStorage.setItem("userChallenges", JSON.stringify(userChallenges))

    // Hiển thị thông báo thành công
    toast({
      title: "Challenge created",
      description: "Your challenge has been added to the list",
    })
  }

  // Xử lý khi người dùng bắt đầu thử thách
  const handleStartChallenge = (id: string) => {
    // Trong ứng dụng thực tế, bạn sẽ chuyển hướng đến trang thử thách
    toast({
      title: "Challenge started",
      description: `You've started the challenge with ID: ${id}`,
    })
  }

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="container py-8 flex-1">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading challenges...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a moment as we prepare your personalized challenges
            </p>
          </div>
        </div>
        <footer className="border-t border-white/10 dark:border-gray-800/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
          <div className="container py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                    <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                    EnglishMastery
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Master English through our innovative 4-Skill Video Crucible methodology. Practice listening,
                  speaking, reading, and writing in an engaging community.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/challenges" className="text-muted-foreground hover:text-foreground transition-colors">
                      Challenges
                    </Link>
                  </li>
                  <li>
                    <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                      Community
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                      Resources
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Subscribe</h3>
                <p className="text-sm text-muted-foreground mb-2">Get the latest updates and news</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Your email"
                      className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 dark:border-gray-800/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>© 2025 EnglishMastery. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="container py-8 flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Challenges</h1>
            <p className="text-muted-foreground">Practice your English with our video challenges</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search challenges..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {currentChallenge && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Your Current Challenge</h2>
            <AssignedTask
              title={currentChallenge.title}
              description={currentChallenge.description}
              videoUrl={currentChallenge.videoUrl}
              dueDate="2025-04-05"
            />
          </div>
        )}

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    id={challenge.id}
                    title={challenge.title}
                    description={challenge.description}
                    thumbnailUrl={challenge.thumbnailUrl}
                    duration={challenge.duration}
                    difficulty={challenge.difficulty}
                    onStart={handleStartChallenge}
                  />
                ))}
              </div>
            ) : (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">No challenges found matching your criteria</p>
                  <Button onClick={() => setCreateModalOpen(true)}>Create a Challenge</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="beginner" className="mt-6">
            {filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    id={challenge.id}
                    title={challenge.title}
                    description={challenge.description}
                    thumbnailUrl={challenge.thumbnailUrl}
                    duration={challenge.duration}
                    difficulty={challenge.difficulty}
                    onStart={handleStartChallenge}
                  />
                ))}
              </div>
            ) : (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">No beginner challenges found</p>
                  <Button onClick={() => setCreateModalOpen(true)}>Create a Beginner Challenge</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="intermediate" className="mt-6">
            {filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    id={challenge.id}
                    title={challenge.title}
                    description={challenge.description}
                    thumbnailUrl={challenge.thumbnailUrl}
                    duration={challenge.duration}
                    difficulty={challenge.difficulty}
                    onStart={handleStartChallenge}
                  />
                ))}
              </div>
            ) : (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">No intermediate challenges found</p>
                  <Button onClick={() => setCreateModalOpen(true)}>Create an Intermediate Challenge</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            {filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    id={challenge.id}
                    title={challenge.title}
                    description={challenge.description}
                    thumbnailUrl={challenge.thumbnailUrl}
                    duration={challenge.duration}
                    difficulty={challenge.difficulty}
                    onStart={handleStartChallenge}
                  />
                ))}
              </div>
            ) : (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">No advanced challenges found</p>
                  <Button onClick={() => setCreateModalOpen(true)}>Create an Advanced Challenge</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <CreateChallengeModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onChallengeCreated={handleChallengeCreated}
        />

        {/* Floating Chat Icon */}
        <AIChatButton
          onClick={() => {
            setShowChatBox(true)
            setMinimizedChat(!minimizedChat)
          }}
        />

        {/* AI Chat Box */}
        {showChatBox && !minimizedChat && (
          <AIChatBox 
            onClose={() => setShowChatBox(false)} 
            onMinimize={() => setMinimizedChat(true)}
            buttonPosition={{ x: window.innerWidth - 80, y: window.innerHeight - 80 }}
          />
        )}
      </div>
      <footer className="border-t border-white/10 dark:border-gray-800/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                  EnglishMastery
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Master English through our innovative 4-Skill Video Crucible methodology. Practice listening, speaking,
                reading, and writing in an engaging community.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/challenges" className="text-muted-foreground hover:text-foreground transition-colors">
                    Challenges
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Subscribe</h3>
              <p className="text-sm text-muted-foreground mb-2">Get the latest updates and news</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Your email"
                    className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                  />
                </div>
                <Button className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 dark:border-gray-800/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 EnglishMastery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
