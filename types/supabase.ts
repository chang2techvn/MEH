export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_url: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          points_reward: number | null
          title: string
        }
        Insert: {
          badge_url?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          title: string
        }
        Update: {
          badge_url?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          title?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          capabilities: string[] | null
          configuration: Json | null
          cost_per_token: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          name: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          capabilities?: string[] | null
          configuration?: Json | null
          cost_per_token?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          name: string
          provider: string
          updated_at?: string | null
        }
        Update: {
          capabilities?: string[] | null
          configuration?: Json | null
          cost_per_token?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          name?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_safety_rules: {
        Row: {
          configuration: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          rule_type: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rule_type: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rule_type?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          key_hash: string
          last_used: string | null
          name: string
          provider: string
          rate_limit: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          key_hash: string
          last_used?: string | null
          name: string
          provider: string
          rate_limit?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          key_hash?: string
          last_used?: string | null
          name?: string
          provider?: string
          rate_limit?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      banned_terms: {
        Row: {
          action: string | null
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          severity: string | null
          term: string
        }
        Insert: {
          action?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          severity?: string | null
          term: string
        }
        Update: {
          action?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          severity?: string | null
          term?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          ai_evaluation: Json | null
          challenge_id: string | null
          content: string | null
          created_at: string | null
          feedback: string | null
          file_url: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          status: Database["public"]["Enums"]["submission_status"] | null
          submission_type: Database["public"]["Enums"]["challenge_type"] | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_evaluation?: Json | null
          challenge_id?: string | null
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          submission_type?: Database["public"]["Enums"]["challenge_type"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_evaluation?: Json | null
          challenge_id?: string | null
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          submission_type?: Database["public"]["Enums"]["challenge_type"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          category: Database["public"]["Enums"]["challenge_category"]
          created_at: string | null
          created_by: string | null
          daily_batch: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          end_date: string | null
          evaluation_criteria: Json | null
          expires_at: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          is_auto_generated: boolean | null
          is_public: boolean | null
          learning_path_id: string | null
          max_attempts: number | null
          points: number | null
          resources: Json | null
          start_date: string | null
          tags: string[] | null
          time_limit: number | null
          title: string
          type: Database["public"]["Enums"]["challenge_type"]
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["challenge_category"]
          created_at?: string | null
          created_by?: string | null
          daily_batch?: string | null
          description?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          end_date?: string | null
          evaluation_criteria?: Json | null
          expires_at?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_auto_generated?: boolean | null
          is_public?: boolean | null
          learning_path_id?: string | null
          max_attempts?: number | null
          points?: number | null
          resources?: Json | null
          start_date?: string | null
          tags?: string[] | null
          time_limit?: number | null
          title: string
          type: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["challenge_category"]
          created_at?: string | null
          created_by?: string | null
          daily_batch?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          end_date?: string | null
          evaluation_criteria?: Json | null
          expires_at?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_auto_generated?: boolean | null
          is_public?: boolean | null
          learning_path_id?: string | null
          max_attempts?: number | null
          points?: number | null
          resources?: Json | null
          start_date?: string | null
          tags?: string[] | null
          time_limit?: number | null
          title?: string
          type?: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_logs: {
        Row: {
          cost: number | null
          created_at: string | null
          evaluation_type: string
          feedback: string | null
          id: string
          input_data: Json
          model_id: string | null
          output_data: Json
          processing_time: number | null
          score: number | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          evaluation_type: string
          feedback?: string | null
          id?: string
          input_data: Json
          model_id?: string | null
          output_data: Json
          processing_time?: number | null
          score?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          evaluation_type?: string
          feedback?: string | null
          id?: string
          input_data?: Json
          model_id?: string | null
          output_data?: Json
          processing_time?: number | null
          score?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_urls: string[] | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_urls?: string[] | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_urls?: string[] | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          challenge_id: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          challenge_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          challenge_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          gender: string | null
          id: string
          interests: string[] | null
          language_level: Database["public"]["Enums"]["difficulty_level"] | null
          learning_goals: string[] | null
          phone: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          language_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          learning_goals?: string[] | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          language_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          learning_goals?: string[] | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string | null
          challenge_id: string | null
          content: string | null
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          downloads: number | null
          duration: number | null
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          metadata: Json | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string | null
          uploaded_by: string | null
          views: number | null
        }
        Insert: {
          category?: string | null
          challenge_id?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          downloads?: number | null
          duration?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          uploaded_by?: string | null
          views?: number | null
        }
        Update: {
          category?: string | null
          challenge_id?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          downloads?: number | null
          duration?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          uploaded_by?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          criteria: Json
          description: string | null
          id: string
          is_active: boolean | null
          max_score: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          attempts_count: number | null
          best_score: number | null
          challenge_id: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          last_attempt_at: string | null
          learning_path_id: string | null
          time_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attempts_count?: number | null
          best_score?: number | null
          challenge_id?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_attempt_at?: string | null
          learning_path_id?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attempts_count?: number | null
          best_score?: number | null
          challenge_id?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_attempt_at?: string | null
          learning_path_id?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          academic_year: string | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          email: string
          experience_points: number | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_active: string | null
          level: number | null
          major: string | null
          name: string
          points: number | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          streak_days: number | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          experience_points?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          level?: number | null
          major?: string | null
          name: string
          points?: number | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          streak_days?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          experience_points?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          level?: number | null
          major?: string | null
          name?: string
          points?: number | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          streak_days?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      challenge_category:
        | "LISTENING"
        | "SPEAKING"
        | "READING"
        | "WRITING"
        | "GRAMMAR"
        | "VOCABULARY"
      challenge_type:
        | "VIDEO_SUBMISSION"
        | "AUDIO_SUBMISSION"
        | "TEXT_SUBMISSION"
        | "QUIZ"
        | "INTERACTIVE"
      difficulty_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
      resource_type:
        | "VIDEO"
        | "AUDIO"
        | "PDF"
        | "QUIZ"
        | "INTERACTIVE"
        | "ARTICLE"
      submission_status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED"
      user_role: "STUDENT" | "TEACHER" | "ADMIN" | "MODERATOR" | "MEMBER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      challenge_category: [
        "LISTENING",
        "SPEAKING",
        "READING",
        "WRITING",
        "GRAMMAR",
        "VOCABULARY",
      ],
      challenge_type: [
        "VIDEO_SUBMISSION",
        "AUDIO_SUBMISSION",
        "TEXT_SUBMISSION",
        "QUIZ",
        "INTERACTIVE",
      ],
      difficulty_level: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      resource_type: [
        "VIDEO",
        "AUDIO",
        "PDF",
        "QUIZ",
        "INTERACTIVE",
        "ARTICLE",
      ],
      submission_status: ["PENDING", "REVIEWED", "APPROVED", "REJECTED"],
      user_role: ["STUDENT", "TEACHER", "ADMIN", "MODERATOR", "MEMBER"],
    },
  },
} as const

