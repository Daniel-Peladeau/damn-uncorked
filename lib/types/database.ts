// Generated via the Supabase MCP `generate_typescript_types` tool against the
// live schema (project was paused when an earlier hand-authored version of
// this file was written — that version had several column names wrong, e.g.
// `wines.type`/`wine_vintages.vintage` instead of the real `wine_type`/
// `vintage_year`). Regenerate this file the same way after future schema
// changes rather than hand-editing it.
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allowed_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      grapes: {
        Row: {
          color: Database["public"]["Enums"]["grape_color"]
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: Database["public"]["Enums"]["grape_color"]
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: Database["public"]["Enums"]["grape_color"]
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appearance: number | null
          created_at: string | null
          currency: string | null
          finish: number | null
          food_pairing: string | null
          id: string
          nose: number | null
          occasion: string | null
          overall: number | null
          palate: number | null
          price_paid: number | null
          purchase_location: string | null
          tasted_on: string | null
          tasting_notes: string | null
          updated_at: string | null
          user_id: string
          value: number | null
          wine_vintage_id: string
          would_buy_again: boolean | null
        }
        Insert: {
          appearance?: number | null
          created_at?: string | null
          currency?: string | null
          finish?: number | null
          food_pairing?: string | null
          id?: string
          nose?: number | null
          occasion?: string | null
          overall?: number | null
          palate?: number | null
          price_paid?: number | null
          purchase_location?: string | null
          tasted_on?: string | null
          tasting_notes?: string | null
          updated_at?: string | null
          user_id: string
          value?: number | null
          wine_vintage_id: string
          would_buy_again?: boolean | null
        }
        Update: {
          appearance?: number | null
          created_at?: string | null
          currency?: string | null
          finish?: number | null
          food_pairing?: string | null
          id?: string
          nose?: number | null
          occasion?: string | null
          overall?: number | null
          palate?: number | null
          price_paid?: number | null
          purchase_location?: string | null
          tasted_on?: string | null
          tasting_notes?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number | null
          wine_vintage_id?: string
          would_buy_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_wine_vintage_id_fkey"
            columns: ["wine_vintage_id"]
            isOneToOne: false
            referencedRelation: "wine_rankings"
            referencedColumns: ["wine_vintage_id"]
          },
          {
            foreignKeyName: "reviews_wine_vintage_id_fkey"
            columns: ["wine_vintage_id"]
            isOneToOne: false
            referencedRelation: "wine_vintages"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_grapes: {
        Row: {
          grape_id: string
          id: string
          percentage: number | null
          wine_id: string
        }
        Insert: {
          grape_id: string
          id?: string
          percentage?: number | null
          wine_id: string
        }
        Update: {
          grape_id?: string
          id?: string
          percentage?: number | null
          wine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_grapes_grape_id_fkey"
            columns: ["grape_id"]
            isOneToOne: false
            referencedRelation: "grapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_grapes_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wine_rankings"
            referencedColumns: ["wine_id"]
          },
          {
            foreignKeyName: "wine_grapes_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_vintages: {
        Row: {
          abv: number | null
          created_at: string | null
          drink_window_end: number | null
          drink_window_start: number | null
          id: string
          label_image_url: string | null
          price_range: string | null
          vintage_year: number | null
          wine_id: string
        }
        Insert: {
          abv?: number | null
          created_at?: string | null
          drink_window_end?: number | null
          drink_window_start?: number | null
          id?: string
          label_image_url?: string | null
          price_range?: string | null
          vintage_year?: number | null
          wine_id: string
        }
        Update: {
          abv?: number | null
          created_at?: string | null
          drink_window_end?: number | null
          drink_window_start?: number | null
          id?: string
          label_image_url?: string | null
          price_range?: string | null
          vintage_year?: number | null
          wine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_vintages_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wine_rankings"
            referencedColumns: ["wine_id"]
          },
          {
            foreignKeyName: "wine_vintages_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      wineries: {
        Row: {
          country: string | null
          created_at: string | null
          created_by: string | null
          id: string
          location: unknown
          name: string
          name_normalized: string | null
          notes: string | null
          region: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: unknown
          name: string
          name_normalized?: string | null
          notes?: string | null
          region?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: unknown
          name?: string
          name_normalized?: string | null
          notes?: string | null
          region?: string | null
          website?: string | null
        }
        Relationships: []
      }
      wines: {
        Row: {
          appellation: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          id: string
          lwin: string | null
          name: string
          name_normalized: string | null
          region: string | null
          wine_type: Database["public"]["Enums"]["wine_type"]
          winery_id: string | null
        }
        Insert: {
          appellation?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lwin?: string | null
          name: string
          name_normalized?: string | null
          region?: string | null
          wine_type?: Database["public"]["Enums"]["wine_type"]
          winery_id?: string | null
        }
        Update: {
          appellation?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lwin?: string | null
          name?: string
          name_normalized?: string | null
          region?: string | null
          wine_type?: Database["public"]["Enums"]["wine_type"]
          winery_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wines_winery_id_fkey"
            columns: ["winery_id"]
            isOneToOne: false
            referencedRelation: "wineries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wines_winery_id_fkey"
            columns: ["winery_id"]
            isOneToOne: false
            referencedRelation: "winery_locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      wine_rankings: {
        Row: {
          avg_appearance: number | null
          avg_finish: number | null
          avg_nose: number | null
          avg_overall: number | null
          avg_palate: number | null
          avg_value: number | null
          review_count: number | null
          vintage_year: number | null
          wine_id: string | null
          wine_name: string | null
          wine_type: Database["public"]["Enums"]["wine_type"] | null
          wine_vintage_id: string | null
          winery_name: string | null
        }
        Relationships: []
      }
      winery_locations: {
        Row: {
          id: string | null
          lat: number | null
          lng: number | null
        }
        Insert: {
          id?: string | null
          lat?: never
          lng?: never
        }
        Update: {
          id?: string | null
          lat?: never
          lng?: never
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      grape_color: "white" | "rosé" | "red" | "other"
      wine_type:
        | "white"
        | "rosé"
        | "sparkling"
        | "red"
        | "dessert"
        | "fortified"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      grape_color: ["white", "rosé", "red", "other"],
      wine_type: ["white", "rosé", "sparkling", "red", "dessert", "fortified"],
    },
  },
} as const
