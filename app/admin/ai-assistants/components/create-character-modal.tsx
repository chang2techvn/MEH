"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Upload, 
  Sparkles, 
  Loader2, 
  User, 
  MapPin, 
  Briefcase, 
  FileText,
  RefreshCw,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import createAssistantPrompt from "@/lib/prompt/create-assistant"
import { analyzeCharacterWithAI } from "@/lib/ai-utils"
import type { AssistantFormData } from "../types"
import { categoryOptions } from "../constants"

interface CharacterData {
  name: string
  description: string
  avatar?: string
  origin?: string
  occupation?: string
}

interface AIAnalysisResult {
  // Basic info for database
  name: string
  description: string
  category: 'education' | 'practice' | 'assessment' | 'utility' | 'business' | 'entertainment' | 'politics' | 'literature' | 'technology' | 'science' | 'arts' | 'sports' | 'lifestyle' | 'culture'
  field: string
  role: string
  experience: string
  capabilities: string[]
  personalityTraits: string[]
  tags: string[]
  responseThreshold: number
  
  // Detailed analysis from the full prompt
  detailedAnalysis: {
    personalInfo: {
      fullName: string
      nickname: string
      age: string
      gender: string
      nationality: string
      appearance: string
      voice: string
    }
    personality: {
      traits: string[]
      philosophy: string
      thinkingStyle: string
      habits: string[]
      fears: string[]
      reactions: string
      emotionExpression: string
    }
    background: {
      family: string
      profession: string
      milestones: string
      socialStatus: string
      relationships: string
    }
    goals: {
      lifeGoals: string
      shortTermGoals: string
      triggers: string
      innerConflicts: string
      lovesHates: string
    }
    behavior: {
      betrayalResponse: string
      successResponse: string
      socialInteraction: string
      onlinePresence: string
      dailyRoutine: string
    }
    language: {
      writingStyle: string
      vocabulary: string
      sampleText: string
      emojiUsage: string
      avoidedWords: string
    }
    archetype: {
      role: string
      archetype: string
      comparison: string
      memorableTraits: string
    }
  }
}

