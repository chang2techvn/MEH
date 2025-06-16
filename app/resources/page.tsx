"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Copy,
  CheckCircle,
  MessageSquare,
  BookText,
  Lightbulb,
  Sparkles,
  Mic,
  PenTool,
  GraduationCap,
} from "lucide-react"
import MainHeader from "@/components/ui/main-header"
import { AIChatBox } from "@/components/ai-helper/ai-chat-box"
import { AIChatButton } from "@/components/ai-helper/ai-chat-button"
import { GoogleAIStudioLink } from "@/components/ai-helper/google-ai-studio-link"
import { GeminiIntegration } from "@/components/ai-helper/gemini-integration"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ResourcesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showChatBox, setShowChatBox] = useState(false)
  const [minimizedChat, setMinimizedChat] = useState(true)
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)

  // Auto-open Google AI Studio when the page loads
  useEffect(() => {
    setMounted(true)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPrompt(text)
    setTimeout(() => setCopiedPrompt(null), 2000)
  }

  const promptExamples = {
    conversation: [
      {
        title: "Daily Conversation Practice",
        prompt:
          "I want to practice everyday English conversation. Can you role-play as a native speaker and have a conversation with me about weekend plans? Correct any mistakes I make but keep the conversation flowing naturally.",
        level: "Beginner",
      },
      {
        title: "Job Interview Preparation",
        prompt:
          "I have a job interview next week for a marketing position. Can you role-play as the interviewer and ask me common interview questions? Give me feedback on my answers and suggest improvements.",
        level: "Intermediate",
      },
      {
        title: "Business Negotiation",
        prompt:
          "I need to practice business negotiation skills. Let's role-play a scenario where I'm negotiating a contract with a potential client. You play the client who wants to reduce the price, and I'll practice my negotiation techniques. Provide feedback on my persuasion skills and language use.",
        level: "Advanced",
      },
    ],
    grammar: [
      {
        title: "Present Perfect vs. Past Simple",
        prompt:
          "I'm confused about when to use Present Perfect (I have done) versus Past Simple (I did). Can you explain the difference with clear examples, then give me 5 practice sentences where I need to choose the correct tense?",
        level: "Beginner",
      },
      {
        title: "Conditional Sentences",
        prompt:
          "Please explain all types of conditional sentences in English (zero, first, second, third, and mixed conditionals) with examples. Then create a practice exercise with 10 sentences for me to complete.",
        level: "Intermediate",
      },
      {
        title: "Advanced Clause Structures",
        prompt:
          "I want to improve my use of complex clauses in English. Can you explain and provide examples of noun clauses, adverbial clauses, and relative clauses? Then analyze this paragraph I wrote and suggest how I could make it more sophisticated using these structures: [PASTE YOUR PARAGRAPH HERE]",
        level: "Advanced",
      },
    ],
    vocabulary: [
      {
        title: "Daily Routine Vocabulary",
        prompt:
          "I want to learn vocabulary related to daily routines and activities. Please provide a list of 20 useful words and phrases with definitions and example sentences. Then create a fill-in-the-blank exercise using these words.",
        level: "Beginner",
      },
      {
        title: "Business English Vocabulary",
        prompt:
          "I need to expand my business English vocabulary. Can you provide 15 advanced business terms and expressions related to marketing and sales, with definitions and example sentences showing how to use them naturally in conversation?",
        level: "Intermediate",
      },
      {
        title: "Idiomatic Expressions",
        prompt:
          "I want to sound more natural in English. Please teach me 10 common idiomatic expressions related to success and achievement. Explain their meanings, origins if relevant, and provide example conversations showing how native speakers use them in context.",
        level: "Advanced",
      },
    ],
    writing: [
      {
        title: "Email Writing Practice",
        prompt:
          "I need to write a formal email to request information about a university course. Can you guide me through the structure and appropriate language to use? After I write my draft, please provide feedback and suggestions for improvement.",
        level: "Beginner",
      },
      {
        title: "Essay Structure Help",
        prompt:
          "I'm writing an argumentative essay about the impact of social media on society. Can you help me create an outline with a clear thesis statement, topic sentences for each paragraph, and suggestions for supporting evidence? Then review my introduction paragraph and suggest improvements.",
        level: "Intermediate",
      },
      {
        title: "Academic Writing Refinement",
        prompt:
          "I've written this research paper introduction but I think my academic writing style needs improvement. Can you analyze my text for formality, precision, conciseness, and use of academic vocabulary? Please suggest specific revisions to make it more scholarly: [PASTE YOUR TEXT HERE]",
        level: "Advanced",
      },
    ],
    pronunciation: [
      {
        title: "Difficult Sounds Practice",
        prompt:
          "I struggle with the 'th' sound in English. Can you provide a detailed explanation of how to position my tongue and mouth to make this sound correctly? Then give me a list of 15 practice words and 5 tongue twisters focusing on this sound.",
        level: "Beginner",
      },
      {
        title: "Word Stress Patterns",
        prompt:
          "I need help with word stress in English. Can you explain the basic rules for word stress and provide examples of words with different stress patterns? Then give me 20 multi-syllable words with their stress marked, grouped by pattern.",
        level: "Intermediate",
      },
      {
        title: "Intonation and Rhythm",
        prompt:
          "I want to improve my English intonation and rhythm to sound more natural. Can you explain how English speakers use rising and falling intonation for different purposes? Provide examples of questions, statements, and expressions with their intonation patterns marked, and suggest specific practice exercises.",
        level: "Advanced",
      },
    ],
  }

  const aiStudioPractices = [
    {
      title: "Conversation Partner",
      description: "Practice speaking with an AI that adapts to your level and provides gentle corrections",
      icon: <MessageSquare className="h-10 w-10 text-purist-blue" />,
      benefits: ["Immediate feedback", "Available 24/7", "Adapts to your level", "Builds confidence"],
    },
    {
      title: "Grammar Coach",
      description: "Get personalized explanations and exercises for any grammar concept",
      icon: <BookText className="h-10 w-10 text-neo-mint" />,
      benefits: ["Clear explanations", "Custom practice exercises", "Error analysis", "Progress tracking"],
    },
    {
      title: "Vocabulary Builder",
      description: "Expand your vocabulary with contextual learning and spaced repetition",
      icon: <Lightbulb className="h-10 w-10 text-cantaloupe" />,
      benefits: ["Thematic word lists", "Example sentences", "Collocation practice", "Memory techniques"],
    },
    {
      title: "Writing Assistant",
      description: "Improve your writing with detailed feedback and suggestions",
      icon: <PenTool className="h-10 w-10 text-cassis" />,
      benefits: ["Structure guidance", "Style improvement", "Error correction", "Vocabulary enhancement"],
    },
    {
      title: "Pronunciation Guide",
      description: "Perfect your pronunciation with detailed instructions and practice words",
      icon: <Mic className="h-10 w-10 text-mellow-yellow" />,
      benefits: ["Phonetic explanations", "Tongue twisters", "Stress patterns", "Intonation practice"],
    },
    {
      title: "Cultural Context",
      description: "Learn idioms, slang, and cultural references with clear explanations",
      icon: <GraduationCap className="h-10 w-10 text-purist-blue" />,
      benefits: ["Cultural insights", "Contextual usage", "Regional variations", "Communication norms"],
    },
  ]

  const learningPathways = [
    {
      level: "Beginner",
      description: "Build a strong foundation in English basics",
      activities: [
        "Daily 10-minute conversations with AI about familiar topics",
        "Learn the 1000 most common English words with context",
        "Master basic tenses and sentence structures",
        "Practice pronunciation of difficult English sounds",
      ],
    },
    {
      level: "Intermediate",
      description: "Expand your skills and fluency in various contexts",
      activities: [
        "Role-play real-life scenarios like job interviews and presentations",
        "Study advanced grammar patterns with personalized exercises",
        "Build specialized vocabulary for your field or interests",
        "Get feedback on emails, essays, and other written content",
      ],
    },
    {
      level: "Advanced",
      description: "Refine your English to near-native proficiency",
      activities: [
        "Debate complex topics with sophisticated language",
        "Master nuanced grammar and stylistic devices",
        "Learn idiomatic expressions and cultural references",
        "Receive detailed analysis of your speaking and writing patterns",
      ],
    },
  ]

  if (!mounted) return null

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-950 to-black text-white">
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-neo-mint/30 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purist-blue/30 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cassis/30 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 text-white border-none px-4 py-1">
                AI-Powered Learning
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                Master English with Google AI Studio
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                Unlock your English potential with our comprehensive guides and AI-powered learning tools. Practice
                speaking, writing, grammar, and more with personalized feedback.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <GoogleAIStudioLink />
              <Button
                variant="outline"
                className="border-neo-mint/50 text-neo-mint hover:bg-neo-mint/10 px-6 py-2 text-lg"
              >
                <Link href="#guides">View Guides</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What You Can Do Section */}
        <section className="py-16 px-6 bg-gray-900/50" id="guides">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How AI Studio Enhances Your English Learning</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Google AI Studio offers powerful tools to practice all aspects of English. Here's how you can use it to
                accelerate your learning journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiStudioPractices.map((practice, index) => (
                <Card
                  key={index}
                  className="bg-gray-900/80 border border-gray-800 hover:border-neo-mint/50 transition-all duration-300 overflow-hidden group"
                >
                  <CardHeader>
                    <div className="mb-2">{practice.icon}</div>
                    <CardTitle className="text-xl font-bold">{practice.title}</CardTitle>
                    <CardDescription className="text-gray-400">{practice.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {practice.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-neo-mint" />
                          <span className="text-sm text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Pathways */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Your AI-Powered Learning Journey</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Follow these structured pathways to systematically improve your English skills with Google AI Studio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learningPathways.map((pathway, index) => (
                <Card
                  key={index}
                  className="bg-gray-900/80 border border-gray-800 hover:border-neo-mint/50 transition-all duration-300 h-full"
                >
                  <CardHeader>
                    <Badge
                      className={`w-fit ${
                        index === 0
                          ? "bg-neo-mint/20 text-neo-mint"
                          : index === 1
                            ? "bg-purist-blue/20 text-purist-blue"
                            : "bg-cassis/20 text-cassis"
                      }`}
                    >
                      {pathway.level}
                    </Badge>
                    <CardTitle className="text-xl font-bold mt-2">{pathway.level} Path</CardTitle>
                    <CardDescription className="text-gray-400">{pathway.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pathway.activities.map((activity, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles
                            className={`h-5 w-5 mt-0.5 ${
                              index === 0 ? "text-neo-mint" : index === 1 ? "text-purist-blue" : "text-cassis"
                            }`}
                          />
                          <span className="text-sm text-gray-300">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Prompt Examples Section */}
        <section className="py-16 px-6 bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready-to-Use AI Prompts</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Copy these expertly crafted prompts to get the most out of Google AI Studio for your English practice.
              </p>
            </div>

            <Tabs defaultValue="conversation" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger
                  value="conversation"
                  className="data-[state=active]:bg-neo-mint/20 data-[state=active]:text-neo-mint"
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Conversation
                </TabsTrigger>
                <TabsTrigger
                  value="grammar"
                  className="data-[state=active]:bg-purist-blue/20 data-[state=active]:text-purist-blue"
                >
                  <BookText className="h-4 w-4 mr-2" /> Grammar
                </TabsTrigger>
                <TabsTrigger
                  value="vocabulary"
                  className="data-[state=active]:bg-cantaloupe/20 data-[state=active]:text-cantaloupe"
                >
                  <Lightbulb className="h-4 w-4 mr-2" /> Vocabulary
                </TabsTrigger>
                <TabsTrigger
                  value="writing"
                  className="data-[state=active]:bg-cassis/20 data-[state=active]:text-cassis"
                >
                  <PenTool className="h-4 w-4 mr-2" /> Writing
                </TabsTrigger>
                <TabsTrigger
                  value="pronunciation"
                  className="data-[state=active]:bg-mellow-yellow/20 data-[state=active]:text-mellow-yellow"
                >
                  <Mic className="h-4 w-4 mr-2" /> Pronunciation
                </TabsTrigger>
              </TabsList>

              {Object.entries(promptExamples).map(([category, prompts]) => (
                <TabsContent key={category} value={category} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {prompts.map((prompt, index) => (
                      <Card
                        key={index}
                        className="bg-gray-900/80 border border-gray-800 hover:border-neo-mint/50 transition-all duration-300"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge
                              className={`
                              ${
                                prompt.level === "Beginner"
                                  ? "bg-neo-mint/20 text-neo-mint"
                                  : prompt.level === "Intermediate"
                                    ? "bg-purist-blue/20 text-purist-blue"
                                    : "bg-cassis/20 text-cassis"
                              }
                            `}
                            >
                              {prompt.level}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(prompt.prompt)}
                              className="h-8 w-8"
                            >
                              {copiedPrompt === prompt.prompt ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <CardTitle className="text-lg font-bold mt-2">{prompt.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-300 line-clamp-4">{prompt.prompt}</p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-neo-mint/30 text-neo-mint hover:bg-neo-mint/10"
                            onClick={() => copyToClipboard(prompt.prompt)}
                          >
                            {copiedPrompt === prompt.prompt ? "Copied!" : "Copy Prompt"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Getting Started with Google AI Studio</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Follow this simple guide to start using Google AI Studio for your English learning journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neo-mint/20 flex items-center justify-center text-neo-mint font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Access Google AI Studio</h3>
                    <p className="text-gray-300">
                      Click the "Open Google AI Studio" button at the top of this page or visit{" "}
                      <a
                        href="https://aistudio.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neo-mint hover:underline"
                      >
                        aistudio.google.com
                      </a>{" "}
                      directly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purist-blue/20 flex items-center justify-center text-purist-blue font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Sign in with your Google Account</h3>
                    <p className="text-gray-300">
                      Use your existing Google account to sign in. If you don't have one, you'll need to create a free
                      account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cassis/20 flex items-center justify-center text-cassis font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Start a New Conversation</h3>
                    <p className="text-gray-300">
                      Click on "New Chat" to begin a fresh conversation with the AI. You'll be using Gemini, Google's
                      advanced language model.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cantaloupe/20 flex items-center justify-center text-cantaloupe font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Copy a Prompt from Our Examples</h3>
                    <p className="text-gray-300">
                      Choose a prompt from our examples above that matches your learning goals. Copy it and paste it
                      into the chat.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mellow-yellow/20 flex items-center justify-center text-mellow-yellow font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Engage and Practice</h3>
                    <p className="text-gray-300">
                      Follow the AI's instructions and engage in the learning activity. Ask follow-up questions if you
                      need clarification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 shadow-neo">
                <h3 className="text-xl font-bold mb-4">Tips for Effective Learning</h3>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">Be specific about your level and needs</AccordionTrigger>
                    <AccordionContent>
                      Tell the AI your current English level (beginner, intermediate, advanced) and any specific areas
                      you're struggling with. This helps it tailor responses to your needs.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">Ask for explanations when confused</AccordionTrigger>
                    <AccordionContent>
                      If you don't understand something, ask the AI to explain it differently or provide more examples.
                      Don't hesitate to ask "Can you explain that in simpler terms?" or "Can you give me another
                      example?"
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">Request feedback on your responses</AccordionTrigger>
                    <AccordionContent>
                      After writing or speaking practice, ask: "How can I improve this?" or "What mistakes did I make?"
                      The AI will provide constructive feedback to help you improve.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">Save useful conversations</AccordionTrigger>
                    <AccordionContent>
                      When you have a particularly helpful conversation, save it by copying the text or using the save
                      feature in Google AI Studio. This creates a personal library of learning resources.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">Practice regularly with varied topics</AccordionTrigger>
                    <AccordionContent>
                      Schedule regular practice sessions with different topics and skills. Consistency is key to
                      language learning, and variety keeps you engaged and expands your knowledge.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* Try Gemini AI Section */}
        <section className="py-16 px-6 bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Gemini AI Right Here</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Experience the power of AI-assisted learning with our integrated Gemini model. Ask questions, practice
                conversations, or get help with grammar and vocabulary.
              </p>
            </div>

            <GeminiIntegration />

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Note: For a full-featured experience with more capabilities, we recommend using Google AI Studio
                directly.
              </p>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                See how other learners have improved their English skills using AI-powered practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/80 border border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neo-mint/20 flex items-center justify-center">
                      <span className="text-neo-mint font-bold">MK</span>
                    </div>
                    <div>
                      <CardTitle>Maria K.</CardTitle>
                      <CardDescription>Business Professional</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    "I practiced business presentations with AI Studio for 15 minutes daily. After just one month, I
                    successfully delivered a presentation to international clients with confidence!"
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purist-blue/20 flex items-center justify-center">
                      <span className="text-purist-blue font-bold">JT</span>
                    </div>
                    <div>
                      <CardTitle>Jun T.</CardTitle>
                      <CardDescription>University Student</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    "The grammar exercises helped me improve my academic writing significantly. My professor noticed the
                    difference in my latest essay and gave me my highest grade ever!"
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cassis/20 flex items-center justify-center">
                      <span className="text-cassis font-bold">AL</span>
                    </div>
                    <div>
                      <CardTitle>Ahmed L.</CardTitle>
                      <CardDescription>Software Developer</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    "I used the conversation practice to prepare for job interviews in English. I landed my dream job at
                    an international tech company after just two months of practice!"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Floating Chat Icon */}
        <AIChatButton />

        {/* AI Chat Box */}
        {showChatBox && !minimizedChat && (
          <AIChatBox 
            onClose={() => setShowChatBox(false)} 
            onMinimize={() => setMinimizedChat(true)} 
            buttonPosition={{ x: window.innerWidth - 80, y: window.innerHeight - 80 }} 
          />
        )}
      </main>

      <footer className="border-t border-white/10 bg-black backdrop-blur-xl">
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 EnglishMastery. All rights reserved.</p>
          </div>
      </footer>
    </div>
  )
}
