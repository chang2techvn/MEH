/**
 * Auth utilities for handling JWT token issues and browser cache
 */

// Clear all browser storage related to auth
export const clearBrowserAuthCache = () => {
  if (typeof window === 'undefined') return

  try {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        localStorage.removeItem(key)
      }
    })

    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        sessionStorage.removeItem(key)
      }
    })

    // Clear cookies (if any auth cookies exist)
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
    })

    console.log('✅ Browser auth cache cleared')
  } catch (error) {
    console.error('❌ Error clearing browser auth cache:', error)
  }
}

// Force reload page to ensure clean state
export const forcePageReload = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

// Check if current error is JWT related
export const isJWTError = (error: any): boolean => {
  if (!error) return false
  
  const errorMessage = error.message || error.toString() || ''
  return (
    errorMessage.includes('JWT') ||
    errorMessage.includes('exp') ||
    errorMessage.includes('InvalidJWTToken') ||
    errorMessage.includes('token') ||
    errorMessage.includes('expired')
  )
}

// Create a clean Supabase client instance
export const createCleanSupabaseSession = async (supabaseClient: any) => {
  try {
    // Sign out completely
    await supabaseClient.auth.signOut({ scope: 'global' })
    
    // Clear browser cache
    clearBrowserAuthCache()
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Clean Supabase session created')
    return true
  } catch (error) {
    console.error('❌ Error creating clean session:', error)
    return false
  }
}
