/**
 * Script to debug authentication issues in the app
 * This will help us understand why users are not authenticated
 */

console.log('🔍 Debugging Authentication in App...\n')

// Check if we're in browser environment
if (typeof window !== 'undefined') {
  console.log('Running in browser environment')
  
  // Check localStorage for supabase session
  const supabaseSession = localStorage.getItem('sb-localhost-auth-token')
  console.log('Supabase session in localStorage:', supabaseSession ? 'EXISTS' : 'NOT FOUND')
  
  if (supabaseSession) {
    try {
      const session = JSON.parse(supabaseSession)
      console.log('Session data:', {
        access_token: session.access_token ? 'EXISTS' : 'MISSING',
        refresh_token: session.refresh_token ? 'EXISTS' : 'MISSING',
        expires_at: session.expires_at,
        user: session.user ? {
          id: session.user.id,
          email: session.user.email
        } : 'NO USER'
      })
    } catch (e) {
      console.log('Error parsing session:', e.message)
    }
  }
  
  // Check if Supabase client is available globally
  if (window.supabase) {
    console.log('Global supabase client found')
    
    window.supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('❌ Error getting session:', error.message)
      } else if (session) {
        console.log('✅ Active session found:', {
          user_id: session.user.id,
          email: session.user.email,
          expires_at: new Date(session.expires_at * 1000)
        })
      } else {
        console.log('❌ No active session')
      }
    })
  }
  
} else {
  console.log('Running in Node.js environment')
  console.log('This script is meant to be run in the browser console')
  console.log('Copy and paste this into your browser console while the app is running')
}

// Export debug function for browser use
if (typeof window !== 'undefined') {
  window.debugAuth = async function() {
    if (!window.supabase) {
      console.log('❌ Supabase client not found')
      return
    }
    
    const { data: { session }, error } = await window.supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Error:', error.message)
      return
    }
    
    if (!session) {
      console.log('❌ No session found')
      console.log('Try signing in first:')
      console.log('window.supabase.auth.signInWithPassword({ email: "test@example.com", password: "password123" })')
      return
    }
    
    console.log('✅ Session found:', {
      user_id: session.user.id,
      email: session.user.email,
      role: session.user.role
    })
    
    // Test conversation creation
    console.log('Testing conversation creation...')
    const { data, error: convError } = await window.supabase
      .from('conversations')
      .insert({
        title: 'Debug Test Conversation',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (convError) {
      console.log('❌ Conversation creation failed:', convError)
    } else {
      console.log('✅ Conversation created successfully:', data)
      
      // Clean up
      await window.supabase.from('conversations').delete().eq('id', data.id)
      console.log('✅ Test conversation cleaned up')
    }
  }
  
  console.log('\n🎯 Debug function created!')
  console.log('Run debugAuth() in the browser console to test authentication')
}
