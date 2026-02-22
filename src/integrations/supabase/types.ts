export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      buildings: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          ended_at: string | null
          id: string
          message_count: number | null
          started_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          message_count?: number | null
          started_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          message_count?: number | null
          started_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string
          message_id: string
          rating: number | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_id: string
          rating?: number | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_id?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_ratings: {
        Row: {
          complaint_id: string
          created_at: string
          feedback_text: string | null
          id: string
          improvement_suggestions: string | null
          rated_by: string
          rating: number
          resolution_satisfaction: number | null
          response_time: number | null
          service_quality: number | null
          staff_professionalism: number | null
          updated_at: string
          would_recommend: boolean | null
        }
        Insert: {
          complaint_id: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          improvement_suggestions?: string | null
          rated_by: string
          rating: number
          resolution_satisfaction?: number | null
          response_time?: number | null
          service_quality?: number | null
          staff_professionalism?: number | null
          updated_at?: string
          would_recommend?: boolean | null
        }
        Update: {
          complaint_id?: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          improvement_suggestions?: string | null
          rated_by?: string
          rating?: number
          resolution_satisfaction?: number | null
          response_time?: number | null
          service_quality?: number | null
          staff_professionalism?: number | null
          updated_at?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_ratings_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: true
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_updates: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          note: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          updated_by: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          note?: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          updated_by: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          approved_by: string | null
          assigned_to: string | null
          building_id: string | null
          category_id: string | null
          complaint_number: string
          created_at: string
          department_id: string
          description: string
          expected_resolution: string | null
          id: string
          image_urls: string[] | null
          location: string
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolved_at: string | null
          search_vector: unknown
          status: Database["public"]["Enums"]["complaint_status"]
          submitted_by: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          assigned_to?: string | null
          building_id?: string | null
          category_id?: string | null
          complaint_number: string
          created_at?: string
          department_id: string
          description: string
          expected_resolution?: string | null
          id?: string
          image_urls?: string[] | null
          location: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolved_at?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["complaint_status"]
          submitted_by: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          assigned_to?: string | null
          building_id?: string | null
          category_id?: string | null
          complaint_number?: string
          created_at?: string
          department_id?: string
          description?: string
          expected_resolution?: string | null
          id?: string
          image_urls?: string[] | null
          location?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolved_at?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["complaint_status"]
          submitted_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "maintenance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "complaints_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          created_at: string | null
          date: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      knowledge_articles: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          keywords: string[] | null
          not_helpful_count: number | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          keywords?: string[] | null
          not_helpful_count?: number | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          keywords?: string[] | null
          not_helpful_count?: number | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      maintenance_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          read_at: string | null
          related_complaint_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          read_at?: string | null
          related_complaint_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          read_at?: string | null
          related_complaint_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_complaint_id_fkey"
            columns: ["related_complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters: Json
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          filters: Json | null
          id: string
          query: string
          result_count: number | null
          searched_at: string | null
          user_id: string
        }
        Insert: {
          filters?: Json | null
          id?: string
          query: string
          result_count?: number | null
          searched_at?: string | null
          user_id: string
        }
        Update: {
          filters?: Json | null
          id?: string
          query?: string
          result_count?: number | null
          searched_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sla_rules: {
        Row: {
          category_id: string | null
          created_at: string
          department_id: string | null
          escalation_time_hours: number | null
          id: string
          is_active: boolean
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolution_time_hours: number
          response_time_hours: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          department_id?: string | null
          escalation_time_hours?: number | null
          id?: string
          is_active?: boolean
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolution_time_hours: number
          response_time_hours: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          department_id?: string | null
          escalation_time_hours?: number | null
          id?: string
          is_active?: boolean
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolution_time_hours?: number
          response_time_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "maintenance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_rules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "sla_rules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_tracking: {
        Row: {
          breach_reason: string | null
          complaint_id: string
          created_at: string
          escalation_due_at: string | null
          id: string
          is_escalated: boolean
          is_resolution_breached: boolean
          is_response_breached: boolean
          resolution_due_at: string | null
          resolved_at: string | null
          responded_at: string | null
          response_due_at: string | null
          sla_rule_id: string | null
          updated_at: string
        }
        Insert: {
          breach_reason?: string | null
          complaint_id: string
          created_at?: string
          escalation_due_at?: string | null
          id?: string
          is_escalated?: boolean
          is_resolution_breached?: boolean
          is_response_breached?: boolean
          resolution_due_at?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          response_due_at?: string | null
          sla_rule_id?: string | null
          updated_at?: string
        }
        Update: {
          breach_reason?: string | null
          complaint_id?: string
          created_at?: string
          escalation_due_at?: string | null
          id?: string
          is_escalated?: boolean
          is_resolution_breached?: boolean
          is_response_breached?: boolean
          resolution_due_at?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          response_due_at?: string | null
          sla_rule_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_tracking_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: true
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_tracking_sla_rule_id_fkey"
            columns: ["sla_rule_id"]
            isOneToOne: false
            referencedRelation: "sla_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          description: string | null
          key: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      department_analytics: {
        Row: {
          avg_rating: number | null
          avg_resolution_hours: number | null
          completed_count: number | null
          department_id: string | null
          department_name: string | null
          in_progress_count: number | null
          pending_count: number | null
          sla_breaches: number | null
          total_complaints: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_sla_deadline: {
        Args: { hours_to_add: number; start_time: string }
        Returns: string
      }
      create_notification: {
        Args: {
          _complaint_id?: string
          _link?: string
          _message: string
          _title: string
          _type: Database["public"]["Enums"]["notification_type"]
          _user_id: string
        }
        Returns: string
      }
      get_user_department: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_department_analytics: { Args: never; Returns: undefined }
      search_complaints: {
        Args: {
          assigned_to_filter?: string
          building_ids?: string[]
          category_ids?: string[]
          date_from?: string
          date_to?: string
          department_ids?: string[]
          page_number?: number
          page_size?: number
          priority_filter?: Database["public"]["Enums"]["complaint_priority"][]
          rating_max?: number
          rating_min?: number
          search_query?: string
          sla_status?: string
          status_filter?: Database["public"]["Enums"]["complaint_status"][]
          submitted_by_filter?: string
        }
        Returns: {
          assigned_to_name: string
          building_name: string
          category_name: string
          complaint_number: string
          created_at: string
          department_name: string
          description: string
          id: string
          is_sla_breached: boolean
          priority: Database["public"]["Enums"]["complaint_priority"]
          rating: number
          status: Database["public"]["Enums"]["complaint_status"]
          submitted_by_name: string
          title: string
          total_count: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "principal"
        | "hod"
        | "faculty"
        | "cr"
        | "maintenance_staff"
      complaint_priority: "critical" | "high" | "medium" | "low"
      complaint_status:
        | "pending"
        | "acknowledged"
        | "approved"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "rejected"
        | "closed"
      notification_type:
        | "complaint_created"
        | "complaint_assigned"
        | "complaint_updated"
        | "complaint_completed"
        | "complaint_approved"
        | "complaint_rejected"
        | "sla_warning"
        | "sla_breach"
        | "system_announcement"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "admin",
        "principal",
        "hod",
        "faculty",
        "cr",
        "maintenance_staff",
      ],
      complaint_priority: ["critical", "high", "medium", "low"],
      complaint_status: [
        "pending",
        "acknowledged",
        "approved",
        "in_progress",
        "on_hold",
        "completed",
        "rejected",
        "closed",
      ],
      notification_type: [
        "complaint_created",
        "complaint_assigned",
        "complaint_updated",
        "complaint_completed",
        "complaint_approved",
        "complaint_rejected",
        "sla_warning",
        "sla_breach",
        "system_announcement",
      ],
    },
  },
} as const
