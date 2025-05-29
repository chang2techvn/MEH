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
    }
  }
})

// Helper functions for common database operations
export const dbHelpers = {
  // User operations
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return error ? null : data
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
    studentId?: string
    major?: string
    academicYear?: string
    lastActive?: string
  }) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        lastActive: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Message operations
  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, avatar),
        receiver:users!receiver_id(id, name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    return error ? [] : data
  },

  async getUserConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation:conversations(
          id,
          name,
          type,
          is_group,
          last_message_at,
          messages(id, content, created_at, sender:users!sender_id(name, avatar))
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
    
    return error ? [] : data
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

  // Resource operations
  async getResources() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },
  // Notification operations
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:users!sender_id(name, avatar)
      `)
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
    senderId?: string
  }) {
    const notifications = notification.userIds.map(userId => ({
      user_id: userId,
      sender_id: notification.senderId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
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
    const [users, messages, challenges, submissions] = await Promise.all([
      supabase.from('users').select('id, joined_at, last_active, is_active'),
      supabase.from('messages').select('id, created_at'),
      supabase.from('challenges').select('id, created_at, category'),
      supabase.from('challenge_submissions').select('id, challenge_id, submitted_at, status, score')
    ])

    return {
      users: users.data || [],
      messages: messages.data || [],
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
  }
}

export type SupabaseClient = typeof supabase