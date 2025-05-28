import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  // Clear existing data (optional - be careful in production)
  await prisma.adminLog.deleteMany()
  await prisma.flaggedContent.deleteMany()
  await prisma.evaluationLog.deleteMany()
  await prisma.challengeSubmission.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversationParticipant.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.user.deleteMany()
  await prisma.user.deleteMany()
  await prisma.aIModel.deleteMany()
  await prisma.aPIKey.deleteMany()
  await prisma.bannedTerm.deleteMany()
  await prisma.aISafetyRule.deleteMany()
  await prisma.scoringTemplate.deleteMany()

  // 1. Create AI Models
  console.log('Creating AI models...')
  const aiModels = await Promise.all([
    prisma.aIModel.create({
      data: {
        name: 'GPT-4o',
        provider: 'OpenAI',
        modelId: 'gpt-4o',
        version: '2024-05-13',
        description: 'Advanced language model for comprehensive English evaluation',
        capabilities: ['text-generation', 'analysis', 'evaluation', 'conversation'],
        maxTokens: 128000,
        costPerToken: 0.000005,
        configuration: {
          temperature: 0.7,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      }
    }),
    prisma.aIModel.create({
      data: {
        name: 'Claude-3 Sonnet',
        provider: 'Anthropic',
        modelId: 'claude-3-sonnet-20240229',
        version: '2024-02-29',
        description: 'Balanced AI model for educational content and evaluation',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 200000,
        costPerToken: 0.000003,
        configuration: {
          temperature: 0.5,
          maxTokensToSample: 4096
        }
      }
    }),
    prisma.aIModel.create({
      data: {
        name: 'Gemini Pro',
        provider: 'Google',
        modelId: 'gemini-1.5-pro',
        version: '1.5',
        description: 'Google\'s multimodal AI for diverse English learning tasks',
        capabilities: ['text-generation', 'multimodal', 'analysis'],
        maxTokens: 2000000,
        costPerToken: 0.000001,
        configuration: {
          temperature: 0.6,
          topK: 32,
          topP: 1
        }
      }
    })
  ])

  // 2. Create API Keys
  console.log('Creating API keys...')
  await Promise.all([
    prisma.aPIKey.create({
      data: {
        name: 'OpenAI Production Key',
        provider: 'OpenAI',
        keyHash: 'hashed_openai_key_123',
        rateLimit: 1000,
        expiresAt: new Date('2025-12-31')
      }
    }),
    prisma.aPIKey.create({
      data: {
        name: 'Anthropic Development Key',
        provider: 'Anthropic',
        keyHash: 'hashed_anthropic_key_456',
        rateLimit: 500,
        expiresAt: new Date('2025-12-31')
      }
    }),
    prisma.aPIKey.create({
      data: {
        name: 'Google AI Studio Key',
        provider: 'Google',
        keyHash: 'hashed_google_key_789',
        rateLimit: 1500,
        expiresAt: new Date('2025-12-31')
      }
    })
  ])

  // 3. Create Safety Rules
  console.log('Creating AI safety rules...')
  await Promise.all([
    prisma.aISafetyRule.create({
      data: {
        name: 'Inappropriate Content Filter',
        description: 'Blocks content with inappropriate or offensive language',
        rule: 'Detect and flag content containing profanity, hate speech, or inappropriate sexual content',
        action: 'BLOCK',
        priority: 1
      }
    }),
    prisma.aISafetyRule.create({
      data: {
        name: 'Academic Integrity Check',
        description: 'Identifies potential plagiarism or cheating attempts',
        rule: 'Flag submissions that appear to be copied or generated entirely by AI',
        action: 'FLAG',
        priority: 2
      }
    }),
    prisma.aISafetyRule.create({
      data: {
        name: 'Educational Content Validation',
        description: 'Ensures content is appropriate for educational environment',
        rule: 'Verify that content aligns with educational standards and learning objectives',
        action: 'REVIEW',
        priority: 3
      }
    })
  ])

  // 4. Create Banned Terms
  console.log('Creating banned terms...')
  await Promise.all([
    prisma.bannedTerm.create({
      data: {
        term: 'spam',
        category: 'inappropriate',
        severity: 'MEDIUM',
        description: 'Generic spam content'
      }
    }),
    prisma.bannedTerm.create({
      data: {
        term: 'hate',
        category: 'offensive',
        severity: 'HIGH',
        description: 'Hate speech content'
      }
    }),
    prisma.bannedTerm.create({
      data: {
        term: 'cheat',
        category: 'academic-integrity',
        severity: 'HIGH',
        description: 'Academic dishonesty'
      }
    })
  ])

  // 5. Create Scoring Templates
  console.log('Creating scoring templates...')
  const scoringTemplates = await Promise.all([
    prisma.scoringTemplate.create({
      data: {
        name: 'Grammar Assessment',
        description: 'Standard template for evaluating grammar exercises',
        category: 'GRAMMAR',
        maxScore: 100,
        isDefault: true,
        criteria: {
          accuracy: { weight: 40, description: 'Correctness of grammar usage' },
          complexity: { weight: 30, description: 'Use of complex structures' },
          fluency: { weight: 30, description: 'Natural flow and coherence' }
        }
      }
    }),
    prisma.scoringTemplate.create({
      data: {
        name: 'Speaking Evaluation',
        description: 'Comprehensive speaking assessment criteria',
        category: 'SPEAKING',
        maxScore: 100,
        isDefault: true,
        criteria: {
          pronunciation: { weight: 25, description: 'Clear and accurate pronunciation' },
          fluency: { weight: 25, description: 'Smooth and natural speech flow' },
          vocabulary: { weight: 25, description: 'Appropriate vocabulary usage' },
          grammar: { weight: 25, description: 'Correct grammatical structures' }
        }
      }
    }),
    prisma.scoringTemplate.create({
      data: {
        name: 'Writing Assessment',
        description: 'Standard writing evaluation template',
        category: 'WRITING',
        maxScore: 100,
        isDefault: true,
        criteria: {
          content: { weight: 30, description: 'Relevance and depth of ideas' },
          organization: { weight: 25, description: 'Logical structure and coherence' },
          language: { weight: 25, description: 'Grammar and vocabulary accuracy' },
          mechanics: { weight: 20, description: 'Spelling and punctuation' }
        }
      }
    })
  ])

  // 6. Create Users
  console.log('Creating users...')
  const users = await Promise.all([
    // Admin user
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'admin@englishclub.edu.vn',
        name: 'Admin User',
        role: 'ADMIN',
        studentId: 'ADM001',
        major: 'Computer Science',
        academicYear: '2024',
        bio: 'Platform administrator and English club manager',
        points: 5000,
        level: 10,
        experiencePoints: 15000,
        streakDays: 100,
        avatar: 'https://i.pravatar.cc/200?img=1',
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: 'vi',
          theme: 'light'
        }
      }
    }),
    // Moderator
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'moderator@englishclub.edu.vn',
        name: 'Sarah Wilson',
        role: 'MODERATOR',
        studentId: 'MOD001',
        major: 'English Literature',
        academicYear: '2023',
        bio: 'English tutor and content moderator',
        points: 3500,
        level: 8,
        experiencePoints: 8500,
        streakDays: 45,
        avatar: 'https://i.pravatar.cc/200?img=2',
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: 'en',
          theme: 'light'
        }
      }
    }),
    // Regular members
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'nguyen.van.a@student.edu.vn',
        name: 'Nguyễn Văn A',
        role: 'MEMBER',
        studentId: 'SV001',
        major: 'Business Administration',
        academicYear: '2025',
        bio: 'Passionate about improving English skills for future career',
        points: 1250,
        level: 5,
        experiencePoints: 2500,
        streakDays: 15,
        avatar: 'https://i.pravatar.cc/200?img=3',
        preferences: {
          notifications: true,
          emailUpdates: false,
          language: 'vi',
          theme: 'dark'
        }
      }
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'tran.thi.b@student.edu.vn',
        name: 'Trần Thị B',
        role: 'MEMBER',
        studentId: 'SV002',
        major: 'International Business',
        academicYear: '2024',
        bio: 'Preparing for IELTS exam and international opportunities',
        points: 2100,
        level: 6,
        experiencePoints: 4200,
        streakDays: 28,
        avatar: 'https://i.pravatar.cc/200?img=4',
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: 'vi',
          theme: 'light'
        }
      }
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'le.minh.c@student.edu.vn',
        name: 'Lê Minh C',
        role: 'MEMBER',
        studentId: 'SV003',
        major: 'Information Technology',
        academicYear: '2025',
        bio: 'Tech enthusiast learning English for software development',
        points: 850,
        level: 3,
        experiencePoints: 1200,
        streakDays: 7,
        avatar: 'https://i.pravatar.cc/200?img=5',
        preferences: {
          notifications: false,
          emailUpdates: false,
          language: 'en',
          theme: 'dark'
        }
      }
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'pham.thu.d@student.edu.vn',
        name: 'Phạm Thu D',
        role: 'MEMBER',
        studentId: 'SV004',
        major: 'Marketing',
        academicYear: '2024',
        bio: 'Marketing student focusing on business English communication',
        points: 1800,
        level: 5,
        experiencePoints: 3600,
        streakDays: 22,
        avatar: 'https://i.pravatar.cc/200?img=6',
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: 'vi',
          theme: 'light'
        }
      }
    })
  ])

  // 7. Create User Achievements
  console.log('Creating user achievements...')
  await Promise.all([
    prisma.userAchievement.create({
      data: {
        userId: users[2].id, // Nguyen Van A
        achievementType: 'first_challenge',
        title: 'First Challenge Completed',
        description: 'Completed your first English challenge',
        points: 50
      }
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[2].id,
        achievementType: 'streak_week',
        title: 'Week Streak',
        description: 'Maintained a 7-day learning streak',
        points: 100
      }
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[3].id, // Tran Thi B
        achievementType: 'grammar_master',
        title: 'Grammar Master',
        description: 'Scored 90% or higher in 5 grammar challenges',
        points: 200
      }
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[3].id,
        achievementType: 'streak_month',
        title: 'Monthly Dedication',
        description: 'Maintained a 30-day learning streak',
        points: 300
      }
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[5].id, // Pham Thu D
        achievementType: 'vocabulary_builder',
        title: 'Vocabulary Builder',
        description: 'Learned 100 new words',
        points: 150
      }
    })
  ])

  // 8. Create Challenges
  console.log('Creating challenges...')
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: 'Present Perfect Tense Practice',
        description: 'Master the usage of present perfect tense in various contexts',
        instructions: 'Complete the sentences using the correct form of present perfect tense. Pay attention to the time expressions and context clues.',
        difficulty: 'INTERMEDIATE',
        category: 'GRAMMAR',
        type: 'MULTIPLE_CHOICE',
        points: 50,
        timeLimit: 1800, // 30 minutes
        maxAttempts: 3,
        tags: ['present-perfect', 'tense', 'grammar'],
        resources: {
          materials: [
            'https://example.com/present-perfect-guide.pdf',
            'https://example.com/present-perfect-video.mp4'
          ],
          examples: [
            'I have lived in this city for five years.',
            'She has just finished her homework.',
            'Have you ever been to Japan?'
          ]
        },
        evaluationCriteria: {
          accuracy: 'Correct identification and usage of present perfect forms',
          understanding: 'Demonstration of understanding time relationships',
          application: 'Proper application in different contexts'
        }
      }
    }),
    prisma.challenge.create({
      data: {
        title: 'Business Email Writing',
        description: 'Write professional business emails for different scenarios',
        instructions: 'Compose a formal business email based on the given scenario. Include appropriate greeting, body, and closing. Use professional tone and proper business email format.',
        difficulty: 'ADVANCED',
        category: 'BUSINESS_ENGLISH',
        type: 'ESSAY',
        points: 100,
        timeLimit: 3600, // 60 minutes
        maxAttempts: 2,
        tags: ['business-english', 'email', 'writing', 'professional'],
        resources: {
          templates: ['formal-email-template.docx'],
          examples: ['sample-business-emails.pdf'],
          guidelines: ['business-email-best-practices.pdf']
        },
        evaluationCriteria: {
          format: 'Proper email structure and formatting',
          tone: 'Professional and appropriate tone',
          clarity: 'Clear and concise communication',
          grammar: 'Correct grammar and spelling'
        }
      }
    }),
    prisma.challenge.create({
      data: {
        title: 'IELTS Speaking Practice - Part 2',
        description: 'Practice IELTS Speaking Part 2 with cue card topics',
        instructions: 'Record a 2-minute speech about the given topic. You have 1 minute to prepare. Speak clearly and cover all points mentioned in the cue card.',
        difficulty: 'ADVANCED',
        category: 'IELTS_PREP',
        type: 'SPEAKING_RECORDING',
        points: 80,
        timeLimit: 240, // 4 minutes (1 min prep + 2 min speaking + 1 min buffer)
        maxAttempts: 3,
        tags: ['ielts', 'speaking', 'cue-card', 'test-prep'],
        resources: {
          cueCards: ['describe-favorite-place.pdf', 'describe-memorable-event.pdf'],
          bandDescriptors: ['ielts-speaking-band-descriptors.pdf'],
          sampleAnswers: ['ielts-speaking-samples.mp3']
        },
        evaluationCriteria: {
          fluency: 'Fluency and coherence',
          vocabulary: 'Lexical resource and variety',
          grammar: 'Grammatical range and accuracy',
          pronunciation: 'Pronunciation clarity'
        }
      }
    }),
    prisma.challenge.create({
      data: {
        title: 'Listening Comprehension - Daily Conversations',
        description: 'Improve listening skills with everyday English conversations',
        instructions: 'Listen to the audio clips and answer the comprehension questions. You can play each clip up to 3 times.',
        difficulty: 'BEGINNER',
        category: 'LISTENING',
        type: 'LISTENING_COMPREHENSION',
        points: 40,
        timeLimit: 1200, // 20 minutes
        maxAttempts: 3,
        tags: ['listening', 'conversation', 'comprehension', 'daily-english'],
        resources: {
          audioFiles: ['conversation1.mp3', 'conversation2.mp3', 'conversation3.mp3'],
          transcripts: ['conversation-transcripts.pdf'],
          vocabulary: ['key-vocabulary.pdf']
        },
        evaluationCriteria: {
          comprehension: 'Understanding of main ideas and details',
          inference: 'Ability to infer meaning from context',
          vocabulary: 'Recognition of key vocabulary'
        }
      }
    }),
    prisma.challenge.create({
      data: {
        title: 'Advanced Vocabulary Building - Academic Words',
        description: 'Expand your academic vocabulary with high-frequency academic words',
        instructions: 'Study the academic word list and complete the exercises. Match words with definitions, use them in context, and create your own sentences.',
        difficulty: 'EXPERT',
        category: 'VOCABULARY',
        type: 'VOCABULARY_BUILDING',
        points: 60,
        timeLimit: 2400, // 40 minutes
        maxAttempts: 2,
        tags: ['vocabulary', 'academic', 'advanced', 'word-study'],
        resources: {
          wordLists: ['academic-word-list.pdf'],
          exercises: ['vocabulary-exercises.pdf'],
          examples: ['academic-vocabulary-examples.pdf']
        },
        evaluationCriteria: {
          recognition: 'Ability to recognize word meanings',
          usage: 'Correct usage in appropriate contexts',
          application: 'Creative application in original sentences'
        }
      }
    })
  ])

  // 9. Create Resources
  console.log('Creating resources...')
  await Promise.all([
    prisma.resource.create({
      data: {
        title: 'English Grammar Fundamentals',
        description: 'Comprehensive guide covering all essential English grammar topics',
        content: 'This resource covers parts of speech, tenses, sentence structure, and common grammar rules with examples and exercises.',
        type: 'PDF',
        category: 'Grammar',
        tags: ['grammar', 'fundamentals', 'guide'],
        difficulty: 'BEGINNER',
        fileUrl: 'https://example.com/grammar-fundamentals.pdf',
        thumbnailUrl: 'https://example.com/grammar-thumb.jpg',
        duration: null,
        size: 2048000, // 2MB
        downloads: 45,
        views: 156,
        uploadedBy: users[1].id, // Moderator
        metadata: {
          pages: 50,
          language: 'en',
          level: 'beginner-intermediate'
        }
      }
    }),
    prisma.resource.create({
      data: {
        title: 'IELTS Speaking Tips and Strategies',
        description: 'Video tutorial series for IELTS Speaking test preparation',
        content: 'Learn effective strategies for all parts of the IELTS Speaking test with practice examples and expert tips.',
        type: 'VIDEO',
        category: 'Test Preparation',
        tags: ['ielts', 'speaking', 'test-prep', 'strategies'],
        difficulty: 'INTERMEDIATE',
        fileUrl: 'https://example.com/ielts-speaking-tips.mp4',
        thumbnailUrl: 'https://example.com/ielts-speaking-thumb.jpg',
        duration: 1800, // 30 minutes
        size: 104857600, // 100MB
        downloads: 78,
        views: 234,
        uploadedBy: users[1].id,
        metadata: {
          resolution: '1080p',
          format: 'mp4',
          subtitles: ['en', 'vi']
        }
      }
    }),
    prisma.resource.create({
      data: {
        title: 'Business English Vocabulary List',
        description: 'Essential vocabulary for business communication and professional settings',
        content: 'Curated list of business terms, phrases, and expressions commonly used in professional environments.',
        type: 'DOCUMENT',
        category: 'Business English',
        tags: ['business', 'vocabulary', 'professional', 'workplace'],
        difficulty: 'ADVANCED',
        fileUrl: 'https://example.com/business-vocab.docx',
        thumbnailUrl: 'https://example.com/business-vocab-thumb.jpg',
        duration: null,
        size: 512000, // 500KB
        downloads: 89,
        views: 267,
        uploadedBy: users[0].id, // Admin
        metadata: {
          wordCount: 500,
          categories: ['meetings', 'presentations', 'negotiations', 'correspondence']
        }
      }
    }),
    prisma.resource.create({
      data: {
        title: 'English Pronunciation Audio Guide',
        description: 'Audio lessons focusing on challenging English pronunciation patterns',
        content: 'Practice difficult sounds, stress patterns, and intonation with native speaker examples.',
        type: 'AUDIO',
        category: 'Pronunciation',
        tags: ['pronunciation', 'phonetics', 'speaking', 'audio'],
        difficulty: 'INTERMEDIATE',
        fileUrl: 'https://example.com/pronunciation-guide.mp3',
        thumbnailUrl: 'https://example.com/pronunciation-thumb.jpg',
        duration: 2700, // 45 minutes
        size: 25600000, // 25MB
        downloads: 123,
        views: 345,
        uploadedBy: users[1].id,
        metadata: {
          bitrate: '128kbps',
          format: 'mp3',
          topics: ['th-sounds', 'word-stress', 'connected-speech']
        }
      }
    }),
    prisma.resource.create({
      data: {
        title: 'Interactive Grammar Quiz',
        description: 'Self-assessment quiz covering intermediate grammar topics',
        content: 'Test your grammar knowledge with this interactive quiz featuring explanations for each answer.',
        type: 'QUIZ',
        category: 'Grammar',
        tags: ['quiz', 'grammar', 'interactive', 'assessment'],
        difficulty: 'INTERMEDIATE',
        fileUrl: 'https://example.com/grammar-quiz',
        thumbnailUrl: 'https://example.com/quiz-thumb.jpg',
        duration: 900, // 15 minutes
        size: 1024000, // 1MB
        downloads: 67,
        views: 189,
        uploadedBy: users[0].id,
        metadata: {
          questions: 30,
          topics: ['conditionals', 'passive-voice', 'reported-speech'],
          attempts: 'unlimited'
        }
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`Created:
  - ${aiModels.length} AI models
  - 3 API keys
  - 3 AI safety rules
  - 3 banned terms
  - ${scoringTemplates.length} scoring templates
  - ${users.length} users
  - 5 user achievements
  - ${challenges.length} challenges
  - 5 resources`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
