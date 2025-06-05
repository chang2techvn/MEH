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

  // Admin resource operations
  async getAdminResources() {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        uploader:users!uploaded_by(name, email)
      `)
      .order('updated_at', { ascending: false })
    
    return error ? [] : data
  },

  async getResourceById(id: string) {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        uploader:users!uploaded_by(name, email)
      `)
      .eq('id', id)
      .single()
    
    return error ? null : data
  },

  async createResource(resource: {
    title: string
    description?: string
    content?: string
    type: string
    category: string
    tags?: string[]
    difficulty?: string
    file_url?: string
    thumbnail_url?: string
    duration?: number
    size?: number
    is_public?: boolean
    is_active?: boolean
    metadata?: any
    uploaded_by: string
  }) {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...resource,
        downloads: 0,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateResource(id: string, updates: {
    title?: string
    description?: string
    content?: string
    type?: string
    category?: string
    tags?: string[]
    difficulty?: string
    file_url?: string
    thumbnail_url?: string
    duration?: number
    size?: number
    is_public?: boolean
    is_active?: boolean
    metadata?: any
  }) {
    const { data, error } = await supabase
      .from('resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteResource(id: string) {
    const { data, error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
    
    return { success: !error, error }
  },

  async bulkUpdateResources(ids: string[], updates: {
    is_public?: boolean
    is_active?: boolean
    category?: string
    difficulty?: string
  }) {
    const { data, error } = await supabase
      .from('resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select()
    
    return { data, error }
  },

  async bulkDeleteResources(ids: string[]) {
    const { data, error } = await supabase
      .from('resources')
      .delete()
      .in('id', ids)
    
    return { success: !error, error }
  },

  async incrementResourceViews(id: string) {
    const { data, error } = await supabase
      .rpc('increment_resource_views', { resource_id: id })
    
    return { success: !error, error }
  },

  async incrementResourceDownloads(id: string) {
    const { data, error } = await supabase
      .rpc('increment_resource_downloads', { resource_id: id })
    
    return { success: !error, error }
  },
  async getResourceAnalytics() {
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, type, category, difficulty, views, downloads, is_public, is_active, created_at')
    
    if (error) return null

    const totalResources = data.length
    const totalViews = data.reduce((sum, resource) => sum + (resource.views || 0), 0)
    const totalDownloads = data.reduce((sum, resource) => sum + (resource.downloads || 0), 0)
    
    const resourcesByType = data.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const resourcesByCategory = data.reduce((acc, resource) => {
      acc[resource.category] = (acc[resource.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const resourcesByDifficulty = data.reduce((acc, resource) => {
      const level = resource.difficulty || 'all-levels'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topResources = data
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(resource => ({
        title: resource.title || 'Untitled',
        views: resource.views || 0
      }))

    return {
      totalResources,
      totalViews,
      totalDownloads,
      totalLikes: 0, // Not implemented in current schema
      resourcesByType: Object.entries(resourcesByType).map(([type, count]) => ({ type, count })),
      resourcesByCategory: Object.entries(resourcesByCategory).map(([category, count]) => ({ category, count })),
      resourcesByLevel: Object.entries(resourcesByDifficulty).map(([level, count]) => ({ level, count })),
      topResources
    }
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
  },

  // AI Generation operations
  async getAIGenerationTemplates() {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },

  async createAIGenerationTemplate(template: {
    name: string
    description: string
    prompt: string
    category: string
    icon?: string
    is_active?: boolean
  }) {
    const { data, error } = await supabase
      .from('ai_models')
      .insert({
        ...template,
        model_type: 'template',
        is_active: template.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateAIGenerationTemplate(id: string, updates: {
    name?: string
    description?: string
    prompt?: string
    category?: string
    icon?: string
    is_active?: boolean
  }) {
    const { data, error } = await supabase
      .from('ai_models')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteAIGenerationTemplate(id: string) {
    const { data, error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', id)
    
    return { success: !error, error }
  },

  async getAIGenerationHistory(limit: number = 50) {
    const { data, error } = await supabase
      .from('evaluation_logs')
      .select(`
        *,
        user:users(name, email)
      `)
      .eq('type', 'ai_generation')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return error ? [] : data
  },

  async saveAIGenerationResult(generation: {
    title: string
    type: string
    prompt: string
    content: string
    parameters?: any
    user_id?: string
    template_id?: string
  }) {
    const { data, error } = await supabase
      .from('evaluation_logs')
      .insert({
        type: 'ai_generation',
        input_data: {
          title: generation.title,
          type: generation.type,
          prompt: generation.prompt,
          parameters: generation.parameters,
          template_id: generation.template_id
        },
        output_data: {
          content: generation.content
        },
        user_id: generation.user_id,
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getAIGenerationStats() {
    const { data, error } = await supabase
      .from('evaluation_logs')
      .select('id, type, status, created_at, input_data')
      .eq('type', 'ai_generation')
    
    if (error) return null

    const totalGenerations = data.length
    const completedGenerations = data.filter(log => log.status === 'completed').length
    const recentGenerations = data.filter(log => 
      new Date(log.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    // Count generations by type
    const generationsByType = data.reduce((acc, log) => {
      const type = log.input_data?.type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalGenerations,
      completedGenerations,
      recentGenerations,
      successRate: totalGenerations > 0 ? Math.round((completedGenerations / totalGenerations) * 100) : 0,
      generationsByType: Object.entries(generationsByType).map(([type, count]) => ({ type, count }))
    }
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
  }
}

export type SupabaseClient = typeof supabase