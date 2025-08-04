export const initialScheduledMessages = [
  {
    id: 1,
    title: "Weekly Newsletter",
    type: "email" as const,
    recipients: 876,
    date: new Date(2025, 4, 15, 9, 0),
    status: "scheduled" as const,
    recurring: "weekly",
  },
  {
    id: 2,
    title: "New Course Announcement",
    type: "zalo" as const,
    recipients: 1254,
    date: new Date(2025, 4, 18, 14, 30),
    status: "scheduled" as const,
    recurring: "none",
  },
  {
    id: 3,
    title: "Weekend Challenge",
    type: "email" as const,
    recipients: 542,
    date: new Date(2025, 4, 20, 10, 0),
    status: "scheduled" as const,
    recurring: "weekly",
  },
  {
    id: 4,
    title: "Monthly Progress Report",
    type: "email" as const,
    recipients: 1254,
    date: new Date(2025, 5, 1, 8, 0),
    status: "scheduled" as const,
    recurring: "monthly",
  },
]

export const notificationStats = {
  totalSent: 12458,
  openRate: 68,
  clickRate: 24,
  deliveryRate: 98,
}

export const aiSuggestionPrompts = [
  "Write an announcement for a new English course",
  "Create a reminder for an upcoming event",
  "Draft a congratulatory message for course completion",
  "Write a welcome message for new users",
  "Create a notification about platform updates",
  "Write a message encouraging users to practice daily",
]

export const recentActivity = [
  {
    id: 1,
    title: "Course Update Notification",
    type: "email" as const,
    recipients: 1248,
    status: "sent" as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    details: "Notification about new course updates",
  },
  {
    id: 2,
    title: "Weekend Challenge Reminder",
    type: "zalo" as const,
    recipients: 876,
    status: "sent" as const,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    details: "Weekend challenge reminder message",
  },
  {
    id: 3,
    title: "New Learning Resources",
    type: "email" as const,
    recipients: 1024,
    status: "sent" as const,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    details: "New learning resources available",
  },
]

export const messageTemplates = [
  {
    id: 1,
    name: "Welcome Message",
    subject: "Welcome to our English Learning Platform!",
    content: "Welcome to our platform! We're excited to help you on your English learning journey.",
    type: "email" as const,
    category: "welcome",
    usage: 45,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: 2,
    name: "Course Reminder",
    subject: "Don't forget your English lesson today!",
    content: "Your English lesson is starting soon. Join now to continue your progress!",
    type: "zalo" as const,
    category: "reminder",
    usage: 128,
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: 3,
    name: "Achievement Notification",
    subject: "Congratulations on your progress!",
    content: "You've completed another milestone in your English learning journey. Keep it up!",
    type: "email" as const,
    category: "achievement",
    usage: 67,
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
]
