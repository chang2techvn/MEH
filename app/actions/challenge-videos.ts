"use server"

import { fetchRandomYoutubeVideo, type VideoData } from "./youtube-video"
import { classifyChallengeDifficulty } from "../utils/challenge-classifier"

// Add these cache variables at the top of the file, after the imports
// Cache mechanism for challenges
type ChallengeCache = {
  challenges: Challenge[]
  date: string | null
  timestamp: number
}

// Global cache for challenges
let globalChallengeCache: ChallengeCache = {
  challenges: [],
  date: null,
  timestamp: 0,
}

// Cache for current challenge
let currentChallengeCache: {
  challenge: Challenge | null
  date: string | null
} = {
  challenge: null,
  date: null,
}

// Function to get today's date as a string
const getTodayDate = () => {
  const today = new Date()
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
}

// Định nghĩa các chủ đề cho thử thách
const challengeTopics = {
  beginner: [
    "basic english vocabulary",
    "english for beginners",
    "simple english conversation",
    "english pronunciation basics",
    "elementary grammar",
    "travel english phrases",
    "daily english expressions",
    "english learning for beginners",
    "basic english grammar",
    "english alphabet pronunciation",
    "english numbers pronunciation",
    "english greetings and introductions",
    "english for kids",
    "english phonics",
  ],
  intermediate: [
    "business english",
    "english idioms",
    "english presentation skills",
    "academic english",
    "english debate topics",
    "english interview tips",
    "cultural differences",
    "english phrasal verbs",
    "english slang expressions",
    "english for work",
    "english for travel",
    "english conversation practice",
    "english listening practice",
    "english speaking practice",
  ],
  advanced: [
    "advanced english vocabulary",
    "english literature analysis",
    "complex grammar structures",
    "professional english communication",
    "english for specific purposes",
    "english public speaking",
    "english academic writing",
    "english rhetoric",
    "english for negotiations",
    "english for presentations",
    "english for academic research",
    "english debate techniques",
    "english persuasive speaking",
    "english critical thinking",
  ],
  general: [
    "ted talk english",
    "english learning tips",
    "english language history",
    "english around the world",
    "english language evolution",
    "english language varieties",
    "english pronunciation tips",
    "english accent training",
    "english fluency practice",
    "english vocabulary building",
    "english grammar tips",
    "english speaking confidence",
    "english learning motivation",
    "english learning strategies",
    "english for daily life",
    "english for social media",
    "english for technology",
    "english for science",
    "english for arts",
    "english for sports",
    "english for music",
    "english for movies",
    "english for literature",
    "english for travel vlogs",
  ],
}

// Định nghĩa kiểu dữ liệu cho thử thách
export interface Challenge {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  videoUrl: string
  embedUrl?: string
  duration: number
  difficulty: string
  createdAt: string
  topics?: string[]
  featured?: boolean
}

// Hàm chuyển đổi VideoData thành Challenge
function videoDataToChallenge(videoData: VideoData, forceDifficulty?: string): Challenge {
  const difficulty =
    forceDifficulty || classifyChallengeDifficulty(videoData.title, videoData.description, videoData.duration)

  return {
    id: videoData.id,
    title: videoData.title,
    description: videoData.description,
    thumbnailUrl: videoData.thumbnailUrl,
    videoUrl: videoData.videoUrl,
    embedUrl: videoData.embedUrl,
    duration: videoData.duration,
    difficulty,
    createdAt: new Date().toISOString(),
    topics: Array.isArray(videoData.topics) ? videoData.topics : [],
    featured: Math.random() < 0.2, // 20% chance to be featured
  }
}

