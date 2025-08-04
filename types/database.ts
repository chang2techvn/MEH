export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string | null
          updated_at: string | null
          is_active: boolean | null
          last_login: string | null
          role: 'student' | 'teacher' | 'admin' | null
          name: string | null
          avatar: string | null
          bio: string | null
          academic_year: string | null
          experience_points: number | null
          joined_at: string | null
          last_active: string | null
          level: number | null
          major: string | null
          points: number | null
          preferences: any | null
          streak_days: number | null
          student_id: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
          last_login?: string | null
          role?: 'student' | 'teacher' | 'admin' | null
          name?: string | null
          avatar?: string | null
          bio?: string | null
          academic_year?: string | null
          experience_points?: number | null
          joined_at?: string | null
          last_active?: string | null
          level?: number | null
          major?: string | null
          points?: number | null
          preferences?: any | null
          streak_days?: number | null
          student_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
          last_login?: string | null
          role?: 'student' | 'teacher' | 'admin' | null
          name?: string | null
          avatar?: string | null
          bio?: string | null
          academic_year?: string | null
          experience_points?: number | null
          joined_at?: string | null
          last_active?: string | null
          level?: number | null
          major?: string | null
          points?: number | null
          preferences?: any | null
          streak_days?: number | null
          student_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          native_language: string | null
          target_language: string | null
          proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          timezone: string | null
          created_at: string | null
          updated_at: string | null
          background_url: string | null
          level: number | null
          streak_days: number | null
          experience_points: number | null
          total_posts: number | null
          total_likes: number | null
          total_comments: number | null
          completed_challenges: number | null
          role: 'admin' | 'teacher' | 'student' | 'staff' | null
          major: string | null
          class_name: string | null
          academic_year: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          native_language?: string | null
          target_language?: string | null
          proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
          background_url?: string | null
          level?: number | null
          streak_days?: number | null
          experience_points?: number | null
          total_posts?: number | null
          total_likes?: number | null
          total_comments?: number | null
          completed_challenges?: number | null
          role?: 'admin' | 'teacher' | 'student' | 'staff' | null
          major?: string | null
          class_name?: string | null
          academic_year?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          native_language?: string | null
          target_language?: string | null
          proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
          background_url?: string | null
          level?: number | null
          streak_days?: number | null
          experience_points?: number | null
          total_posts?: number | null
          total_likes?: number | null
          total_comments?: number | null
          completed_challenges?: number | null
          role?: 'admin' | 'teacher' | 'student' | 'staff' | null
          major?: string | null
          class_name?: string | null
          academic_year?: string | null
          student_id?: string | null
        }
      }
    }
  }
}

export type UserWithProfile = Database['public']['Tables']['users']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
}
