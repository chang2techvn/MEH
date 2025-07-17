"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { type Challenge } from "@/lib/utils/challenge-constants"

interface ChallengeContextType {
  challengeMode: 'daily' | 'practice'
  currentChallenge: Challenge | null
  setChallengeMode: (mode: 'daily' | 'practice') => void
  setCurrentChallenge: (challenge: Challenge | null) => void
  resetToDaily: () => void
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined)

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [challengeMode, setChallengeMode] = useState<'daily' | 'practice'>('daily')
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)

  const resetToDaily = () => {
    setChallengeMode('daily')
    setCurrentChallenge(null)
  }

  return (
    <ChallengeContext.Provider
      value={{
        challengeMode,
        currentChallenge,
        setChallengeMode,
        setCurrentChallenge,
        resetToDaily,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  )
}

export function useChallenge() {
  const context = useContext(ChallengeContext)
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider')
  }
  return context
}
