export type SafetyRule = {
  id: string
  name: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
  threshold: number
  category: "content" | "behavior" | "personal" | "harmful"
  createdAt: string
  lastUpdated: string
}

export type FlaggedContent = {
  id: string
  content: string
  userId: string
  userName: string
  timestamp: string
  rule: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "reviewed" | "approved" | "rejected"
  score: number
}

export type BannedTerm = {
  id: string
  term: string
  category: string
  replacement?: string
  addedBy: string
  addedAt: string
}

export type SafetyMetric = {
  name: string
  value: number
  change: number
  target: number
}

export type TestResults = {
  overallSafetyScore: number
  flagged: boolean
  triggeredRules: Array<{
    ruleName: string
    confidence: number
    severity: string
  }>
  suggestedActions: string[]
  modifiedContent: string
}
