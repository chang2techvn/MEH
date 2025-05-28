export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar: string | null
          role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST'
          student_id: string | null
          major: string | null
          academic_year: string | null
          bio: string | null
          points: number
          level: number
          experience_points: number
          streak_days: number
          last_active: string
          joined_at: string
          is_active: boolean
          preferences: Json | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar?: string | null
          role?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST'
          student_id?: string | null
          major?: string | null
          academic_year?: string | null
          bio?: string | null
          points?: number
          level?: number
          experience_points?: number
          streak_days?: number
          last_active?: string
          joined_at?: string
          is_active?: boolean
          preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar?: string | null
          role?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST'
          student_id?: string | null
          major?: string | null
          academic_year?: string | null
          bio?: string | null
          points?: number
          level?: number
          experience_points?: number
          streak_days?: number
          last_active?: string
          joined_at?: string
          is_active?: boolean
          preferences?: Json | null
        }
      }
      conversations: {
        Row: {
          id: string
          type: 'PRIVATE' | 'GROUP' | 'CHANNEL' | 'AI_CHAT'
          name: string | null
          description: string | null
          is_group: boolean
          max_members: number | null
          created_at: string
          updated_at: string
          last_message_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          type?: 'PRIVATE' | 'GROUP' | 'CHANNEL' | 'AI_CHAT'
          name?: string | null
          description?: string | null
          is_group?: boolean
          max_members?: number | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          type?: 'PRIVATE' | 'GROUP' | 'CHANNEL' | 'AI_CHAT'
          name?: string | null
          description?: string | null
          is_group?: boolean
          max_members?: number | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
          is_active?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string | null
          content: string
          type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM' | 'AI_RESPONSE'
          attachments: Json | null
          metadata: Json | null
          is_edited: boolean
          edited_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id?: string | null
          content: string
          type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM' | 'AI_RESPONSE'
          attachments?: Json | null
          metadata?: Json | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string | null
          content?: string
          type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM' | 'AI_RESPONSE'
          attachments?: Json | null
          metadata?: Json | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          instructions: string
          difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
          category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'PRONUNCIATION' | 'CONVERSATION' | 'BUSINESS_ENGLISH' | 'IELTS_PREP' | 'TOEFL_PREP'
          type: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'ESSAY' | 'SPEAKING_RECORDING' | 'LISTENING_COMPREHENSION' | 'VOCABULARY_BUILDING' | 'GRAMMAR_EXERCISE' | 'CONVERSATION_PRACTICE' | 'VIDEO_SUBMISSION'
          points: number
          time_limit: number | null
          max_attempts: number | null
          is_active: boolean
          is_public: boolean
          tags: string[]
          resources: Json | null
          evaluation_criteria: Json | null
          created_at: string
          updated_at: string
          start_date: string | null
          end_date: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          instructions: string
          difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
          category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'PRONUNCIATION' | 'CONVERSATION' | 'BUSINESS_ENGLISH' | 'IELTS_PREP' | 'TOEFL_PREP'
          type: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'ESSAY' | 'SPEAKING_RECORDING' | 'LISTENING_COMPREHENSION' | 'VOCABULARY_BUILDING' | 'GRAMMAR_EXERCISE' | 'CONVERSATION_PRACTICE' | 'VIDEO_SUBMISSION'
          points?: number
          time_limit?: number | null
          max_attempts?: number | null
          is_active?: boolean
          is_public?: boolean
          tags?: string[]
          resources?: Json | null
          evaluation_criteria?: Json | null
          created_at?: string
          updated_at?: string
          start_date?: string | null
          end_date?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          instructions?: string
          difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
          category?: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'PRONUNCIATION' | 'CONVERSATION' | 'BUSINESS_ENGLISH' | 'IELTS_PREP' | 'TOEFL_PREP'
          type?: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'ESSAY' | 'SPEAKING_RECORDING' | 'LISTENING_COMPREHENSION' | 'VOCABULARY_BUILDING' | 'GRAMMAR_EXERCISE' | 'CONVERSATION_PRACTICE' | 'VIDEO_SUBMISSION'
          points?: number
          time_limit?: number | null
          max_attempts?: number | null
          is_active?: boolean
          is_public?: boolean
          tags?: string[]
          resources?: Json | null
          evaluation_criteria?: Json | null
          created_at?: string
          updated_at?: string
          start_date?: string | null
          end_date?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          type: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'PRESENTATION' | 'QUIZ' | 'EXERCISE' | 'LINK'
          category: string
          tags: string[]
          difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null
          file_url: string | null
          thumbnail_url: string | null
          duration: number | null
          size: number | null
          downloads: number
          views: number
          is_public: boolean
          is_active: boolean
          metadata: Json | null
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          type: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'PRESENTATION' | 'QUIZ' | 'EXERCISE' | 'LINK'
          category: string
          tags?: string[]
          difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null
          file_url?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          size?: number | null
          downloads?: number
          views?: number
          is_public?: boolean
          is_active?: boolean
          metadata?: Json | null
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          type?: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'PRESENTATION' | 'QUIZ' | 'EXERCISE' | 'LINK'
          category?: string
          tags?: string[]
          difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null
          file_url?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          size?: number | null
          downloads?: number
          views?: number
          is_public?: boolean
          is_active?: boolean
          metadata?: Json | null
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          sender_id: string | null
          type: 'SYSTEM' | 'MESSAGE' | 'CHALLENGE' | 'ACHIEVEMENT' | 'REMINDER' | 'ANNOUNCEMENT' | 'FRIEND_REQUEST' | 'EVALUATION_COMPLETE'
          title: string
          message: string
          data: Json | null
          is_read: boolean
          is_archived: boolean
          priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          created_at: string
          read_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          sender_id?: string | null
          type: 'SYSTEM' | 'MESSAGE' | 'CHALLENGE' | 'ACHIEVEMENT' | 'REMINDER' | 'ANNOUNCEMENT' | 'FRIEND_REQUEST' | 'EVALUATION_COMPLETE'
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          is_archived?: boolean
          priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          created_at?: string
          read_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          sender_id?: string | null
          type?: 'SYSTEM' | 'MESSAGE' | 'CHALLENGE' | 'ACHIEVEMENT' | 'REMINDER' | 'ANNOUNCEMENT' | 'FRIEND_REQUEST' | 'EVALUATION_COMPLETE'
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          is_archived?: boolean
          priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          created_at?: string
          read_at?: string | null
          expires_at?: string | null
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_BAN' | 'USER_UNBAN' | 'CONTENT_DELETE' | 'CONTENT_FLAG' | 'CONTENT_APPROVE' | 'CHALLENGE_CREATE' | 'CHALLENGE_UPDATE' | 'CHALLENGE_DELETE' | 'RESOURCE_CREATE' | 'RESOURCE_UPDATE' | 'RESOURCE_DELETE' | 'SYSTEM_CONFIG' | 'SAFETY_RULE_UPDATE' | 'API_KEY_CREATE' | 'API_KEY_DELETE'
          target: string | null
          target_type: string | null
          description: string
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_BAN' | 'USER_UNBAN' | 'CONTENT_DELETE' | 'CONTENT_FLAG' | 'CONTENT_APPROVE' | 'CHALLENGE_CREATE' | 'CHALLENGE_UPDATE' | 'CHALLENGE_DELETE' | 'RESOURCE_CREATE' | 'RESOURCE_UPDATE' | 'RESOURCE_DELETE' | 'SYSTEM_CONFIG' | 'SAFETY_RULE_UPDATE' | 'API_KEY_CREATE' | 'API_KEY_DELETE'
          target?: string | null
          target_type?: string | null
          description: string
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_BAN' | 'USER_UNBAN' | 'CONTENT_DELETE' | 'CONTENT_FLAG' | 'CONTENT_APPROVE' | 'CHALLENGE_CREATE' | 'CHALLENGE_UPDATE' | 'CHALLENGE_DELETE' | 'RESOURCE_CREATE' | 'RESOURCE_UPDATE' | 'RESOURCE_DELETE' | 'SYSTEM_CONFIG' | 'SAFETY_RULE_UPDATE' | 'API_KEY_CREATE' | 'API_KEY_DELETE'
          target?: string | null
          target_type?: string | null
          description?: string
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      flagged_content: {
        Row: {
          id: string
          content_id: string
          content_type: 'MESSAGE' | 'SUBMISSION' | 'RESOURCE' | 'USER_PROFILE' | 'COMMENT'
          user_id: string | null
          reason: string
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          flagged_at: string
        }
        Insert: {
          id?: string
          content_id: string
          content_type: 'MESSAGE' | 'SUBMISSION' | 'RESOURCE' | 'USER_PROFILE' | 'COMMENT'
          user_id?: string | null
          reason: string
          severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          status?: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          flagged_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          content_type?: 'MESSAGE' | 'SUBMISSION' | 'RESOURCE' | 'USER_PROFILE' | 'COMMENT'
          user_id?: string | null
          reason?: string
          severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          status?: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          flagged_at?: string
        }
      }
      ai_models: {
        Row: {
          id: string
          name: string
          provider: string
          model_id: string
          version: string | null
          description: string | null
          capabilities: string[]
          max_tokens: number | null
          cost_per_token: number | null
          is_active: boolean
          configuration: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          provider: string
          model_id: string
          version?: string | null
          description?: string | null
          capabilities?: string[]
          max_tokens?: number | null
          cost_per_token?: number | null
          is_active?: boolean
          configuration?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider?: string
          model_id?: string
          version?: string | null
          description?: string | null
          capabilities?: string[]
          max_tokens?: number | null
          cost_per_token?: number | null
          is_active?: boolean
          configuration?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          name: string
          provider: string
          key_hash: string
          is_active: boolean
          usage_count: number
          last_used: string | null
          rate_limit: number | null
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          name: string
          provider: string
          key_hash: string
          is_active?: boolean
          usage_count?: number
          last_used?: string | null
          rate_limit?: number | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          provider?: string
          key_hash?: string
          is_active?: boolean
          usage_count?: number
          last_used?: string | null
          rate_limit?: number | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
