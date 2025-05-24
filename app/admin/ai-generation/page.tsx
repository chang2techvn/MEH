"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu,
  FileText,
  ImageIcon,
  MessageSquare,
  Video,
  BookOpen,
  Award,
  Save,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Wand2,
  Loader2,
  Trash2,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Zap,
  Lightbulb,
  Palette,
  Layers,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for templates
const contentTemplates = [
  {
    id: 1,
    name: "Daily Challenge",
    description: "Generate a daily language challenge with instructions and examples",
    icon: <Award className="h-5 w-5 text-amber-500" />,
    prompt:
      "Create a daily English language challenge focused on {topic}. Include instructions, examples, and a difficulty level of {difficulty}.",
  },
  {
    id: 2,
    name: "Lesson Plan",
    description: "Complete lesson plan with objectives, activities and resources",
    icon: <BookOpen className="h-5 w-5 text-emerald-500" />,
    prompt:
      "Generate a comprehensive English lesson plan on {topic} for {level} students. Include learning objectives, warm-up activities, main exercises, and assessment methods.",
  },
  {
    id: 3,
    name: "Conversation Starter",
    description: "Engaging conversation topics with guiding questions",
    icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
    prompt:
      "Create a set of conversation starters about {topic} for {level} English learners. Include 5 main questions and 3 follow-up questions for each.",
  },
  {
    id: 4,
    name: "Grammar Explanation",
    description: "Clear explanation of grammar rules with examples",
    icon: <FileText className="h-5 w-5 text-purple-500" />,
    prompt:
      "Explain the grammar rule of {grammar_point} for {level} English learners. Include the rule, usage notes, 5 examples, and common mistakes to avoid.",
  },
  {
    id: 5,
    name: "Video Script",
    description: "Script for educational videos with visual cues",
    icon: <Video className="h-5 w-5 text-red-500" />,
    prompt:
      "Write a script for a 3-5 minute educational video about {topic} for {level} English learners. Include an engaging introduction, clear explanations, visual cues, and a summary.",
  },
]

// Mock data for generation history
const generationHistory = [
  {
    id: "gen-1",
    title: "Advanced Phrasal Verbs Lesson",
    type: "Lesson Plan",
    date: "2023-05-18T14:30:00",
    status: "completed",
    prompt: "Generate a comprehensive English lesson plan on phrasal verbs for advanced students.",
  },
  {
    id: "gen-2",
    title: "Business English Conversation",
    type: "Conversation Starter",
    date: "2023-05-17T10:15:00",
    status: "completed",
    prompt: "Create a set of conversation starters about business meetings for intermediate English learners.",
  },
  {
    id: "gen-3",
    title: "Present Perfect Challenge",
    type: "Daily Challenge",
    date: "2023-05-16T16:45:00",
    status: "completed",
    prompt: "Create a daily English language challenge focused on present perfect tense.",
  },
  {
    id: "gen-4",
    title: "Pronunciation Video Script",
    type: "Video Script",
    date: "2023-05-15T09:20:00",
    status: "completed",
    prompt: "Write a script for a 3-5 minute educational video about English pronunciation.",
  },
  {
    id: "gen-5",
    title: "Conditional Sentences Explanation",
    type: "Grammar Explanation",
    date: "2023-05-14T13:10:00",
    status: "completed",
    prompt: "Explain the grammar rule of conditional sentences for intermediate English learners.",
  },
]

