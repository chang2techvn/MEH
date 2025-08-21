import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop()?.split(';').shift()
          }
          return undefined
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=${value}`
            
            // Production settings for secure cookies
            if (process.env.NODE_ENV === 'production') {
              cookieString += '; Secure; SameSite=Lax'
            } else {
              cookieString += '; SameSite=Lax'
            }
            
            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`
            }
            
            if (options?.path) {
              cookieString += `; Path=${options.path}`
            } else {
              cookieString += '; Path=/'
            }
            
            document.cookie = cookieString
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            
            if (options?.path) {
              cookieString += `; Path=${options.path}`
            } else {
              cookieString += '; Path=/'
            }
            
            document.cookie = cookieString
          }
        },
      },
    }
  )
}
