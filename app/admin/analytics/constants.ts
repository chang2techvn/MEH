import type {
  UserGrowthData,
  ChallengeCompletionData,
  UserLevelDistribution,
  EngagementByTimeData,
  SkillImprovementData,
  TopPerformingVideo,
  RetentionCohortData,
  LearningPathData,
} from "./types"

export const USER_GROWTH_DATA: UserGrowthData[] = [
  { month: "Jan", users: 1200, previousUsers: 980 },
  { month: "Feb", users: 1400, previousUsers: 1100 },
  { month: "Mar", users: 1800, previousUsers: 1350 },
  { month: "Apr", users: 2200, previousUsers: 1600 },
  { month: "May", users: 2600, previousUsers: 1900 },
  { month: "Jun", users: 3100, previousUsers: 2300 },
  { month: "Jul", users: 3500, previousUsers: 2700 },
  { month: "Aug", users: 4000, previousUsers: 3100 },
  { month: "Sep", users: 4200, previousUsers: 3400 },
  { month: "Oct", users: 4500, previousUsers: 3700 },
  { month: "Nov", users: 4800, previousUsers: 4000 },
  { month: "Dec", users: 5200, previousUsers: 4300 },
]

export const CHALLENGE_COMPLETION_DATA: ChallengeCompletionData[] = [
  { challenge: "Daily Speaking", completed: 78, target: 85, color: "bg-green-500" },
  { challenge: "Grammar Quiz", completed: 65, target: 75, color: "bg-blue-500" },
  { challenge: "Vocabulary", completed: 82, target: 80, color: "bg-purple-500" },
  { challenge: "Listening", completed: 71, target: 80, color: "bg-orange-500" },
  { challenge: "Reading", completed: 60, target: 70, color: "bg-pink-500" },
  { challenge: "Writing", completed: 55, target: 65, color: "bg-yellow-500" },
]

export const USER_LEVEL_DISTRIBUTION: UserLevelDistribution[] = [
  { level: "Beginner", count: 2500, percentage: 48, color: "bg-green-500" },
  { level: "Intermediate", count: 1800, percentage: 35, color: "bg-blue-500" },
  { level: "Advanced", count: 900, percentage: 17, color: "bg-purple-500" },
]

export const ENGAGEMENT_BY_TIME_DATA: EngagementByTimeData[] = [
  { hour: "00:00", users: 120, previousUsers: 95 },
  { hour: "02:00", users: 80, previousUsers: 65 },
  { hour: "04:00", users: 40, previousUsers: 35 },
  { hour: "06:00", users: 100, previousUsers: 85 },
  { hour: "08:00", users: 280, previousUsers: 220 },
  { hour: "10:00", users: 460, previousUsers: 380 },
  { hour: "12:00", users: 380, previousUsers: 320 },
  { hour: "14:00", users: 340, previousUsers: 290 },
  { hour: "16:00", users: 300, previousUsers: 260 },
  { hour: "18:00", users: 420, previousUsers: 350 },
  { hour: "20:00", users: 380, previousUsers: 310 },
  { hour: "22:00", users: 220, previousUsers: 180 },
]

export const SKILL_IMPROVEMENT_DATA: SkillImprovementData[] = [
  { skill: "Speaking", improvement: 24, previousImprovement: 18, trend: "up" },
  { skill: "Listening", improvement: 32, previousImprovement: 26, trend: "up" },
  { skill: "Reading", improvement: 28, previousImprovement: 30, trend: "down" },
  { skill: "Writing", improvement: 22, previousImprovement: 19, trend: "up" },
  { skill: "Grammar", improvement: 18, previousImprovement: 20, trend: "down" },
  { skill: "Vocabulary", improvement: 30, previousImprovement: 25, trend: "up" },
]

export const TOP_PERFORMING_VIDEOS: TopPerformingVideo[] = [
  {
    id: "1",
    title: "The Impact of Technology on Modern Society",
    views: 1245,
    completionRate: 72,
    avgWatchTime: 240,
    trend: "up",
    trendPercentage: 8,
  },
  {
    id: "2",
    title: "Climate Change: Global Challenges",
    views: 876,
    completionRate: 65,
    avgWatchTime: 210,
    trend: "down",
    trendPercentage: 3,
  },
  {
    id: "3",
    title: "Introduction to Artificial Intelligence",
    views: 1532,
    completionRate: 88,
    avgWatchTime: 280,
    trend: "up",
    trendPercentage: 12,
  },
  {
    id: "4",
    title: "Business Communication Skills",
    views: 945,
    completionRate: 54,
    avgWatchTime: 190,
    trend: "up",
    trendPercentage: 5,
  },
  {
    id: "5",
    title: "Cultural Diversity in the Workplace",
    views: 723,
    completionRate: 61,
    avgWatchTime: 205,
    trend: "down",
    trendPercentage: 2,
  },
]

export const RETENTION_COHORT_DATA: RetentionCohortData[] = [
  { cohort: "Week 1", day1: 100, day7: 82, day14: 68, day30: 54, day60: 42, day90: 35 },
  { cohort: "Week 2", day1: 100, day7: 85, day14: 72, day30: 58, day60: 45, day90: 38 },
  { cohort: "Week 3", day1: 100, day7: 80, day14: 65, day30: 52, day60: 40, day90: 32 },
  { cohort: "Week 4", day1: 100, day7: 88, day14: 75, day30: 62, day60: 48, day90: 40 },
  { cohort: "Week 5", day1: 100, day7: 84, day14: 70, day30: 56, day60: 44, day90: 36 },
]

export const LEARNING_PATH_DATA: LearningPathData[] = [
  { path: "Conversational English", users: 1245, completionRate: 68, satisfaction: 4.2 },
  { path: "Business English", users: 876, completionRate: 72, satisfaction: 4.5 },
  { path: "Academic English", users: 654, completionRate: 65, satisfaction: 4.0 },
  { path: "Travel English", users: 1532, completionRate: 82, satisfaction: 4.7 },
  { path: "English for Interviews", users: 945, completionRate: 75, satisfaction: 4.3 },
]

export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  },
}
