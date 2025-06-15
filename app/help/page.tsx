"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, BookOpen, Video, MessageCircle, Headphones, FileText, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/ui/page-header"
import SiteFooter from "@/components/ui/site-footer"
import MainHeader from "@/components/ui/main-header"

export default function HelpPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics of EnglishMastery",
      articles: [
        { title: "Creating your account", link: "/help/creating-account" },
        { title: "Setting up your profile", link: "/help/profile-setup" },
        { title: "Understanding your dashboard", link: "/help/dashboard" },
        { title: "Navigating the platform", link: "/help/navigation" },
        { title: "Subscription plans", link: "/help/subscription-plans" },
      ],
    },
    {
      id: "video-challenges",
      title: "Video Challenges",
      icon: Video,
      description: "Master the 4-Skill Video Crucible methodology",
      articles: [
        { title: "How video challenges work", link: "/help/video-challenges" },
        { title: "Submitting your responses", link: "/help/submitting-responses" },
        { title: "Getting AI feedback", link: "/help/ai-feedback" },
        { title: "Peer review process", link: "/help/peer-review" },
        { title: "Challenge difficulty levels", link: "/help/difficulty-levels" },
      ],
    },
    {
      id: "community",
      title: "Community",
      icon: MessageCircle,
      description: "Connect with fellow English learners",
      articles: [
        { title: "Joining discussion groups", link: "/help/discussion-groups" },
        { title: "Posting in the community", link: "/help/community-posting" },
        { title: "Finding language partners", link: "/help/language-partners" },
        { title: "Community guidelines", link: "/help/community-guidelines" },
        { title: "Reporting inappropriate content", link: "/help/reporting-content" },
      ],
    },
    {
      id: "listening-speaking",
      title: "Listening & Speaking",
      icon: Headphones,
      description: "Improve your listening and speaking skills",
      articles: [
        { title: "Audio playback features", link: "/help/audio-playback" },
        { title: "Recording your speaking responses", link: "/help/recording-responses" },
        { title: "Pronunciation feedback", link: "/help/pronunciation-feedback" },
        { title: "Listening comprehension tips", link: "/help/listening-tips" },
        { title: "Speaking practice exercises", link: "/help/speaking-exercises" },
      ],
    },
    {
      id: "reading-writing",
      title: "Reading & Writing",
      icon: FileText,
      description: "Enhance your reading and writing abilities",
      articles: [
        { title: "Using the text editor", link: "/help/text-editor" },
        { title: "Grammar checking tools", link: "/help/grammar-tools" },
        { title: "Writing feedback system", link: "/help/writing-feedback" },
        { title: "Reading comprehension strategies", link: "/help/reading-strategies" },
        { title: "Vocabulary building features", link: "/help/vocabulary-building" },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: HelpCircle,
      description: "Solve common issues and get support",
      articles: [
        { title: "Account access problems", link: "/help/account-access" },
        { title: "Video playback issues", link: "/help/video-playback-issues" },
        { title: "Audio recording troubleshooting", link: "/help/audio-recording-issues" },
        { title: "Payment and billing questions", link: "/help/payment-billing" },
        { title: "Contacting support", link: "/help/contact-support" },
      ],
    },
  ]

  const popularArticles = [
    { title: "How to get started with video challenges", link: "/help/video-challenges" },
    { title: "Troubleshooting audio recording issues", link: "/help/audio-recording-issues" },
    { title: "Getting the most from AI feedback", link: "/help/ai-feedback" },
    { title: "Finding the right language partners", link: "/help/language-partners" },
    { title: "Understanding your progress metrics", link: "/help/progress-metrics" },
  ]

  const filteredCategories = searchQuery
    ? helpCategories
        .map((category) => ({
          ...category,
          articles: category.articles.filter((article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((category) => category.articles.length > 0)
    : helpCategories

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1">
        <PageHeader
          title="Help Center"
          description="Find answers to your questions and learn how to get the most out of EnglishMastery."
        />

        <section className="container py-8">
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                className="pl-10 py-6 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="categories" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="categories">Help Categories</TabsTrigger>
              <TabsTrigger value="popular">Popular Articles</TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group">
                      <CardHeader className="pb-2 relative">
                        <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 group-hover:from-neo-mint/30 group-hover:to-purist-blue/30 transition-all duration-300"></div>
                        <div className="mb-2 flex items-center">
                          <category.icon className="h-5 w-5 mr-2 text-neo-mint dark:text-purist-blue" />
                          <CardTitle className="text-xl">{category.title}</CardTitle>
                        </div>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.articles.map((article, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                            >
                              <a
                                href={article.link}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-neo-mint dark:hover:text-purist-blue transition-colors flex items-center"
                              >
                                <span className="h-1 w-1 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></span>
                                {article.title}
                              </a>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    We couldn't find any help articles matching your search.
                  </p>
                  <Button onClick={() => setSearchQuery("")} variant="outline">
                    Clear search
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-6">Most Popular Help Articles</h3>
                <div className="space-y-6">
                  {popularArticles.map((article, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0"
                    >
                      <a href={article.link} className="group flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 rounded-full flex items-center justify-center mr-4">
                          <span className="text-lg font-semibold text-neo-mint dark:text-purist-blue">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium group-hover:text-neo-mint dark:group-hover:text-purist-blue transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Read this article to learn more about this topic and improve your experience.
                          </p>
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 mt-12">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Still need help?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Our support team is ready to assist you with any questions or issues you may have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white"
                  size="lg"
                  asChild
                >
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/faq">View FAQs</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
