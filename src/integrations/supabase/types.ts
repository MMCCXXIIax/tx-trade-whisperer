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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          confidence: number
          created_at: string | null
          id: number
          is_active: boolean | null
          message: string
          metadata: Json | null
          symbol: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          confidence: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          message: string
          metadata?: Json | null
          symbol: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          confidence?: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          message?: string
          metadata?: Json | null
          symbol?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_state: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      detections: {
        Row: {
          confidence: number | null
          id: string
          outcome: string | null
          pattern: string
          price: number | null
          symbol: string
          timestamp: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          confidence?: number | null
          id?: string
          outcome?: string | null
          pattern: string
          price?: number | null
          symbol: string
          timestamp?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          confidence?: number | null
          id?: string
          outcome?: string | null
          pattern?: string
          price?: number | null
          symbol?: string
          timestamp?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string
          id: number
          message: string | null
          source: string
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string | null
          source: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string | null
          source?: string
        }
        Relationships: []
      }
      paper_trades: {
        Row: {
          closed_at: string | null
          id: string
          opened_at: string | null
          price: number | null
          qty: number | null
          side: string | null
          symbol: string | null
          user_id: string | null
        }
        Insert: {
          closed_at?: string | null
          id: string
          opened_at?: string | null
          price?: number | null
          qty?: number | null
          side?: string | null
          symbol?: string | null
          user_id?: string | null
        }
        Update: {
          closed_at?: string | null
          id?: string
          opened_at?: string | null
          price?: number | null
          qty?: number | null
          side?: string | null
          symbol?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pattern_detections: {
        Row: {
          confidence: number
          detected_at: string | null
          id: number
          metadata: Json | null
          pattern_type: string
          price: number | null
          symbol: string
          user_id: string | null
          volume: number | null
        }
        Insert: {
          confidence: number
          detected_at?: string | null
          id?: number
          metadata?: Json | null
          pattern_type: string
          price?: number | null
          symbol: string
          user_id?: string | null
          volume?: number | null
        }
        Update: {
          confidence?: number
          detected_at?: string | null
          id?: number
          metadata?: Json | null
          pattern_type?: string
          price?: number | null
          symbol?: string
          user_id?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          asset: string
          avg_price: number | null
          created_at: string
          id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          asset: string
          avg_price?: number | null
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          asset?: string
          avg_price?: number | null
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          is_public: boolean
          mode: string | null
          name: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_public?: boolean
          mode?: string | null
          name?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_public?: boolean
          mode?: string | null
          name?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_hash: string | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          email: string | null
          first_seen: string
          id: string
          ip: string | null
          ip_hash: string | null
          last_seen: string
          mode: string | null
          name: string | null
          refresh_interval: number
          user_agent: string | null
          visit_count: number
        }
        Insert: {
          email?: string | null
          first_seen?: string
          id: string
          ip?: string | null
          ip_hash?: string | null
          last_seen?: string
          mode?: string | null
          name?: string | null
          refresh_interval?: number
          user_agent?: string | null
          visit_count?: number
        }
        Update: {
          email?: string | null
          first_seen?: string
          id?: string
          ip?: string | null
          ip_hash?: string | null
          last_seen?: string
          mode?: string | null
          name?: string | null
          refresh_interval?: number
          user_agent?: string | null
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "visitors_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      cleanup_old_visitor_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_username_by_id: {
        Args: { uid: string }
        Returns: string
      }
      hash_ip: {
        Args: { ip_address: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
