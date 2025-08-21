/**
 * Session management utilities for persistent authentication
 */

const SESSION_KEY = 'english_platform_session'
const USER_KEY = 'english_platform_user'

// Save session to localStorage for persistence
export const saveSession = (session: any) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Error saving session:', error)
  }
}

// Get session from localStorage
export const getStoredSession = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error getting stored session:', error)
    return null
  }
}

// Clear stored session
export const clearStoredSession = () => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Error clearing stored session:', error)
  }
}

// Save user data for quick access
export const saveUserData = (user: any) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error saving user data:', error)
  }
}

// Get stored user data
export const getStoredUserData = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error getting stored user data:', error)
    return null
  }
}

// Check if session is still valid (not expired)
export const isSessionValid = (session: any) => {
  if (!session || !session.expires_at) return false
  
  const expiresAt = new Date(session.expires_at).getTime()
  const now = Date.now()
  const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
  
  return expiresAt > (now + bufferTime)
}
