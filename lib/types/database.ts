// Hand-authored Supabase Database types, scoped to the tables the app
// currently queries (wine entry flow + the existing auth allowlist check).
//
// The Supabase project was paused/inactive when this file was written, so
// `supabase gen types typescript` (or the Supabase MCP `generate_typescript_types`
// tool) could not be run against the live schema — column names and
// nullability below are inferred from CLAUDE.md and the issue description,
// not verified against the database. Regenerate this file properly once the
// project is reachable, and extend the `Tables` map as new tables/columns are
// queried elsewhere in the app.
import type { WineType } from '@/lib/types/wine'

export type GrapeColor = 'white' | 'rosé' | 'sparkling' | 'other'

export interface Database {
  public: {
    Tables: {
      allowed_users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['allowed_users']['Insert']>
        Relationships: []
      }
      wineries: {
        Row: {
          id: string
          name: string
          region: string | null
          country: string | null
          website: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          region?: string | null
          country?: string | null
          website?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['wineries']['Insert']>
        Relationships: []
      }
      grapes: {
        Row: {
          id: string
          name: string
          color: GrapeColor | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: GrapeColor | null
          description?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['grapes']['Insert']>
        Relationships: []
      }
      wines: {
        Row: {
          id: string
          winery_id: string
          name: string
          type: WineType
          created_at: string
        }
        Insert: {
          id?: string
          winery_id: string
          name: string
          type: WineType
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['wines']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'wines_winery_id_fkey'
            columns: ['winery_id']
            isOneToOne: false
            referencedRelation: 'wineries'
            referencedColumns: ['id']
          },
        ]
      }
      wine_vintages: {
        Row: {
          id: string
          wine_id: string
          vintage: number
          label_photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wine_id: string
          vintage: number
          label_photo_url?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['wine_vintages']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'wine_vintages_wine_id_fkey'
            columns: ['wine_id']
            isOneToOne: false
            referencedRelation: 'wines'
            referencedColumns: ['id']
          },
        ]
      }
      wine_grapes: {
        Row: {
          wine_id: string
          grape_id: string
          // Nullability unverified (project was paused at write time) — assumed
          // nullable since the entry form doesn't collect a blend percentage.
          // If this column turns out to be NOT NULL, this insert needs a
          // default supplied (e.g. split evenly across grapes).
          percentage: number | null
        }
        Insert: {
          wine_id: string
          grape_id: string
          percentage?: number | null
        }
        Update: Partial<Database['public']['Tables']['wine_grapes']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'wine_grapes_wine_id_fkey'
            columns: ['wine_id']
            isOneToOne: false
            referencedRelation: 'wines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wine_grapes_grape_id_fkey'
            columns: ['grape_id']
            isOneToOne: false
            referencedRelation: 'grapes'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          wine_vintage_id: string
          user_id: string
          appearance: number
          nose: number
          palate: number
          finish: number
          value: number
          overall: number
          tasting_notes: string | null
          food_pairing: string | null
          would_buy_again: boolean | null
          occasion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wine_vintage_id: string
          user_id: string
          appearance: number
          nose: number
          palate: number
          finish: number
          value: number
          overall: number
          tasting_notes?: string | null
          food_pairing?: string | null
          would_buy_again?: boolean | null
          occasion?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'reviews_wine_vintage_id_fkey'
            columns: ['wine_vintage_id']
            isOneToOne: false
            referencedRelation: 'wine_vintages'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