export default function AIGenerationPage() {
  const [activeTab, setActiveTab] = useState("text")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [creativity, setCreativity] = useState([0.7])
  const [length, setLength] = useState([2]) // 1-3 scale for short, medium, long
  const [customPrompt, setCustomPrompt] = useState("")
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("intermediate")
  const [grammarPoint, setGrammarPoint] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [isLoading, setIsLoading] = useState(true)
  const [savedTemplates, setSavedTemplates] = useState<any[]>([])
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplatePrompt, setNewTemplatePrompt] = useState("")
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [enhancementOptions, setEnhancementOptions] = useState({
    includeImages: false,
    includeExamples: true,
    includeQuiz: false,
    optimizeForSEO: false,
    adaptToLearningStyle: false,
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Handle template selection
  const handleTemplateSelect = (id: number) => {
    setSelectedTemplate(id)
    const template = contentTemplates.find((t) => t.id === id)
    if (template) {
      setCustomPrompt(template.prompt)
    }
  }

  // Handle content generation
  const generateContent = () => {
    setIsGenerating(true)
    setGeneratedContent("")

    // Process the prompt with variables
    const processedPrompt = customPrompt
      .replace("{topic}", topic || "[topic]")
      .replace("{level}", level)
      .replace("{grammar_point}", grammarPoint || "[grammar point]")
      .replace("{difficulty}", difficulty)

    // Simulate AI generation with typing effect
    const fullContent = getSimulatedContent(processedPrompt)
    let index = 0

    const interval = setInterval(() => {
      if (index < fullContent.length) {
        setGeneratedContent((prev) => prev + fullContent.charAt(index))
        index++
      } else {
        clearInterval(interval)
        setIsGenerating(false)
      }
    }, 10)

    return () => clearInterval(interval)
  }

  // Simulate content based on prompt
  const getSimulatedContent = (prompt: string) => {
    // This would be replaced with actual AI generation
    if (prompt.includes("daily challenge")) {
      return `# Daily Challenge: ${topic || "Idiomatic Expressions"}\n\n## Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}\n\n### Instructions\nToday's challenge focuses on common idiomatic expressions used in everyday English conversations. Your task is to match the expressions with their meanings and then use them in your own sentences.\n\n### Expressions to Learn\n1. "Break the ice" - To initiate conversation in a social situation\n2. "Hit the books" - To study intensively\n3. "Cut corners" - To do something in the easiest or cheapest way\n4. "Miss the boat" - To miss an opportunity\n5. "Pull yourself together" - To calm down and regain control of your emotions\n\n### Exercise 1: Matching\nMatch the expressions with situations where they might be used.\n\n### Exercise 2: Fill in the Blanks\nComplete the sentences using the appropriate idiomatic expressions.\n\n### Exercise 3: Create Your Own\nWrite 3 short dialogues using at least 3 of the expressions from today's challenge.\n\n### Bonus Challenge\nResearch and find 2 additional idiomatic expressions related to today's theme and share them with examples.`
    } else if (prompt.includes("lesson plan")) {
      return `# Lesson Plan: ${topic || "Mastering Conditionals"}\n\n## Level: ${level.charAt(0).toUpperCase() + level.slice(1)}\n\n### Learning Objectives\n- Understand the structure and usage of all conditional forms in English\n- Differentiate between zero, first, second, and third conditionals\n- Apply conditionals correctly in both speaking and writing\n- Identify common mistakes with conditional sentences\n\n### Warm-up Activity (10 minutes)\n- Quick review of if/then structures\n- Conditional sentence chain game\n\n### Main Activities\n\n#### Activity 1: Conditional Types Exploration (15 minutes)\n- Presentation of the four main conditional types with examples\n- Guided discovery of the form and meaning of each type\n- Matching exercise: situations with appropriate conditional forms\n\n#### Activity 2: Conditional Transformation (20 minutes)\n- Students transform sentences between different conditional types\n- Focus on how meaning changes with different conditionals\n- Peer checking and discussion of nuances\n\n#### Activity 3: Real-life Conditionals (25 minutes)\n- Role-play activities using target conditionals in context\n- Discussion questions using "What would you do if..."\n- Writing task: Creating a "Chain of events" story using conditionals\n\n### Assessment\n- Exit ticket: Students write 4 sentences, one for each conditional type\n- Homework: Complete a conditional story with missing forms\n\n### Resources Needed\n- Conditional forms handout\n- Situation cards for role-play\n- Interactive whiteboard for demonstrations\n\n### Extension Activities\n- Mixed conditionals for advanced students\n- Creative writing task using conditionals`
    } else if (prompt.includes("conversation")) {
      return `# Conversation Starters: ${topic || "Environmental Issues"}\n\n## Level: ${level.charAt(0).toUpperCase() + level.slice(1)}\n\n### Main Questions\n\n1. **How has the environment in your hometown changed since you were a child?**\n   - What natural areas did you enjoy visiting as a child?\n   - What environmental changes concern you the most?\n   - How have these changes affected daily life for residents?\n\n2. **Do you think individuals or governments should take more responsibility for protecting the environment?**\n   - What environmental actions do you take in your daily life?\n   - What policies has your government implemented that you agree or disagree with?\n   - How can we balance economic growth with environmental protection?\n\n3. **How might technology help solve environmental problems?**\n   - What green technologies are you most excited about?\n   - Do you think technology created some of our environmental problems?\n   - Would you be willing to pay more for environmentally friendly technology?\n\n4. **How do environmental issues affect different generations differently?**\n   - Do you notice differences in how older and younger people view environmental issues?\n   - How might climate change affect future generations?\n   - What environmental lessons should we pass on to children?\n\n5. **What role does media play in shaping our understanding of environmental issues?**\n   - Where do you get most of your information about environmental issues?\n   - Do you think environmental problems are exaggerated or understated in media?\n   - How has social media changed environmental activism?\n\n### Discussion Tips\n- Encourage learners to use specific examples from their own experience\n- Practice using environmental vocabulary and expressions\n- Focus on listening skills and asking follow-up questions`
    } else if (prompt.includes("grammar")) {
      return `# Grammar Explanation: ${grammarPoint || "Present Perfect Continuous"}\n\n## Level: ${level.charAt(0).toUpperCase() + level.slice(1)}\n\n### The Rule\nThe Present Perfect Continuous tense is used to describe an action that started in the past, continues into the present, and may continue into the future. It emphasizes the duration or ongoing nature of the action.\n\n### Form\n- Positive: Subject + have/has + been + verb-ing\n- Negative: Subject + have/has + not + been + verb-ing\n- Question: Have/Has + subject + been + verb-ing?\n\n### Usage\n1. To talk about actions or situations that started in the past and continue to the present\n2. To emphasize the duration of an ongoing action\n3. To explain a present result (often visible) with a recent continuous action\n\n### Examples\n1. "I have been learning English for five years." (started in the past, still learning now)\n2. "She has been working on this project since Monday." (started Monday, still working now)\n3. "They haven't been sleeping well lately." (recent ongoing situation)\n4. "Has he been waiting for long?" (asking about duration up to now)\n5. "Sorry about the mess. I've been painting the kitchen." (explaining a visible result)\n\n### Common Mistakes to Avoid\n- Confusing Present Perfect Continuous with Present Perfect Simple\n- Using with stative verbs (better to use Present Perfect Simple instead)\n- Forgetting to include a time expression (for/since)\n- Using the wrong form of "been" (it never changes)\n\n### Practice Exercise\nComplete these sentences using the Present Perfect Continuous tense:\n1. I _______ (try) to contact you all day.\n2. How long _______ (you/study) English?\n3. She looks tired because she _______ (work) overtime.\n4. The ground is wet. It _______ (rain).\n5. They _______ (not/get) along recently.`
    } else if (prompt.includes("video script")) {
      return `# Video Script: ${topic || "English Pronunciation Tips"}\n\n## Level: ${level.charAt(0).toUpperCase() + level.slice(1)}\n\n### OPENING SHOT: Instructor at desk with pronunciation chart visible\n\n**INSTRUCTOR:** (Smiling, energetic) Hello English learners! Welcome to today's lesson on mastering English pronunciation. I'm [Name], and today we're going to tackle some of the most challenging sounds for non-native speakers.\n\n### VISUAL: Animated title card "Master These 5 Tricky English Sounds"\n\n**INSTRUCTOR:** English pronunciation can sometimes feel like a puzzle, but with the right techniques, you can sound more natural and be understood more easily.\n\n### VISUAL: Close-up of mouth forming the "th" sound\n\n**INSTRUCTOR:** Let's start with perhaps the most notorious sound in English - the "th" sound. There are actually two "th" sounds: the voiced one in words like "this" and "they," and the unvoiced one in words like "think" and "thumb."\n\n### VISUAL: Animation showing tongue position between teeth\n\n**INSTRUCTOR:** To make these sounds correctly, place the tip of your tongue between your teeth, like this. For the voiced "th," add voice from your throat. Let's practice together: "this, that, these, those."\n\n### VISUAL: Split screen showing common substitutions (d/t/f/v for th)\n\n**INSTRUCTOR:** Many learners substitute "d," "t," "f," or "v" for these sounds. Let's compare: "they" is not "day," and "think" is not "sink."\n\n[CONTINUE WITH ADDITIONAL SOUNDS AND PRACTICE]\n\n### VISUAL: Practice sentences on screen\n\n**INSTRUCTOR:** Now let's put it all together with this sentence: "I thought thoroughly about the rhythm of authentic English."\n\n### VISUAL: Recap of the 5 sounds with key words\n\n**INSTRUCTOR:** Remember, improving your pronunciation takes practice. Focus on one sound at a time, record yourself, and listen back. Don't be afraid to exaggerate at first!\n\n### CLOSING SHOT: Instructor with encouraging expression\n\n**INSTRUCTOR:** That's all for today! In the comments, let me know which English sound you find most difficult. Don't forget to download the practice sheet linked below. Keep practicing, and I'll see you in our next lesson!\n\n### VISUAL: End screen with call-to-action buttons\n\n**VOICEOVER:** Subscribe for a new pronunciation lesson every week!`
    } else {
      return `# Generated Content\n\nThis is a sample of AI-generated content based on your prompt. In a real implementation, this would be generated by an AI model based on the specific prompt and parameters you've provided.\n\nYour prompt was related to: ${prompt}\n\nThe content would be tailored to your specific needs, including:\n- Appropriate level (${level})\n- Relevant topic focus\n- Proper formatting and structure\n- Educational best practices\n\nThe actual implementation would connect to an AI service like OpenAI's GPT-4, Anthropic's Claude, or Google's Gemini to generate high-quality educational content.`
    }
  }

  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle save template
  const saveNewTemplate = () => {
    if (newTemplateName && newTemplatePrompt) {
      const newTemplate = {
        id: savedTemplates.length + 100, // Avoid ID conflicts with default templates
        name: newTemplateName,
        description: "Custom template",
        icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
        prompt: newTemplatePrompt,
      }
      setSavedTemplates([...savedTemplates, newTemplate])
      setNewTemplateName("")
      setNewTemplatePrompt("")
      setShowNewTemplateDialog(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Content Generation</h1>
          <p className="text-muted-foreground">Create high-quality educational content with AI assistance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Templates and settings */}
        <div className="lg:col-span-1 space-y-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-[120px] w-full" />
                <Skeleton className="h-[120px] w-full" />
                <Skeleton className="h-[120px] w-full" />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Content Templates</h2>
                    <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Template</DialogTitle>
                          <DialogDescription>
                            Create a custom template for generating content. Use {"{variable}"} syntax for replaceable
                            parameters.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="template-name">Template Name</Label>
                            <Input
                              id="template-name"
                              placeholder="e.g., Vocabulary List"
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="template-prompt">Template Prompt</Label>
                            <Textarea
                              id="template-prompt"
                              placeholder="Create a vocabulary list for {level} students about {topic} with definitions and example sentences."
                              rows={5}
                              value={newTemplatePrompt}
                              onChange={(e) => setNewTemplatePrompt(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={saveNewTemplate}>Save Template</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {[...contentTemplates, ...savedTemplates].map((template) => (
                        <motion.div key={template.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Card
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {template.icon}
                                  <CardTitle className="text-base">{template.name}</CardTitle>
                                </div>
                                {selectedTemplate === template.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                                  >
                                    <Check className="h-4 w-4 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <CardDescription>{template.description}</CardDescription>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <h2 className="text-xl font-semibold">Generation Settings</h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="creativity">Creativity</Label>
                        <span className="text-sm text-muted-foreground">
                          {creativity[0] < 0.3 ? "Conservative" : creativity[0] < 0.7 ? "Balanced" : "Creative"}
                        </span>
                      </div>
                      <Slider
                        id="creativity"
                        min={0}
                        max={1}
                        step={0.1}
                        value={creativity}
                        onValueChange={setCreativity}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="length">Content Length</Label>
                        <span className="text-sm text-muted-foreground">
                          {length[0] === 1 ? "Concise" : length[0] === 2 ? "Standard" : "Comprehensive"}
                        </span>
                      </div>
                      <Slider id="length" min={1} max={3} step={1} value={length} onValueChange={setLength} />
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="enhancement">
                        <AccordionTrigger className="text-sm font-medium">Enhancement Options</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="include-examples" className="text-sm">
                                Include Examples
                              </Label>
                              <Switch
                                id="include-examples"
                                checked={enhancementOptions.includeExamples}
                                onCheckedChange={(checked) =>
                                  setEnhancementOptions({ ...enhancementOptions, includeExamples: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="include-quiz" className="text-sm">
                                Include Quiz Questions
                              </Label>
                              <Switch
                                id="include-quiz"
                                checked={enhancementOptions.includeQuiz}
                                onCheckedChange={(checked) =>
                                  setEnhancementOptions({ ...enhancementOptions, includeQuiz: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="include-images" className="text-sm">
                                Suggest Images
                              </Label>
                              <Switch
                                id="include-images"
                                checked={enhancementOptions.includeImages}
                                onCheckedChange={(checked) =>
                                  setEnhancementOptions({ ...enhancementOptions, includeImages: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="optimize-seo" className="text-sm">
                                Optimize for SEO
                              </Label>
                              <Switch
                                id="optimize-seo"
                                checked={enhancementOptions.optimizeForSEO}
                                onCheckedChange={(checked) =>
                                  setEnhancementOptions({ ...enhancementOptions, optimizeForSEO: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="adapt-learning" className="text-sm">
                                Adapt to Learning Styles
                              </Label>
                              <Switch
                                id="adapt-learning"
                                checked={enhancementOptions.adaptToLearningStyle}
                                onCheckedChange={(checked) =>
                                  setEnhancementOptions({ ...enhancementOptions, adaptToLearningStyle: checked })
                                }
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Middle and right columns - Generation interface and preview */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-[300px] w-full" />
              </motion.div>
            ) : showHistory ? (
              <motion.div key="history" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Generation History</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowHistory(false)}>
                    Back to Generator
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {generationHistory.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="overflow-hidden">
                            <div
                              className="p-4 cursor-pointer"
                              onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-primary/10">
                                    {item.type === "Lesson Plan" ? (
                                      <BookOpen className="h-4 w-4 text-primary" />
                                    ) : item.type === "Daily Challenge" ? (
                                      <Award className="h-4 w-4 text-amber-500" />
                                    ) : item.type === "Conversation Starter" ? (
                                      <MessageSquare className="h-4 w-4 text-blue-500" />
                                    ) : item.type === "Grammar Explanation" ? (
                                      <FileText className="h-4 w-4 text-purple-500" />
                                    ) : (
                                      <Video className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Badge variant="outline">{item.type}</Badge>
                                      <span>{formatDate(item.date)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  {expandedHistory === item.id ? (
                                    <ChevronDown className="h-5 w-5" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedHistory === item.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="px-4 pb-4 border-t pt-3">
                                    <div className="mb-3">
                                      <h4 className="text-sm font-medium mb-1">Prompt</h4>
                                      <p className="text-sm text-muted-foreground">{item.prompt}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="outline">
                                        <Copy className="h-3.5 w-3.5 mr-1" />
                                        Copy
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                        Regenerate
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="generator"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Text</span>
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Image</span>
                      </TabsTrigger>
                      <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        <span className="hidden sm:inline">Advanced</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Text Generation</CardTitle>
                          <CardDescription>
                            Generate educational content for your English learning platform
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="prompt">Prompt Template</Label>
                            <Textarea
                              id="prompt"
                              placeholder="Enter your prompt or select a template..."
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              rows={4}
                              className="resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="topic">Topic</Label>
                              <Input
                                id="topic"
                                placeholder="e.g., Phrasal Verbs, Business English"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="level">Level</Label>
                              <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger id="level">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="proficient">Proficient</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="grammar-point">Grammar Point</Label>
                              <Input
                                id="grammar-point"
                                placeholder="e.g., Present Perfect, Conditionals"
                                value={grammarPoint}
                                onChange={(e) => setGrammarPoint(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="difficulty">Difficulty</Label>
                              <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger id="difficulty">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                  <SelectItem value="challenging">Challenging</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" onClick={() => setCustomPrompt("")}>
                            Clear
                          </Button>
                          <Button
                            onClick={generateContent}
                            disabled={isGenerating || !customPrompt.trim()}
                            className="gap-2"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-4 w-4" />
                                Generate Content
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>

                      <AnimatePresence>
                        {generatedContent && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle>Generated Content</CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                      {copied ? (
                                        <>
                                          <Check className="h-4 w-4 mr-2" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copy
                                        </>
                                      )}
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <Save className="h-4 w-4 mr-2" />
                                          Save
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem>Save as Draft</DropdownMenuItem>
                                        <DropdownMenuItem>Save as Template</DropdownMenuItem>
                                        <DropdownMenuItem>Save as Challenge</DropdownMenuItem>
                                        <DropdownMenuItem>Save as Lesson</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="relative min-h-[300px] max-h-[500px] overflow-auto p-4 rounded-md bg-muted/50 font-mono text-sm whitespace-pre-wrap">
                                  {generatedContent}
                                  {isGenerating && (
                                    <div className="absolute bottom-4 right-4 h-5 w-2.5 bg-primary animate-pulse rounded-sm"></div>
                                  )}
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <Button variant="outline" size="sm">
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Regenerate
                                </Button>
                                <Button size="sm">
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Enhance
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Image Generation</CardTitle>
                          <CardDescription>Generate images for your educational content</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
                          <div className="flex flex-col items-center text-center max-w-md">
                            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-medium mb-2">Image Generation</h3>
                            <p className="text-muted-foreground mb-6">
                              Create custom illustrations, diagrams, and educational visuals for your content.
                            </p>
                            <Button disabled className="gap-2">
                              <Sparkles className="h-4 w-4" />
                              Coming Soon
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Advanced Generation</CardTitle>
                          <CardDescription>Advanced AI tools for specialized content creation</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <Card className="bg-muted/50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Lightbulb className="h-5 w-5 text-amber-500" />
                                  Concept Explainer
                                </CardTitle>
                                <CardDescription>Break down complex concepts into simple explanations</CardDescription>
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button variant="outline" size="sm" disabled className="w-full">
                                  Coming Soon
                                </Button>
                              </CardFooter>
                            </Card>

                            <Card className="bg-muted/50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Zap className="h-5 w-5 text-purple-500" />
                                  Quiz Generator
                                </CardTitle>
                                <CardDescription>Create quizzes with automatic answer validation</CardDescription>
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button variant="outline" size="sm" disabled className="w-full">
                                  Coming Soon
                                </Button>
                              </CardFooter>
                            </Card>

                            <Card className="bg-muted/50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Layers className="h-5 w-5 text-blue-500" />
                                  Curriculum Builder
                                </CardTitle>
                                <CardDescription>Design complete learning paths and curricula</CardDescription>
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button variant="outline" size="sm" disabled className="w-full">
                                  Coming Soon
                                </Button>
                              </CardFooter>
                            </Card>

                            <Card className="bg-muted/50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <MessageSquare className="h-5 w-5 text-green-500" />
                                  Dialogue Creator
                                </CardTitle>
                                <CardDescription>Generate natural dialogues for language practice</CardDescription>
                              </CardHeader>
                              <CardFooter className="pt-2">
                                <Button variant="outline" size="sm" disabled className="w-full">
                                  Coming Soon
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
