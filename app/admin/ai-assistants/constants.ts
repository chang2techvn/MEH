import type { Assistant } from "./types"

export const modelOptions = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "claude-3", label: "Claude 3" },
  { value: "llama-3", label: "Llama 3" },
]

export const categoryOptions = [
  { value: "education", label: "Education" },
  { value: "practice", label: "Practice" },
  { value: "assessment", label: "Assessment" },
  { value: "utility", label: "Utility" },
]

export const capabilityOptions = [
  { value: "grammar", label: "Grammar" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "pronunciation", label: "Pronunciation" },
  { value: "speaking", label: "Speaking" },
  { value: "writing", label: "Writing" },
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
  { value: "conversation", label: "Conversation" },
  { value: "test-prep", label: "Test Preparation" },
  { value: "feedback", label: "Feedback" },
  { value: "roleplay", label: "Role Play" },
  { value: "strategies", label: "Learning Strategies" },
  { value: "style", label: "Writing Style" },
]

export const sampleAssistants: Assistant[] = [
  {
    id: "assistant1",
    name: "English Tutor",
    description: "Helps with grammar, vocabulary, and language learning",
    avatar: "/placeholder.svg?height=80&width=80",
    model: "GPT-4o",
    isActive: true,
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2023, 9, 10),
    systemPrompt:
      "You are an English language tutor. Help users improve their English skills through conversation, grammar correction, and vocabulary building.",
    capabilities: ["grammar", "vocabulary", "conversation"],
    category: "education",
    usage: {
      conversations: 1250,
      messages: 15780,
      tokensConsumed: 3200000,
    },
  },
  {
    id: "assistant2",
    name: "Pronunciation Coach",
    description: "Provides feedback on pronunciation and speaking",
    avatar: "/placeholder.svg?height=80&width=80",
    model: "Gemini Pro",
    isActive: true,
    createdAt: new Date(2023, 6, 20),
    updatedAt: new Date(2023, 8, 5),
    systemPrompt:
      "You are a pronunciation coach. Help users improve their English pronunciation by providing feedback, tips, and exercises.",
    capabilities: ["pronunciation", "speaking", "feedback"],
    category: "education",
    usage: {
      conversations: 890,
      messages: 10250,
      tokensConsumed: 1800000,
    },
  },
  {
    id: "assistant3",
    name: "Writing Assistant",
    description: "Helps with essay writing and composition",
    avatar: "/placeholder.svg?height=80&width=80",
    model: "Claude 3",
    isActive: false,
    createdAt: new Date(2023, 7, 10),
    updatedAt: new Date(2023, 7, 10),
    systemPrompt:
      "You are a writing assistant. Help users improve their writing skills by providing feedback on essays, compositions, and other written work.",
    capabilities: ["writing", "grammar", "style"],
    category: "education",
    usage: {
      conversations: 520,
      messages: 6800,
      tokensConsumed: 950000,
    },
  },
  {
    id: "assistant4",
    name: "Conversation Partner",
    description: "Practice everyday conversations in English",
    avatar: "/placeholder.svg?height=80&width=80",
    model: "GPT-3.5 Turbo",
    isActive: true,
    createdAt: new Date(2023, 8, 5),
    updatedAt: new Date(2023, 10, 15),
    systemPrompt:
      "You are a conversation partner. Engage users in natural English conversations on various topics to help them practice their speaking and listening skills.",
    capabilities: ["conversation", "roleplay", "vocabulary"],
    category: "practice",
    usage: {
      conversations: 1750,
      messages: 21500,
      tokensConsumed: 2800000,
    },
  },
  {
    id: "assistant5",
    name: "Test Preparation",
    description: "Helps prepare for IELTS, TOEFL, and other exams",
    avatar: "/placeholder.svg?height=80&width=80",
    model: "GPT-4o",
    isActive: true,
    createdAt: new Date(2023, 9, 1),
    updatedAt: new Date(2023, 11, 20),
    systemPrompt:
      "You are a test preparation assistant. Help users prepare for English proficiency exams like IELTS, TOEFL, and Cambridge exams with practice questions, tips, and strategies.",
    capabilities: ["test-prep", "practice-questions", "strategies"],
    category: "education",
    usage: {
      conversations: 980,
      messages: 12500,
      tokensConsumed: 2100000,
    },
  },
]
