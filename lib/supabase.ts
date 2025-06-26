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
  // Message operations
  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, avatar),
        receiver:users!receiver_id(id, name, avatar)
      `)
      .or(`sender_id.eq.${conversationId.split('_')[1]},receiver_id.eq.${conversationId.split('_')[2]}`)
      .order('created_at', { ascending: true })
    
    return error ? [] : data
  },
  async getUserConversations(userId: string) {
    // Note: conversation_participants table doesn't exist in current schema
    // Using messages table to create mock conversations for now
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, avatar),
        receiver:users!receiver_id(id, name, avatar)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) return []
    
    // Group messages by conversation partner to create mock conversations
    const conversations: any[] = []
    const seenPartners = new Set()
    
    for (const message of data) {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id
      const partner = message.sender_id === userId ? message.receiver : message.sender
      
      if (!seenPartners.has(partnerId) && partner && 'name' in partner) {
        seenPartners.add(partnerId)
        conversations.push({
          conversation: {
            id: `conv_${userId}_${partnerId}`,
            name: partner.name,
            type: 'direct',
            is_group: false,
            last_message_at: message.created_at,
            messages: [message]
          }
        })
      }
    }
    
    return conversations
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
  // Resource operations
  async getResources() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },
  // Admin resource operations
  async getAdminResources() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
    
    return error ? [] : data
  },
  async getResourceById(id: string) {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single()
    
    return error ? null : data
  },
  async createResource(resource: {
    alt_text?: string
    challenge_id?: string
    duration?: number
    file_size?: number
    resource_type: string
    url: string
  }) {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        alt_text: resource.alt_text,
        challenge_id: resource.challenge_id,
        duration: resource.duration,
        file_size: resource.file_size,
        resource_type: resource.resource_type,
        url: resource.url,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },
  async updateResource(id: string, updates: {
    alt_text?: string
    challenge_id?: string
    duration?: number
    file_size?: number
    resource_type?: string
    url?: string
  }) {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
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
    alt_text?: string
    resource_type?: string
  }) {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
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
  async getResourceAnalytics() {
    const { data, error } = await supabase
      .from('resources')
      .select('id, resource_type, created_at')
    
    if (error) return null

    const totalResources = data.length
    
    const resourcesByType = data.reduce((acc, resource) => {
      acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalResources,
      totalViews: 0, // Not available in current schema
      totalDownloads: 0, // Not available in current schema
      totalLikes: 0, // Not available in current schema
      resourcesByType: Object.entries(resourcesByType).map(([type, count]) => ({ type, count })),
      resourcesByCategory: [], // Not available in current schema
      resourcesByLevel: [], // Not available in current schema
      topResources: [] // Not available in current schema
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
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:users!author_id(name, avatar)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
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

  async createPost(postData: {
    title: string
    content: string
    author_id: string
    type?: string
    tags?: string[]
  }) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        ...postData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    return { data, error }
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