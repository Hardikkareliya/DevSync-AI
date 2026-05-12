export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          project_id: string
          raw_input: string
          generated_output: string
          output_format: string
          provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          raw_input: string
          generated_output: string
          output_format?: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          raw_input?: string
          generated_output?: string
          output_format?: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      commits: {
        Row: {
          id: string
          user_id: string
          project_id: string
          raw_input: string
          generated_output: string
          commit_type: string
          output_format: string
          provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          raw_input: string
          generated_output: string
          commit_type?: string
          output_format?: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          raw_input?: string
          generated_output?: string
          commit_type?: string
          output_format?: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      pr_descriptions: {
        Row: {
          id: string
          user_id: string
          project_id: string
          raw_input: string
          generated_output: string
          output_format: string
          provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          raw_input: string
          generated_output: string
          output_format?: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          raw_input?: string
          generated_output?: string
          output_format?: string
          provider?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
