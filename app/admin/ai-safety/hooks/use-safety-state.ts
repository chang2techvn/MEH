"use client"

import { useState } from "react"
import type { SafetyRule, FlaggedContent, BannedTerm, SafetyMetric, TestResults } from "../types"
import { mockSafetyRules, mockFlaggedContent, mockBannedTerms, mockSafetyMetrics } from "../constants"

export function useSafetyState() {
  const [safetyRules, setSafetyRules] = useState<SafetyRule[]>(mockSafetyRules)
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>(mockFlaggedContent)
  const [bannedTerms, setBannedTerms] = useState<BannedTerm[]>(mockBannedTerms)
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetric[]>(mockSafetyMetrics)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testContent, setTestContent] = useState("")
  const [testResults, setTestResults] = useState<TestResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // Filter flagged content based on search query
  const filteredFlaggedContent = flaggedContent.filter(
    (item) =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rule.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Toggle rule enabled state
  const toggleRuleEnabled = (ruleId: string) => {
    setSafetyRules(safetyRules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  // Update rule threshold
  const updateRuleThreshold = (ruleId: string, value: number[]) => {
    setSafetyRules(safetyRules.map((rule) => (rule.id === ruleId ? { ...rule, threshold: value[0] } : rule)))
  }

  // Add new banned term
  const addBannedTerm = (term: string, category: string, replacement: string) => {
    const newTerm: BannedTerm = {
      id: `term-${bannedTerms.length + 1}`,
      term,
      category,
      replacement,
      addedBy: "Admin",
      addedAt: new Date().toISOString(),
    }
    setBannedTerms([...bannedTerms, newTerm])
  }

  // Remove banned term
  const removeBannedTerm = (termId: string) => {
    setBannedTerms(bannedTerms.filter((term) => term.id !== termId))
  }

  // Update flagged content status
  const updateContentStatus = (contentId: string, status: "pending" | "reviewed" | "approved" | "rejected") => {
    setFlaggedContent(flaggedContent.map((item) => (item.id === contentId ? { ...item, status } : item)))
  }

  // Test content against safety rules
  const testContentSafety = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const mockTestResults: TestResults = {
        overallSafetyScore: 78,
        flagged: true,
        triggeredRules: [
          {
            ruleName: "Inappropriate Language Filter",
            confidence: 82,
            severity: "medium",
          },
          {
            ruleName: "Personal Information Detection",
            confidence: 65,
            severity: "critical",
          },
        ],
        suggestedActions: [
          "Review and modify content to remove inappropriate language",
          "Remove or redact any personal information",
        ],
        modifiedContent: testContent.replace(/badword1|badword2/gi, "****"),
      }

      setTestResults(mockTestResults)
      setIsLoading(false)
    }, 1500)
  }

  // Save settings
  const saveSettings = () => {
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  return {
    // State
    safetyRules,
    flaggedContent,
    bannedTerms,
    safetyMetrics,
    activeTab,
    searchQuery,
    isTestDialogOpen,
    testContent,
    testResults,
    isLoading,
    showSuccessAlert,
    filteredFlaggedContent,

    // Setters
    setActiveTab,
    setSearchQuery,
    setIsTestDialogOpen,
    setTestContent,
    setTestResults,
    setIsLoading,
    setShowSuccessAlert,

    // Actions
    toggleRuleEnabled,
    updateRuleThreshold,
    addBannedTerm,
    removeBannedTerm,
    updateContentStatus,
    testContentSafety,
    saveSettings,
  }
}