interface CreateCharacterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateCharacterModal({ open, onOpenChange, onSuccess }: CreateCharacterModalProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [step, setStep] = useState<'input' | 'analysis' | 'review'>('input')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [creating, setCreating] = useState(false)
  
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    description: '',
    avatar: '',
    origin: '',
    occupation: ''
  })
  
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [editablePrompt, setEditablePrompt] = useState('')
  
  // Final assistant data
  const [assistantData, setAssistantData] = useState<Partial<AssistantFormData>>({
    isActive: true,
    model: 'gemini-2.5-flash',
    responseThreshold: 0.7
  })

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('ai-assistant-avatars')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ai-assistant-avatars')
        .getPublicUrl(fileName)

      setCharacterData(prev => ({ ...prev, avatar: publicUrl }))
      
      toast({
        title: "Avatar uploaded successfully",
        description: "Image has been uploaded and ready to use"
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar image",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const validateImageUrl = (url: string): boolean => {
    if (!url) return true // Empty URL is valid
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    } catch {
      return false
    }
  }

  const analyzeCharacter = async () => {
    if (!characterData.name.trim() || !characterData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide character name and description",
        variant: "destructive"
      })
      return
    }

    try {
      setAnalyzing(true)
      
      // Create the prompt with character data using the full original template
      const fullPrompt = createAssistantPrompt.replace(
        '[Tên nhân vật]',
        characterData.name
      ) + `

Thông tin nhân vật cần phân tích:
- Tên: ${characterData.name}
- Mô tả: ${characterData.description}
${characterData.origin ? `- Xuất xứ: ${characterData.origin}` : ''}
${characterData.occupation ? `- Nghề nghiệp: ${characterData.occupation}` : ''}

Sau khi hoàn thành phân tích chi tiết theo 7 phần trên, hãy trả về kết quả theo định dạng JSON với cấu trúc sau để lưu vào database:

{
  "name": "${characterData.name}",
  "description": "Mô tả ngắn gọn về nhân vật này (100-150 từ)",
  "category": "entertainment|education|literature|arts|business|science|politics|technology|sports|lifestyle|culture|utility|practice|assessment",
  "field": "General|English|Business English|Academic English|Conversational English|Technical English|Literature|Arts|Entertainment|Science|Business|Politics|Technology|Sports|Lifestyle|Culture",
  "role": "Assistant|Teacher|Tutor|Coach|Mentor|Character|Expert|Guide|Advisor|Friend",
  "experience": "Professional|Expert|Master|Advanced|Intermediate|Specialist|Legendary",
  "capabilities": ["conversation", "roleplay", "storytelling", "education", "entertainment", "advice", "analysis", "creative_writing", "problem_solving"],
  "personalityTraits": ["trait1", "trait2", "trait3", "trait4", "trait5", "trait6", "trait7"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7"],
  "responseThreshold": 0.7,
  "detailedAnalysis": {
    "personalInfo": {
      "fullName": "...",
      "nickname": "...",
      "age": "...",
      "gender": "...",
      "nationality": "...",
      "appearance": "...",
      "voice": "..."
    },
    "personality": {
      "traits": ["trait1", "trait2", "..."],
      "philosophy": "...",
      "thinkingStyle": "...",
      "habits": ["habit1", "habit2", "..."],
      "fears": ["fear1", "fear2", "..."],
      "reactions": "...",
      "emotionExpression": "..."
    },
    "background": {
      "family": "...",
      "profession": "...",
      "milestones": "...",
      "socialStatus": "...",
      "relationships": "..."
    },
    "goals": {
      "lifeGoals": "...",
      "shortTermGoals": "...",
      "triggers": "...",
      "innerConflicts": "...",
      "lovesHates": "..."
    },
    "behavior": {
      "betrayalResponse": "...",
      "successResponse": "...",
      "socialInteraction": "...",
      "onlinePresence": "...",
      "dailyRoutine": "..."
    },
    "language": {
      "writingStyle": "...",
      "vocabulary": "...",
      "sampleText": "...",
      "emojiUsage": "...",
      "avoidedWords": "..."
    },
    "archetype": {
      "role": "...",
      "archetype": "...",
      "comparison": "...",
      "memorableTraits": "..."
    }
  }
}

Quan trọng: 
- Phân tích phải chi tiết và sâu sắc như ví dụ về Sơn Tùng M-TP
- category: Chọn category phù hợp nhất từ 14 lựa chọn
- capabilities: Liệt kê 5-9 khả năng mà nhân vật này có thể thực hiện tốt
- personalityTraits: 7 đặc điểm tính cách chính và nổi bật nhất
- tags: 7 từ khóa đặc trưng và dễ tìm kiếm cho nhân vật
- detailedAnalysis: Phải đầy đủ và chi tiết cho việc tạo AI persona
- Chỉ trả về JSON, không thêm text khác.`

      const result = await analyzeCharacterWithAI(fullPrompt)
      
      // Try to parse JSON from the result
      let parsedResult: AIAnalysisResult
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No valid JSON found in response')
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError)
        toast({
          title: "Analysis error",
          description: "Failed to parse AI analysis. Please try again.",
          variant: "destructive"
        })
        return
      }

      setAiAnalysis(parsedResult)
      
      // Generate system prompt from analysis
      const systemPrompt = generateSystemPrompt(parsedResult)
      setEditablePrompt(systemPrompt)
      
      // Update assistant data with all fields from AI analysis
      setAssistantData(prev => ({
        ...prev,
        name: parsedResult.name,
        description: parsedResult.description,
        avatar: characterData.avatar,
        systemPrompt: systemPrompt,
        category: parsedResult.category,
        field: parsedResult.field,
        role: parsedResult.role,
        experience: parsedResult.experience,
        capabilities: parsedResult.capabilities,
        personalityTraits: parsedResult.personalityTraits,
        tags: parsedResult.tags,
        responseThreshold: parsedResult.responseThreshold
      }))
      
      setStep('review')
      
    } catch (error) {
      console.error('Error analyzing character:', error)
      toast({
        title: "Analysis failed",
        description: "Failed to analyze character. Please try again.",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const generateSystemPrompt = (analysis: AIAnalysisResult): string => {
    const detailed = analysis.detailedAnalysis
    return `You are ${detailed.personalInfo.fullName}, ${detailed.personalInfo.nickname ? `also known as ${detailed.personalInfo.nickname}, ` : ''}a ${detailed.personalInfo.age} ${detailed.personalInfo.gender} from ${detailed.personalInfo.nationality}.

APPEARANCE & VOICE:
${detailed.personalInfo.appearance}
Voice: ${detailed.personalInfo.voice}

PERSONALITY & TRAITS:
${detailed.personality.traits.map(trait => `- ${trait}`).join('\n')}

PHILOSOPHY & VALUES:
${detailed.personality.philosophy}

THINKING STYLE:
${detailed.personality.thinkingStyle}

HABITS & DAILY ROUTINE:
${detailed.personality.habits.map(habit => `- ${habit}`).join('\n')}
Daily routine: ${detailed.behavior.dailyRoutine}

BACKGROUND:
Family & Upbringing: ${detailed.background.family}
Profession: ${detailed.background.profession}
Key milestones: ${detailed.background.milestones}
Social status: ${detailed.background.socialStatus}
Relationships: ${detailed.background.relationships}

GOALS & MOTIVATIONS:
Life Goals: ${detailed.goals.lifeGoals}
Short-term Goals: ${detailed.goals.shortTermGoals}
Triggers: ${detailed.goals.triggers}
Inner Conflicts: ${detailed.goals.innerConflicts}
Loves/Hates: ${detailed.goals.lovesHates}

COMMUNICATION STYLE:
Writing Style: ${detailed.language.writingStyle}
Vocabulary: ${detailed.language.vocabulary}
Emoji Usage: ${detailed.language.emojiUsage}
Words to Avoid: ${detailed.language.avoidedWords}

BEHAVIOR PATTERNS:
- When betrayed/hurt: ${detailed.behavior.betrayalResponse}
- When successful: ${detailed.behavior.successResponse}
- Social interactions: ${detailed.behavior.socialInteraction}
- Online presence: ${detailed.behavior.onlinePresence}
- Emotional expression: ${detailed.personality.emotionExpression}

FEARS & WEAKNESSES:
${detailed.personality.fears.map(fear => `- ${fear}`).join('\n')}

ROLE & ARCHETYPE:
${detailed.archetype.role} - ${detailed.archetype.archetype}
${detailed.archetype.comparison}

MEMORABLE TRAITS:
${detailed.archetype.memorableTraits}

SAMPLE COMMUNICATION:
${detailed.language.sampleText}

INSTRUCTIONS:
1. Always stay in character as ${detailed.personalInfo.fullName}
2. Use the specified communication style and vocabulary: ${detailed.language.writingStyle}
3. Respond with the personality traits and thinking patterns described above
4. Reference your background and experiences when relevant
5. Show emotions as described: ${detailed.personality.emotionExpression}
6. React to situations based on your established behavior patterns
7. Avoid using: ${detailed.language.avoidedWords}
8. Use emojis as specified: ${detailed.language.emojiUsage}

Remember: You ARE this character. Think, speak, and react as they would in every interaction. Your responses should feel authentic to their personality, background, and way of expressing themselves.`
  }

  const createAssistant = async () => {
    console.log('createAssistant called')
    console.log('assistantData:', assistantData)
    console.log('editablePrompt length:', editablePrompt.length)
    
    if (!assistantData.name || !editablePrompt) {
      toast({
        title: "Missing data",
        description: "Please ensure all required fields are filled",
        variant: "destructive"
      })
      return
    }

    try {
      setCreating(true)
      console.log('Getting user...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('User auth error:', userError)
        throw userError
      }
      if (!user) throw new Error('User not authenticated')
      
      console.log('User authenticated:', user.id)
      console.log('Inserting assistant data...')

      const insertData = {
        name: assistantData.name,
        description: assistantData.description || characterData.description,
        avatar: assistantData.avatar,
        model: assistantData.model || 'gemini-2.5-flash',
        system_prompt: editablePrompt,
        capabilities: assistantData.capabilities || [],
        category: assistantData.category,
        is_active: assistantData.isActive,
        created_by: user.id,
        personality_traits: assistantData.personalityTraits || [],
        response_threshold: assistantData.responseThreshold || 0.7,
        field: assistantData.field,
        role: assistantData.role,
        experience: assistantData.experience,
        tags: assistantData.tags || []
      }
      
      console.log('Insert data:', insertData)

      const { data, error } = await supabase
        .from('ai_assistants')
        .insert(insertData)

      if (error) {
        console.error('Database insertion error:', error)
        throw error
      }

      console.log('Assistant created successfully:', data)

      toast({
        title: "Assistant created successfully",
        description: `${assistantData.name} has been created and is ready to use`
      })

      onSuccess()
      handleClose()
      
    } catch (error) {
      console.error('Error creating assistant:', error)
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create AI assistant",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setStep('input')
    setCharacterData({
      name: '',
      description: '',
      avatar: '',
      origin: '',
      occupation: ''
    })
    setAiAnalysis(null)
    setEditablePrompt('')
    setAssistantData({
      category: 'entertainment',
      isActive: true,
      model: 'gemini-2.5-flash',
      field: 'General',
      role: 'Character',
      experience: 'Professional',
      responseThreshold: 0.7
    })
    onOpenChange(false)
  }

  const renderInputStep = () => (
    <div className="space-y-3 sm:space-y-4">
      {/* Simplified Avatar Upload - Compact mobile version */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-center">
          <Avatar 
            className="h-12 w-12 sm:h-16 sm:w-16 cursor-pointer border-2 border-orange-200 hover:border-orange-400 transition-colors mx-auto shadow-lg" 
            onClick={() => fileInputRef.current?.click()}
          >
            <AvatarImage src={characterData.avatar} alt={characterData.name} />
            <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs sm:text-sm hover:from-neo-mint/80 hover:to-purist-blue/80 transition-colors">
              {characterData.name ? characterData.name.substring(0, 2).toUpperCase() : <Upload className="h-3 w-3 sm:h-4 sm:w-4" />}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs text-gray-500 mt-1">Click to upload</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />

        {/* Image URL Input - Compact */}
        <div className="w-full space-y-1">
          <label className="text-xs font-medium text-gray-700 flex items-center">
            <i className="fas fa-link mr-1 text-orange-500 text-xs"></i>
            Image URL
          </label>
          <Input
            placeholder="https://example.com/avatar.jpg"
            value={characterData.avatar}
            onChange={(e) => setCharacterData(prev => ({ ...prev, avatar: e.target.value }))}
            className={`h-8 sm:h-9 text-xs placeholder:text-xs border-gray-300 transition-all duration-200 ${
              characterData.avatar && !validateImageUrl(characterData.avatar) 
                ? 'border-red-500 bg-red-50' 
                : ''
            }`}
          />
          {characterData.avatar && !validateImageUrl(characterData.avatar) && (
            <p className="text-red-500 text-xs animate-in fade-in duration-200 flex items-center">
              <i className="fas fa-exclamation-circle mr-1 text-xs"></i>
              Invalid image URL
            </p>
          )}
        </div>
      </div>

      {/* Character Info - Compact */}
      <div className="space-y-3">
        {/* Character Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 flex items-center">
            <i className="fas fa-user mr-1 text-orange-500 text-xs"></i>
            Character name *
          </label>
          <Input
            placeholder="e.g., Sherlock Holmes"
            value={characterData.name}
            onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
            className="h-8 sm:h-9 text-xs placeholder:text-xs border-gray-300 transition-all duration-200"
          />
        </div>

        {/* Origin and Occupation - Mobile stacked */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <i className="fas fa-map-marker-alt mr-1 text-orange-500 text-xs"></i>
              Origin
            </label>
            <Input
              placeholder="e.g., London"
              value={characterData.origin}
              onChange={(e) => setCharacterData(prev => ({ ...prev, origin: e.target.value }))}
              className="h-8 sm:h-9 text-xs placeholder:text-xs border-gray-300 transition-all duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <i className="fas fa-briefcase mr-1 text-orange-500 text-xs"></i>
              Role
            </label>
            <Input
              placeholder="e.g., Detective"
              value={characterData.occupation}
              onChange={(e) => setCharacterData(prev => ({ ...prev, occupation: e.target.value }))}
              className="h-8 sm:h-9 text-xs placeholder:text-xs border-gray-300 transition-all duration-200"
            />
          </div>
        </div>

        {/* Character Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 flex items-center">
            <i className="fas fa-file-text mr-1 text-orange-500 text-xs"></i>
            Description *
          </label>
          <Textarea
            placeholder="Describe the character's background, personality..."
            value={characterData.description}
            onChange={(e) => setCharacterData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="text-xs placeholder:text-xs border-gray-300 transition-all duration-200 resize-none"
          />
        </div>
      </div>
    </div>
  )

  const renderAnalysisStep = () => (
    <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-6 sm:py-8">
      <div className="relative">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-neo-mint/10 to-purist-blue/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 rounded-full animate-ping"></div>
      </div>
      <div className="text-center space-y-1 sm:space-y-2">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Analyzing Character</h3>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xs sm:max-w-md">
          AI is studying <span className="font-medium text-orange-600">{characterData.name}</span> and creating a personality profile...
        </p>
        <div className="text-xs text-gray-500 pt-1">
          This may take 30-60 seconds
        </div>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Character Header - Goal Modal inspired design */}
      <div className="bg-gradient-to-r from-neo-mint/5 to-purist-blue/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-200">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 sm:border-3 border-orange-300 shadow-lg">
            <AvatarImage src={characterData.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-neo-mint to-purist-blue text-white text-sm sm:text-lg font-bold">
              {characterData.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 truncate">
              {aiAnalysis?.detailedAnalysis.personalInfo.fullName}
            </h3>
            {aiAnalysis?.detailedAnalysis.personalInfo.nickname && (
              <p className="text-orange-600 font-medium mb-2 text-sm sm:text-base truncate">
                "{aiAnalysis.detailedAnalysis.personalInfo.nickname}"
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              <span className="flex items-center">
                <i className="fas fa-birthday-cake mr-1 text-orange-500"></i>
                {aiAnalysis?.detailedAnalysis.personalInfo.age}
              </span>
              <span className="flex items-center">
                <i className="fas fa-user mr-1 text-orange-500"></i>
                {aiAnalysis?.detailedAnalysis.personalInfo.gender}
              </span>
              <span className="flex items-center">
                <i className="fas fa-globe mr-1 text-orange-500"></i>
                {aiAnalysis?.detailedAnalysis.personalInfo.nationality}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {aiAnalysis?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="text-xs">📊 Overview</TabsTrigger>
          <TabsTrigger value="personality" className="text-xs">🧠 Psychology</TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs">⚡ Behavior</TabsTrigger>
          <TabsTrigger value="language" className="text-xs">💬 Language</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <span>📋</span> Basic Information
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Category:</span> 
                  <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-700">
                    {categoryOptions.find(opt => opt.value === aiAnalysis?.category)?.label || aiAnalysis?.category}
                  </span>
                </div>
                <div><span className="font-medium">Field:</span> <span className="text-gray-700">{aiAnalysis?.field}</span></div>
                <div><span className="font-medium">Role:</span> <span className="text-gray-700">{aiAnalysis?.role}</span></div>
                <div><span className="font-medium">Experience:</span> <span className="text-gray-700">{aiAnalysis?.experience}</span></div>
              </div>
            </div>

            {/* Archetype */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <span>🎭</span> Archetype & Role
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Role:</span> <span className="text-gray-700">{aiAnalysis?.detailedAnalysis.archetype.role}</span></div>
                <div><span className="font-medium">Archetype:</span> <span className="text-gray-700">{aiAnalysis?.detailedAnalysis.archetype.archetype}</span></div>
                <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                  {aiAnalysis?.detailedAnalysis.archetype.memorableTraits}
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities & Traits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span>⚡</span> Capabilities
              </h4>
              <div className="flex flex-wrap gap-1">
                {aiAnalysis?.capabilities.map((capability, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <span>🎯</span> Personality Traits
              </h4>
              <div className="flex flex-wrap gap-1">
                {aiAnalysis?.personalityTraits.map((trait, index) => (
                  <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🏷️</span> Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis?.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="personality" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Philosophy */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                <span>🎭</span> Philosophy & Values
              </h4>
              <p className="text-sm text-gray-700 italic">"{aiAnalysis?.detailedAnalysis.personality.philosophy}"</p>
            </div>

            {/* Thinking Style */}
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
              <h4 className="font-semibold text-cyan-800 mb-2 flex items-center gap-2">
                <span>🧠</span> Thinking Style
              </h4>
              <p className="text-sm text-gray-700">{aiAnalysis?.detailedAnalysis.personality.thinkingStyle}</p>
            </div>

            {/* Habits & Fears */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                  <span>🔄</span> Habits
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {aiAnalysis?.detailedAnalysis.personality.habits.map((habit, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-emerald-500">•</span>
                      {habit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <span>😰</span> Fears & Weaknesses
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {aiAnalysis?.detailedAnalysis.personality.fears.map((fear, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-red-500">•</span>
                      {fear}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Reactions */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <span>⚡</span> Behavioral Reactions
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-800">When betrayed/hurt:</div>
                  <p className="text-gray-600 mt-1">{aiAnalysis?.detailedAnalysis.behavior.betrayalResponse}</p>
                </div>
                <div>
                  <div className="font-medium text-gray-800">When successful:</div>
                  <p className="text-gray-600 mt-1">{aiAnalysis?.detailedAnalysis.behavior.successResponse}</p>
                </div>
              </div>
            </div>

            {/* Social & Goals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <h4 className="font-semibold text-pink-800 mb-2 flex items-center gap-2">
                  <span>👥</span> Social Interaction
                </h4>
                <p className="text-sm text-gray-700">{aiAnalysis?.detailedAnalysis.behavior.socialInteraction}</p>
              </div>

              <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                <h4 className="font-semibold text-violet-800 mb-2 flex items-center gap-2">
                  <span>🎯</span> Life Goals
                </h4>
                <p className="text-sm text-gray-700">{aiAnalysis?.detailedAnalysis.goals.lifeGoals}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Writing Style */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
              <h4 className="font-semibold text-teal-800 mb-2 flex items-center gap-2">
                <span>✍️</span> Writing Style
              </h4>
              <p className="text-sm text-gray-700">{aiAnalysis?.detailedAnalysis.language.writingStyle}</p>
            </div>

            {/* Sample Text */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span>📝</span> Sample Communication
              </h4>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm italic text-gray-700">
                "{aiAnalysis?.detailedAnalysis.language.sampleText}"
              </div>
            </div>

            {/* Language Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-lime-50 rounded-xl p-4 border border-lime-100">
                <h4 className="font-semibold text-lime-800 mb-2 flex items-center gap-2">
                  <span>😊</span> Emoji Usage
                </h4>
                <p className="text-sm text-gray-700">{aiAnalysis?.detailedAnalysis.language.emojiUsage}</p>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <h4 className="font-semibold text-rose-800 mb-2 flex items-center gap-2">
                  <span>🚫</span> Avoided Words
                </h4>
                <p className="text-sm text-gray-700">{aiAnalysis?.detailedAnalysis.language.avoidedWords}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assistant Settings */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-orange-500">⚙️</span>
          Assistant Settings
        </h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="active" className="text-gray-700 font-medium">Active Status</Label>
          <Switch
            id="active"
            checked={assistantData.isActive}
            onCheckedChange={(checked) => setAssistantData(prev => ({ ...prev, isActive: checked }))}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </div>

      {/* System Prompt Preview */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-blue-500">💬</span>
          System Prompt Preview
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          You can review and edit the AI-generated system prompt before creating the assistant
        </p>
        <Textarea
          value={editablePrompt}
          onChange={(e) => setEditablePrompt(e.target.value)}
          rows={8}
          className="font-mono text-xs border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg bg-white"
        />
      </div>
    </div>
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xs sm:max-w-lg transform transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 bg-white text-gray-900 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[80vh] sm:max-h-[85vh] flex flex-col">
        
        {/* Header - Following Goal Modal pattern */}
        <div className="px-2 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-neo-mint/5 to-purist-blue/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-r from-neo-mint to-purist-blue flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="text-white text-xs sm:text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs sm:text-lg font-semibold bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent truncate">
                  Create AI Character
                </h2>
                <p className="text-xs sm:text-sm mt-0 sm:mt-0.5 text-gray-600 truncate hidden sm:block">
                  {step === 'input' && "Set character info and analyze"}
                  {step === 'analysis' && "AI analyzing personality"}
                  {step === 'review' && "Review before creating"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6 sm:h-8 sm:w-8 rounded-md transition-all duration-200 flex-shrink-0 hover:bg-neo-mint/10 text-gray-500 hover:text-neo-mint"
            >
              <X className="text-xs sm:text-sm" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {step === 'input' && renderInputStep()}
          {step === 'analysis' && renderAnalysisStep()}
          {step === 'review' && renderReviewStep()}
        </div>

        {/* Footer Actions - Following Goal Modal pattern */}
        <div className="pt-2 sm:pt-4 border-t border-orange-200 flex flex-col sm:flex-row gap-2 p-2 sm:p-4 flex-shrink-0">
          {step === 'input' && (
            <>
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm border-orange-200 hover:bg-orange-100 text-gray-700 transition-all duration-200"
                disabled={analyzing}
              >
                <X className="mr-1 sm:mr-1.5 text-xs" />
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setStep('analysis')
                  analyzeCharacter()
                }}
                disabled={!characterData.name.trim() || !characterData.description.trim() || analyzing}
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin text-xs" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 sm:mr-1.5 text-xs" />
                    Analyze
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep('input')}
                className="h-8 sm:h-9 text-xs sm:text-sm border-orange-200 hover:bg-orange-100 text-gray-700 transition-all duration-200"
                disabled={creating}
              >
                ← Back
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setStep('analysis')
                  analyzeCharacter()
                }}
                disabled={analyzing || creating}
                className="h-8 sm:h-9 text-xs sm:text-sm border-orange-200 hover:bg-orange-100 text-orange-600 transition-all duration-200"
              >
                <RefreshCw className="mr-1 text-xs" />
                Re-analyze
              </Button>
              <Button 
                onClick={createAssistant}
                disabled={creating}
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin text-xs" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 sm:mr-1.5 text-xs" />
                    Create
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