// Hàm lấy video cho một cấp độ cụ thể
export async function fetchChallengesByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced",
  count = 2,
): Promise<Challenge[]> {
  const challenges: Challenge[] = []
  const topics = challengeTopics[difficulty] || []

  // Thiết lập thời lượng video dựa trên cấp độ
  let minDuration = 60 // 2 phút
  let maxDuration = 2700 // 5 phút

  if (difficulty === "beginner") {
    minDuration = 120 // 2 phút
    maxDuration = 2700 // 4 phút
  } else if (difficulty === "intermediate") {
    minDuration = 180 // 3 phút
    maxDuration = 2700 // 5 phút
  } else if (difficulty === "advanced") {
    minDuration = 240 // 4 phút
    maxDuration = 2700 // 7 phút
  }

  // Lấy ngẫu nhiên các chủ đề từ danh sách
  const shuffledTopics = [...(Array.isArray(topics) ? topics : [])].sort(() => 0.5 - Math.random())
  const selectedTopics = shuffledTopics.slice(0, count)

  // Lấy video cho mỗi chủ đề
  for (const topic of selectedTopics) {
    try {
      const videoData = await fetchRandomYoutubeVideo(minDuration, maxDuration, [topic])
      const challenge = videoDataToChallenge(videoData, difficulty)
      challenges.push(challenge)
    } catch (error) {
      console.error(`Error fetching video for topic ${topic}:`, error)
    }
  }

  return challenges
}

// Hàm lấy tất cả các thử thách cho trang challenges
export async function fetchAllChallenges(countPerDifficulty = 2): Promise<Challenge[]> {
  try {
    // Check if we have cached challenges for today
    const today = getTodayDate()

    if (globalChallengeCache.challenges.length > 0 && globalChallengeCache.date === today) {
      console.log("Using cached challenges for today")
      return globalChallengeCache.challenges
    }

    console.log("Fetching new challenges for today")

    // Lấy thử thách cho mỗi cấp độ
    const [beginnerChallenges, intermediateChallenges, advancedChallenges] = await Promise.all([
      fetchChallengesByDifficulty("beginner", countPerDifficulty),
      fetchChallengesByDifficulty("intermediate", countPerDifficulty),
      fetchChallengesByDifficulty("advanced", countPerDifficulty),
    ])

    // Kết hợp tất cả các thử thách
    const allChallenges = [
      ...(Array.isArray(beginnerChallenges) ? beginnerChallenges : []),
      ...(Array.isArray(intermediateChallenges) ? intermediateChallenges : []),
      ...(Array.isArray(advancedChallenges) ? advancedChallenges : []),
    ]

    // Update the cache
    globalChallengeCache = {
      challenges: allChallenges,
      date: today,
      timestamp: Date.now(),
    }

    return allChallenges
  } catch (error) {
    console.error("Error fetching all challenges:", error)

    // If we have cached challenges (even from a previous day), use them as fallback
    if (globalChallengeCache.challenges.length > 0) {
      console.log("Using previously cached challenges as fallback")
      return globalChallengeCache.challenges
    }

    return []
  }
}

// Hàm lấy thử thách hiện tại cho người dùng
export async function fetchCurrentChallenge(): Promise<Challenge | null> {
  try {
    // Check if we have a cached current challenge for today
    const today = getTodayDate()

    if (currentChallengeCache.challenge && currentChallengeCache.date === today) {
      console.log("Using cached current challenge for today")
      return currentChallengeCache.challenge
    }

    console.log("Fetching new current challenge for today")

    // Lấy một video ngẫu nhiên từ các chủ đề chung
    const generalTopics = challengeTopics.general
    const randomTopic = generalTopics[Math.floor(Math.random() * generalTopics.length)]

    const videoData = await fetchRandomYoutubeVideo(180, 300, [randomTopic])
    const challenge = videoDataToChallenge(videoData)

    // Update the cache
    currentChallengeCache = {
      challenge,
      date: today,
    }

    return challenge
  } catch (error) {
    console.error("Error fetching current challenge:", error)

    // If we have a cached challenge (even from a previous day), use it as fallback
    if (currentChallengeCache.challenge) {
      console.log("Using previously cached current challenge as fallback")
      return currentChallengeCache.challenge
    }

    return null
  }
}
