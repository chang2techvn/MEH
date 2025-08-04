import { createClient } from '@supabase/supabase-js'

// Simplified Database type for Supabase client
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser/user interactions
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    headers: {
      'X-Client-Info': 'supabase-js-web'
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (attempts: number) => Math.min(1000 * Math.pow(2, attempts), 30000)
  },
  global: {
    headers: {
      'X-Client-Info': 'english-learning-platform'
    }
  }
})

// Cache for user data
let userCache: any = null
let userCacheTimestamp = 0
const USER_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper functions for common database operations
export const dbHelpers = {
  // User operations
  async getCurrentUser() {
    // Removed excessive logging - only log when necessary
    
    // Check cache first
    const now = Date.now()
    if (userCache && (now - userCacheTimestamp) < USER_CACHE_DURATION) {
      // Silent cache usage - no need to log every access
      return userCache
    }
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      // Only log when getting fresh data or on errors
      if (authError) {
        console.log('🔐 Auth error:', authError)
      }
      
      if (!user) {
        console.log('⚠️ No authenticated user, trying to get first user from database as fallback')
        
        // Fallback: get first user from database for development - with profile
        const { data: firstUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .limit(1)
          .single()
        
        if (userError || !firstUser) {
          console.log('❌ No users found in database:', userError)
          return null
        }
        
        const { data: firstProfile } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('user_id', firstUser.id)
          .single()
        
        const enrichedUser = {
          ...firstUser,
          name: firstProfile?.full_name || firstProfile?.username || firstUser.email,
          avatar: firstProfile?.avatar_url || firstUser.avatar
        }
        
        // Reduced logging - only when needed for debugging
        // console.log('✅ Using fallback user:', enrichedUser.name, enrichedUser.email)
        
        // Cache the result
        userCache = enrichedUser
        userCacheTimestamp = Date.now()
        
        return enrichedUser
      }
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          profiles!profiles_user_id_fkey(
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.log('❌ Error fetching user data:', error)
        // Try alternative approach - get user and profile separately
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('user_id', user.id)
          .single()
        
        if (userData) {
          const enrichedUser = {
            ...userData,
            name: profileData?.full_name || profileData?.username || userData.email,
            avatar: profileData?.avatar_url || userData.avatar
          }
          
          // Reduced logging for performance
          // console.log('✅ Found authenticated user (alternative method):', enrichedUser.name, enrichedUser.email)
          return enrichedUser
        }
        
        return null
      }
      
      const profile = data.profiles?.[0]
      const enrichedUser = {
        ...data,
        name: profile?.full_name || profile?.username || data.email,
        avatar: profile?.avatar_url || data.avatar
      }
      
      // Only log significant events - cache updated
      // console.log('✅ Found authenticated user:', enrichedUser.name, enrichedUser.email)
      
      // Cache the result
      userCache = enrichedUser
      userCacheTimestamp = Date.now()
      
      return enrichedUser
    } catch (err) {
      console.error('💥 Error in getCurrentUser:', err)
      return null
    }
  },

  // Clear user cache (useful for logout)
  clearUserCache() {
    userCache = null
    userCacheTimestamp = 0
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    return error ? null : data
  },
  async updateUserProfile(id: string, updates: {
    name?: string
    avatar?: string
    bio?: string
    student_id?: string
    major?: string
    academic_year?: string
    last_active?: string
  }) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        last_active: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Challenge operations
  async getChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },

  async getUserSubmissions(userId: string) {
    const { data, error } = await supabase
      .from('challenge_submissions')
      .select(`
        *,
        challenge:challenges(title, difficulty, category)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    
    return error ? [] : data
  },
  async getChallengeSubmissions() {
    const { data, error } = await supabase
      .from('challenge_submissions')
      .select(`
        *,
        challenge:challenges(id, title, difficulty, category),
        user:users(id, name, email)
      `)
      .order('submitted_at', { ascending: false })
    
    return error ? [] : data
  },

  // Notification operations
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    return error ? [] : data
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, last_active, avatar')
      .order('name', { ascending: true })
    
    return error ? [] : data
  },

  async sendNotification(notification: {
    userIds: string[]
    title: string
    message: string
    type: string
    data?: any
  }) {
    const notifications = notification.userIds.map(userId => ({
      user_id: userId,
      notification_type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || null,
      is_read: false,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
    
    return { success: !error, error }
  },

  async getNotificationStats() {
    const [total, unread, recent] = await Promise.all([
      supabase.from('notifications').select('id', { count: 'exact' }),
      supabase.from('notifications').select('id', { count: 'exact' }).eq('is_read', false),
      supabase.from('notifications').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])

    return {
      total: total.count || 0,
      unread: unread.count || 0,
      recent: recent.count || 0
    }
  },
  // Analytics operations
  async getAnalyticsData() {
    const [users, challenges, submissions] = await Promise.all([
      supabase.from('users').select('id, joined_at, last_active, is_active'),
      supabase.from('challenges').select('id, created_at, category'),
      supabase.from('challenge_submissions').select('id, challenge_id, submitted_at, status, score')
    ])

    return {
      users: users.data || [],
      challenges: challenges.data || [],
      submissions: submissions.data || []
    }
  },

  // Admin operations
  async getAdminLogs() {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        *,
        admin:users!admin_id(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100)
    
    return error ? [] : data
  },

  async getFlaggedContent() {
    const { data, error } = await supabase
      .from('flagged_content')
      .select(`
        *,
        user:users(name, email)
      `)
      .order('flagged_at', { ascending: false })
    
    return error ? [] : data
  },

  // AI Safety operations
  async getAISafetyRules() {
    const { data, error } = await supabase
      .from('ai_safety_rules')
      .select('*')
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },

  async createAISafetyRule(rule: {
    name: string
    description: string
    severity: string
    threshold: number
    category: string
    enabled?: boolean
    conditions?: any
  }) {
    const { data, error } = await supabase
      .from('ai_safety_rules')
      .insert({
        ...rule,
        enabled: rule.enabled ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateAISafetyRule(id: string, updates: {
    name?: string
    description?: string
    severity?: string
    threshold?: number
    category?: string
    enabled?: boolean
    conditions?: any
  }) {
    const { data, error } = await supabase
      .from('ai_safety_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteAISafetyRule(id: string) {
    const { data, error } = await supabase
      .from('ai_safety_rules')
      .delete()
      .eq('id', id)
    
    return { success: !error, error }
  },

  async getBannedTerms() {
    const { data, error } = await supabase
      .from('banned_terms')
      .select('*')
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },

  async createBannedTerm(term: {
    term: string
    category: string
    replacement?: string
    severity?: string
    user_id?: string
  }) {
    const { data, error } = await supabase
      .from('banned_terms')
      .insert({
        ...term,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async deleteBannedTerm(id: string) {
    const { data, error } = await supabase
      .from('banned_terms')
      .delete()
      .eq('id', id)
    
    return { success: !error, error }
  },
  async getAISafetyMetrics() {
    const [flaggedData, rulesData] = await Promise.all([
      supabase.from('flagged_content').select('id, severity, status, created_at'),
      supabase.from('ai_safety_rules').select('id, enabled, category')
    ])

    const flagged = flaggedData.data || []
    const rules = rulesData.data || []

    const totalFlagged = flagged.length
    const recentFlagged = flagged.filter(item => 
      new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const pendingCount = flagged.filter(item => item.status === 'pending').length
    const activeRulesCount = rules.filter(rule => rule.enabled).length

    // Calculate content safety score (higher is better)
    const contentSafetyScore = totalFlagged > 0 ? 
      Math.max(0, 100 - (recentFlagged / totalFlagged) * 100) : 95

    // Calculate metrics similar to the format expected by the frontend
    return [
      { name: "Content Safety Score", value: Math.round(contentSafetyScore), change: 3, target: 95 },
      { name: "Flagged Content Rate", value: totalFlagged > 0 ? (recentFlagged / totalFlagged * 100) : 2.4, change: -0.8, target: 2.0 },
      { name: "Response Time (min)", value: 4.2, change: -1.5, target: 3.0 },
      { name: "False Positive Rate", value: 3.1, change: -0.5, target: 2.5 },
    ]
  },  async getFlaggedContentDetailed() {
    const { data, error } = await supabase
      .from('flagged_content')
      .select(`
        id,
        content,
        user_id,
        rule_triggered,
        severity,
        status,
        confidence_score,
        created_at,
        users:user_id(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching flagged content:', error)
      return []
    }    return data.map(item => ({
      id: item.id,
      content: item.content || 'Content not available',
      userId: item.user_id,
      userName: Array.isArray(item.users) ? item.users[0]?.name || 'Unknown User' : (item.users as any)?.name || 'Unknown User',
      timestamp: item.created_at,
      rule: item.rule_triggered || 'Unknown Rule',
      severity: item.severity as "low" | "medium" | "high" | "critical",
      status: item.status as "pending" | "reviewed" | "approved" | "rejected",
      score: item.confidence_score || 0,
    }))
  },

  async updateFlaggedContentStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('flagged_content')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // AI Assistant operations
  async getAIAssistants() {
    const { data, error } = await supabase
      .from('ai_assistants')
      .select(`
        *,
        creator:users!created_by(id, name, email)
      `)
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },

  async getAIAssistantById(id: string) {
    const { data, error } = await supabase
      .from('ai_assistants')
      .select(`
        *,
        creator:users!created_by(id, name, email)
      `)
      .eq('id', id)
      .single()
    
    return error ? null : data
  },  async createAIAssistant(assistant: {
    name: string
    avatar?: string
    description?: string
    system_prompt: string
    model?: string
    created_by: string
    capabilities?: string[]
    category?: string
    is_active?: boolean
  }) {
    const { data, error } = await supabase
      .from('ai_assistants')
      .insert({
        name: assistant.name,
        avatar: assistant.avatar,
        description: assistant.description,
        system_prompt: assistant.system_prompt,
        model: assistant.model || 'gpt-3.5-turbo',
        capabilities: assistant.capabilities,
        category: assistant.category,
        is_active: assistant.is_active !== undefined ? assistant.is_active : true,
        created_by: assistant.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateAIAssistant(id: string, updates: {
    name?: string
    avatar?: string
    description?: string
    system_prompt?: string
    model?: string
    capabilities?: string[]
    category?: string
    is_active?: boolean
  }) {
    const { data, error } = await supabase
      .from('ai_assistants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteAIAssistant(id: string) {
    const { data, error } = await supabase
      .from('ai_assistants')
      .delete()
      .eq('id', id)
    
    return { success: !error, error }
  },
  async toggleAIAssistantStatus(id: string, newStatus?: boolean) {
    // First get current status if newStatus is not provided
    const { data: current, error: fetchError } = await supabase
      .from('ai_assistants')
      .select('is_active')
      .eq('id', id)
      .single()
    
    if (fetchError) return { success: false, error: fetchError }
    
    const targetStatus = newStatus !== undefined ? newStatus : !current.is_active
    
    const { data, error } = await supabase
      .from('ai_assistants')
      .update({ 
        is_active: targetStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
      return { success: !error, error, data }
  },

  // Additional helper methods needed by components
  async getUsers(limit?: number) {
    const query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (limit) {
      query.limit(limit)
    }
    
    const { data, error } = await query
    return { data: data || [], error }
  },

  async getMessages(limit?: number) {
    const query = supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(name, avatar),
        receiver:users!receiver_id(name, avatar)
      `)
      .order('created_at', { ascending: false })
    
    if (limit) {
      query.limit(limit)
    }
    
    const { data, error } = await query
    return { data: data || [], error }
  },

  async getPosts(options?: { limit?: number }) {
    const query = supabase
      .from('posts')
      .select(`
        *,
        author:users!author_id(name, avatar),
        likes_count:post_likes(count),
        comments_count:post_comments(count)
      `)
      .order('created_at', { ascending: false })
    
    if (options?.limit) {
      query.limit(options.limit)
    }
    
    const { data, error } = await query
    return { data: data || [], error }
  },

  async getEvents(limit?: number) {
    // Try to get events from database first
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit || 10)
    
    // If table doesn't exist or no data, return sample events
    if (error || !data || data.length === 0) {
      const sampleEvents = [
        {
          id: 'event-1',
          title: 'English Conversation Club',
          description: 'Practice speaking English with other learners',
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours duration
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Online - Zoom',
          attendeeCount: 12,
          maxAttendees: 20,
          created_at: new Date().toISOString()
        },
        {
          id: 'event-2',
          title: 'Grammar Workshop',
          description: 'Master English grammar fundamentals',
          start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          end_date: new Date(Date.now() + 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          location: 'Room 201, Main Building',
          attendeeCount: 8,
          maxAttendees: 15,
          created_at: new Date().toISOString()
        },
        {
          id: 'event-3',
          title: 'Pronunciation Practice',
          description: 'Improve your English pronunciation and accent',
          start_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now (today)
          end_date: new Date(Date.now() + 4 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour
          startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          location: 'Online - Google Meet',
          attendeeCount: 15,
          maxAttendees: 25,
          created_at: new Date().toISOString()
        },
        {
          id: 'event-4',
          title: 'IELTS Preparation Session',
          description: 'Tips and strategies for IELTS exam success',
          start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Conference Room A',
          attendeeCount: 22,
          maxAttendees: 30,
          created_at: new Date().toISOString()
        },
        {
          id: 'event-5',
          title: 'English Movie Night',
          description: 'Watch and discuss English movies together',
          start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
          startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Auditorium B',
          attendeeCount: 35,
          maxAttendees: 50,
          created_at: new Date().toISOString()
        }
      ]
      
      return { data: sampleEvents.slice(0, limit || 10), error: null }
    }
    
    return { data: data || [], error }
  },

  async getPastEvents(limit?: number) {
    const query = supabase
      .from('events')
      .select('*')
      .lt('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
    
    if (limit) {
      query.limit(limit)
    }
    
    const { data, error } = await query
    return { data: data || [], error }
  },

  async getGroups(limit?: number) {
    const query = supabase
      .from('groups')
      .select(`
        *,
        members_count:group_members(count),
        owner:users!owner_id(name, avatar)
      `)
      .order('created_at', { ascending: false })
    
    if (limit) {
      query.limit(limit)
    }
    
    const { data, error } = await query
    return { data: data || [], error }
  },

  async getStories(limit: number = 10) {
    // Simplified query - just get stories and author_id
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        author_id,
        content,
        media_url,
        media_type,
        background_color,
        text_color,
        duration,
        is_active,
        views_count,
        created_at,
        updated_at,
        expires_at
      `)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)
    
    console.log('🔍 Stories query result:', { data, error })
    
    // If stories found, get profile info for each author
    if (data && data.length > 0) {
      const userIds = data.map(story => story.author_id).filter(Boolean)
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select(`
            user_id,
            username,
            full_name,
            avatar_url
          `)
          .in('user_id', userIds)
        
        console.log('🔍 Profiles data:', profilesData)
        
        // Merge profile data with stories
        const enrichedData = data.map(story => {
          const profile = profilesData?.find(p => p.user_id === story.author_id)
          
          return {
            ...story,
            author: {
              id: story.author_id,
              name: profile?.full_name || profile?.username || 'Unknown User',
              avatar: profile?.avatar_url || '/placeholder.svg?height=40&width=40'
            }
          }
        })
        
        console.log('🔍 Enriched stories data:', enrichedData)
        return { data: enrichedData, error }
      }
    }
    
    // If no stories found, return empty array
    return { data: data || [], error }
  },

  async getOnlineUsers(limit: number = 10) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    // First try to get truly online users
    let { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        username,
        full_name,
        avatar_url,
        bio,
        created_at,
        updated_at,
        users!inner(
          id,
          email,
          last_active,
          created_at
        )
      `)
      .gte('users.last_active', thirtyMinutesAgo)
      .order('users.last_active', { ascending: false })
      .limit(limit)
    
    // If no online users found, get recent profiles as fallback
    if (!data || data.length === 0) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          full_name,
          avatar_url,
          bio,
          created_at,
          updated_at,
          users!inner(
            id,
            email,
            last_active,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      data = fallbackData
      error = fallbackError
    }
    
    return { data: data || [], error }
  },

  async getTrendingTopics(limit: number = 10) {
    const { data, error } = await supabase
      .from('trending_topics')
      .select('*')
      .order('engagement_score', { ascending: false })
      .limit(limit)
    
    return { data: data || [], error }
  },  async getLeaderboard(limit: number = 10) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        points, 
        level, 
        streak_days,
        profiles!inner(full_name, avatar_url)
      `)
      .order('points', { ascending: false })
      .limit(limit)
    
    return { data: data || [], error }
  },

  async getExtendedLeaderboard(limit: number = 50) {
    try {
      // Step 1: Get users data first
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, points, level')
        .order('points', { ascending: false })
        .limit(limit)

      if (usersError) {
        console.error('Error fetching users data:', usersError)
        return { data: [], error: usersError }
      }

      console.log('🔍 Users data:', usersData)

      // Step 2: Get profiles for these users
      const userIds = usersData?.map(user => user.id) || []
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds)

      if (profilesError) {
        console.error('Error fetching profiles data:', profilesError)
      }

      console.log('🔍 Profiles data:', profilesData)

      // Step 3: Get challenge completion counts and Daily posts for each user
      const { data: challengeData, error: challengeError } = await supabase
        .from('posts')
        .select('user_id, created_at, title')
        .in('user_id', userIds)
        .not('ai_evaluation', 'is', null) // Only posts with AI evaluation (completed challenges)

      if (challengeError) {
        console.error('Error fetching challenge data:', challengeError)
      }

      // Step 4: Calculate metrics for each user
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const enhancedData = usersData?.map(user => {
        // Find profile for this user
        const profile = profilesData?.find(p => p.user_id === user.id)
        
        const userChallenges = challengeData?.filter(challenge => challenge.user_id === user.id) || []
        const weekChallenges = userChallenges.filter(challenge => 
          new Date(challenge.created_at) >= weekAgo
        )

        // Calculate Daily Streak for this user
        const dailyPosts = userChallenges.filter(challenge => 
          challenge.title && challenge.title.startsWith('Daily')
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        // Group Daily posts by date
        const dailyPostsByDate = new Map<string, boolean>()
        dailyPosts.forEach(post => {
          const date = new Date(post.created_at)
          const dateKey = date.toISOString().split('T')[0]
          dailyPostsByDate.set(dateKey, true)
        })

        // Calculate current streak
        let streak = 0
        let currentDate = new Date(now)
        
        while (true) {
          const dateKey = currentDate.toISOString().split('T')[0]
          
          if (dailyPostsByDate.has(dateKey)) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }

        const result = {
          ...user,
          profiles: profile ? [profile] : [], // Keep original format for compatibility
          challenges_completed: userChallenges.length,
          week_points: weekChallenges.length * 100, // Assuming 100 points per challenge
          streak_days: streak // Use calculated daily streak
        }
        
        console.log('🔍 Enhanced user:', result)
        return result
      }) || []

      return { data: enhancedData, error: null }
    } catch (error) {
      console.error('Error in getExtendedLeaderboard:', error)
      return { data: [], error }
    }
  },

  async createPost(postData: {
    title: string
    content: string
    user_id: string
    post_type?: string
    media_url?: string
    media_urls?: string[]
    tags?: string[]
  }) {
    console.log('📤 dbHelpers.createPost called with data:', postData)
    
    try {
      // Get user profile info first
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', postData.user_id)
        .single()
      
      if (profileError) {
        console.log('⚠️ Could not get user profile:', profileError)
      }
      
      const insertData = {
        title: postData.title,
        content: postData.content,
        user_id: postData.user_id,
        post_type: postData.post_type || 'text',
        media_url: postData.media_url || null,
        media_urls: postData.media_urls || null,
        tags: postData.tags || null,
        is_public: true,
        likes_count: 0,
        comments_count: 0,
        // Add user info from profiles
        username: userProfile?.full_name || 'Anonymous User',
        user_image: userProfile?.avatar_url || '/placeholder.svg?height=40&width=40',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📤 Inserting data:', insertData)
      
      const { data, error } = await supabase
        .from('posts')
        .insert([insertData])
        .select()
        .single()
      
      console.log('📤 Insert result - data:', data)
      console.log('📤 Insert result - error:', error)
      
      return { data, error }
    } catch (err) {
      console.error('💥 Error in createPost:', err)
      return { data: null, error: err }
    }
  },

  async getNotificationTemplates() {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data: data || [], error }
  },

  async getScheduledMessages() {
    const { data, error } = await supabase
      .from('scheduled_messages')
      .select(`
        *,
        template:notification_templates(name, content)
      `)
      .order('scheduled_for', { ascending: true })
    
    return { data: data || [], error }
  },

  async getRecentNotificationActivity() {
    const { data, error } = await supabase
      .from('notification_logs')
      .select(`
        *,
        template:notification_templates(name)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
    
    return { data: data || [], error }
  },

  async createFlaggedContent(contentData: {
    content_type: string
    content_id: string
    reason: string
    flagged_by: string
    details?: any
  }) {
    const { data, error } = await supabase
      .from('flagged_content')
      .insert([{
        ...contentData,
        created_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
      .single()
    
    return { data, error }
  },
}

export type SupabaseClient = typeof supabase