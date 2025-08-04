export const STORAGE_KEY = "admin_challenges"

export const ANIMATION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
}

export const DEFAULT_FORM_STATE = {
  youtubeUrl: "",
  title: "",
  description: "",
  difficulty: "intermediate",
  duration: 0,
  videoId: "",
  thumbnailUrl: "",
  videoUrl: "",
  embedUrl: "",
  topics: [] as string[],
  featured: false,
}

export const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title (A-Z)" },
  { value: "duration", label: "Duration (Longest)" },
]
