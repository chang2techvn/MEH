export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_type: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          points: number | null
          title: string
        }
        Insert: {
          badge_type?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
        }
        Update: {
          badge_type?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
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
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
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
      ai_assistants: {
        Row: {
          avatar: string | null
          capabilities: string[] | null
          category: string | null
          conversation_count: number | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          is_active: boolean | null
          message_count: number | null
          model: string
          name: string
          system_prompt: string
          token_consumption: number | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          capabilities?: string[] | null
          category?: string | null
          conversation_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          message_count?: number | null
          model: string
          name: string
          system_prompt: string
          token_consumption?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          capabilities?: string[] | null
          category?: string | null
          conversation_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          message_count?: number | null
          model?: string
          name?: string
          system_prompt?: string
          token_consumption?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistants_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          capabilities: string[] | null
          cost_per_request: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          model_id: string
          name: string
          provider: string
          rate_limit: number | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: string[] | null
          cost_per_request?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_id: string
          name: string
          provider: string
          rate_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: string[] | null
          cost_per_request?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string
          name?: string
          provider?: string
          rate_limit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_safety_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          rule_config: Json
          rule_name: string
          rule_type: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_config: Json
          rule_name: string
          rule_type: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_config?: Json
          rule_name?: string
          rule_type?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          current_usage: number | null
          encrypted_key: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          service_name: string
          updated_at: string | null
          usage_limit: number | null
        }
        Insert: {
          created_at?: string | null
          current_usage?: number | null
          encrypted_key: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          service_name: string
          updated_at?: string | null
          usage_limit?: number | null
        }
        Update: {
          created_at?: string | null
          current_usage?: number | null
          encrypted_key?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          service_name?: string
          updated_at?: string | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      banned_terms: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          language: string | null
          severity: string | null
          term: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          severity?: string | null
          term: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          severity?: string | null
          term?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          ai_feedback: Json | null
          challenge_id: string | null
          id: string
          is_correct: boolean | null
          points_earned: number | null
          submitted_at: string | null
          time_taken: number | null
          user_answer: Json | null
          user_id: string | null
        }
        Insert: {
          ai_feedback?: Json | null
          challenge_id?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          submitted_at?: string | null
          time_taken?: number | null
          user_answer?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_feedback?: Json | null
          challenge_id?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          submitted_at?: string | null
          time_taken?: number | null
          user_answer?: Json | null
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
          challenge_type: string
          content: Json | null
          correct_answer: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          is_active: boolean | null
          learning_path_id: string | null
          order_index: number | null
          points: number | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge_type: string
          content?: Json | null
          correct_answer?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          learning_path_id?: string | null
          order_index?: number | null
          points?: number | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string
          content?: Json | null
          correct_answer?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          learning_path_id?: string | null
          order_index?: number | null
          points?: number | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
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
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          media_url: string | null
          message_type: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          media_url?: string | null
          message_type?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          media_url?: string | null
          message_type?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          difficulty: string
          duration: number | null
          embed_url: string | null
          featured: boolean | null
          id: string
          thumbnail_url: string | null
          title: string
          topics: string[] | null
          transcript: string | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          difficulty: string
          duration?: number | null
          embed_url?: string | null
          featured?: boolean | null
          id: string
          thumbnail_url?: string | null
          title: string
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          difficulty?: string
          duration?: number | null
          embed_url?: string | null
          featured?: boolean | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      daily_videos: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          duration: number | null
          embed_url: string | null
          id: string
          thumbnail_url: string | null
          title: string
          topics: string[] | null
          transcript: string | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          duration?: number | null
          embed_url?: string | null
          id: string
          thumbnail_url?: string | null
          title: string
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          duration?: number | null
          embed_url?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      evaluation_logs: {
        Row: {
          ai_model: string | null
          ai_response: Json | null
          challenge_id: string | null
          confidence_score: number | null
          created_at: string | null
          evaluation_type: string
          id: string
          input_text: string | null
          processing_time: number | null
          submission_id: string | null
          user_id: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_response?: Json | null
          challenge_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          evaluation_type: string
          id?: string
          input_text?: string | null
          processing_time?: number | null
          submission_id?: string | null
          user_id?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_response?: Json | null
          challenge_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          evaluation_type?: string
          id?: string
          input_text?: string | null
          processing_time?: number | null
          submission_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_logs_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "challenge_submissions"
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
          difficulty_level: string | null
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
          difficulty_level?: string | null
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
          difficulty_level?: string | null
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
          media_url: string | null
          message_type: string | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
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
      notification_deliveries: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_status: string | null
          id: string
          notification_id: string | null
          opened_at: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_type: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_type: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_type?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          title?: string
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
          ai_evaluation: Json | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          media_url: string | null
          original_video_id: string | null
          post_type: string | null
          score: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          user_image: string | null
          username: string | null
        }
        Insert: {
          ai_evaluation?: Json | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          media_url?: string | null
          original_video_id?: string | null
          post_type?: string | null
          score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_image?: string | null
          username?: string | null
        }
        Update: {
          ai_evaluation?: Json | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          media_url?: string | null
          original_video_id?: string | null
          post_type?: string | null
          score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_image?: string | null
          username?: string | null
        }
        Relationships: [
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
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          native_language: string | null
          proficiency_level: string | null
          target_language: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          native_language?: string | null
          proficiency_level?: string | null
          target_language?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          native_language?: string | null
          proficiency_level?: string | null
          target_language?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
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
          alt_text: string | null
          challenge_id: string | null
          created_at: string | null
          duration: number | null
          file_size: number | null
          id: string
          resource_type: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          challenge_id?: string | null
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          resource_type: string
          url: string
        }
        Update: {
          alt_text?: string | null
          challenge_id?: string | null
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          resource_type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          created_at: string | null
          id: string
          message_type: string
          recipient_count: number | null
          recipient_filter: Json | null
          recurring_pattern: string | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_type: string
          recipient_count?: number | null
          recipient_filter?: Json | null
          recurring_pattern?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_type?: string
          recipient_count?: number | null
          recipient_filter?: Json | null
          recurring_pattern?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_templates: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string | null
          criteria: Json
          id: string
          is_default: boolean | null
          max_points: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          created_by?: string | null
          criteria: Json
          id?: string
          is_default?: boolean | null
          max_points?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string | null
          criteria?: Json
          id?: string
          is_default?: boolean | null
          max_points?: number | null
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
      user_challenges: {
        Row: {
          challenge_type: string
          content: Json | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          is_active: boolean | null
          points: number | null
          title: string
          transcript: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          challenge_type?: string
          content?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_type?: string
          content?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_challenges: number | null
          created_at: string | null
          current_challenge_id: string | null
          id: string
          last_accessed: string | null
          learning_path_id: string | null
          progress_percentage: number | null
          total_challenges: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_challenges?: number | null
          created_at?: string | null
          current_challenge_id?: string | null
          id?: string
          last_accessed?: string | null
          learning_path_id?: string | null
          progress_percentage?: number | null
          total_challenges?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_challenges?: number | null
          created_at?: string | null
          current_challenge_id?: string | null
          id?: string
          last_accessed?: string | null
          learning_path_id?: string | null
          progress_percentage?: number | null
          total_challenges?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_current_challenge_id_fkey"
            columns: ["current_challenge_id"]
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
          last_login: string | null
          level: number | null
          major: string | null
          name: string | null
          points: number | null
          preferences: Json | null
          role: string | null
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
          last_login?: string | null
          level?: number | null
          major?: string | null
          name?: string | null
          points?: number | null
          preferences?: Json | null
          role?: string | null
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
          last_login?: string | null
          level?: number | null
          major?: string | null
          name?: string | null
          points?: number | null
          preferences?: Json | null
          role?: string | null
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
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
