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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      leases: {
        Row: {
          ansut_certified_at: string | null
          charges_amount: number | null
          created_at: string
          deposit_amount: number | null
          document_url: string | null
          end_date: string
          id: string
          landlord_id: string
          landlord_signed_at: string | null
          lease_type: string
          monthly_rent: number
          property_id: string
          start_date: string
          status: string
          tenant_id: string
          tenant_signed_at: string | null
          updated_at: string
        }
        Insert: {
          ansut_certified_at?: string | null
          charges_amount?: number | null
          created_at?: string
          deposit_amount?: number | null
          document_url?: string | null
          end_date: string
          id?: string
          landlord_id: string
          landlord_signed_at?: string | null
          lease_type: string
          monthly_rent: number
          property_id: string
          start_date: string
          status?: string
          tenant_id: string
          tenant_signed_at?: string | null
          updated_at?: string
        }
        Update: {
          ansut_certified_at?: string | null
          charges_amount?: number | null
          created_at?: string
          deposit_amount?: number | null
          document_url?: string | null
          end_date?: string
          id?: string
          landlord_id?: string
          landlord_signed_at?: string | null
          lease_type?: string
          monthly_rent?: number
          property_id?: string
          start_date?: string
          status?: string
          tenant_id?: string
          tenant_signed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          application_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          application_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "rental_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_money_transactions: {
        Row: {
          amount: number
          created_at: string
          fees: number | null
          id: string
          payment_id: string
          phone_number: string
          provider: string
          provider_response: Json | null
          status: string
          transaction_ref: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          fees?: number | null
          id?: string
          payment_id: string
          phone_number: string
          provider: string
          provider_response?: Json | null
          status?: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          fees?: number | null
          id?: string
          payment_id?: string
          phone_number?: string
          provider?: string
          provider_response?: Json | null
          status?: string
          transaction_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_money_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          payer_id: string
          payment_method: string
          payment_type: string
          property_id: string | null
          receiver_id: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payer_id: string
          payment_method: string
          payment_type: string
          property_id?: string | null
          receiver_id: string
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payer_id?: string
          payment_method?: string
          payment_type?: string
          property_id?: string | null
          receiver_id?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          cnam_verified: boolean | null
          created_at: string
          full_name: string
          id: string
          is_verified: boolean | null
          oneci_verified: boolean | null
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cnam_verified?: boolean | null
          created_at?: string
          full_name: string
          id: string
          is_verified?: boolean | null
          oneci_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cnam_verified?: boolean | null
          created_at?: string
          full_name?: string
          id?: string
          is_verified?: boolean | null
          oneci_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          charges_amount: number | null
          city: string
          created_at: string
          deposit_amount: number | null
          description: string | null
          floor_number: number | null
          has_ac: boolean | null
          has_garden: boolean | null
          has_parking: boolean | null
          id: string
          images: string[] | null
          is_furnished: boolean | null
          latitude: number | null
          longitude: number | null
          main_image: string | null
          monthly_rent: number
          neighborhood: string | null
          owner_id: string
          property_type: string
          status: string
          surface_area: number | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          charges_amount?: number | null
          city: string
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          floor_number?: number | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          id?: string
          images?: string[] | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          monthly_rent: number
          neighborhood?: string | null
          owner_id: string
          property_type: string
          status?: string
          surface_area?: number | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          charges_amount?: number | null
          city?: string
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          floor_number?: number | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          id?: string
          images?: string[] | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          monthly_rent?: number
          neighborhood?: string | null
          owner_id?: string
          property_type?: string
          status?: string
          surface_area?: number | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      rental_applications: {
        Row: {
          applicant_id: string
          application_score: number | null
          cover_letter: string | null
          created_at: string
          documents: Json | null
          id: string
          property_id: string
          reviewed_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          application_score?: number | null
          cover_letter?: string | null
          created_at?: string
          documents?: Json | null
          id?: string
          property_id: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          application_score?: number | null
          cover_letter?: string | null
          created_at?: string
          documents?: Json | null
          id?: string
          property_id?: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_verifications: {
        Row: {
          cnam_data: Json | null
          cnam_employer: string | null
          cnam_social_security_number: string | null
          cnam_status: string | null
          cnam_verified_at: string | null
          created_at: string
          id: string
          oneci_cni_number: string | null
          oneci_data: Json | null
          oneci_status: string | null
          oneci_verified_at: string | null
          score_updated_at: string | null
          tenant_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cnam_data?: Json | null
          cnam_employer?: string | null
          cnam_social_security_number?: string | null
          cnam_status?: string | null
          cnam_verified_at?: string | null
          created_at?: string
          id?: string
          oneci_cni_number?: string | null
          oneci_data?: Json | null
          oneci_status?: string | null
          oneci_verified_at?: string | null
          score_updated_at?: string | null
          tenant_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cnam_data?: Json | null
          cnam_employer?: string | null
          cnam_social_security_number?: string | null
          cnam_status?: string | null
          cnam_verified_at?: string | null
          created_at?: string
          id?: string
          oneci_cni_number?: string | null
          oneci_data?: Json | null
          oneci_status?: string | null
          oneci_verified_at?: string | null
          score_updated_at?: string | null
          tenant_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "agent" | "moderator"
      user_type: "locataire" | "proprietaire" | "agence" | "admin_ansut"
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
    Enums: {
      app_role: ["admin", "user", "agent", "moderator"],
      user_type: ["locataire", "proprietaire", "agence", "admin_ansut"],
    },
  },
} as const
