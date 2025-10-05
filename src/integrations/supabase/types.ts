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
      disputes: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          created_at: string | null
          description: string
          dispute_type: string
          id: string
          lease_id: string | null
          priority: string | null
          reported_id: string
          reporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          description: string
          dispute_type: string
          id?: string
          lease_id?: string | null
          priority?: string | null
          reported_id: string
          reporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          description?: string
          dispute_type?: string
          id?: string
          lease_id?: string | null
          priority?: string | null
          reported_id?: string
          reporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          id: string
          is_active: boolean | null
          name: string
          template_content: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          name: string
          template_content: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          template_content?: Json
          updated_at?: string
        }
        Relationships: []
      }
      lease_documents: {
        Row: {
          created_at: string
          document_type: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          lease_id: string
          name: string
          notes: string | null
          status: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lease_id: string
          name: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lease_id?: string
          name?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "lease_documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          ansut_certified_at: string | null
          certification_notes: string | null
          certification_requested_at: string | null
          certification_status: string | null
          certified_by: string | null
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
          certification_notes?: string | null
          certification_requested_at?: string | null
          certification_status?: string | null
          certified_by?: string | null
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
          certification_notes?: string | null
          certification_requested_at?: string | null
          certification_status?: string | null
          certified_by?: string | null
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
      message_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          application_id: string | null
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          application_id?: string | null
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          application_id?: string | null
          attachments?: Json | null
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
      notification_preferences: {
        Row: {
          category: string
          created_at: string
          email_enabled: boolean | null
          enabled: boolean | null
          id: string
          push_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          face_verified: boolean | null
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
          face_verified?: boolean | null
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
          face_verified?: boolean | null
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
          floor_plans: Json | null
          has_ac: boolean | null
          has_garden: boolean | null
          has_parking: boolean | null
          id: string
          images: string[] | null
          is_furnished: boolean | null
          latitude: number | null
          longitude: number | null
          main_image: string | null
          media_metadata: Json | null
          monthly_rent: number
          neighborhood: string | null
          owner_id: string
          panoramic_images: Json | null
          property_type: string
          status: string
          surface_area: number | null
          title: string
          updated_at: string
          video_url: string | null
          view_count: number | null
          virtual_tour_url: string | null
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
          floor_plans?: Json | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          id?: string
          images?: string[] | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          media_metadata?: Json | null
          monthly_rent: number
          neighborhood?: string | null
          owner_id: string
          panoramic_images?: Json | null
          property_type: string
          status?: string
          surface_area?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
          virtual_tour_url?: string | null
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
          floor_plans?: Json | null
          has_ac?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          id?: string
          images?: string[] | null
          is_furnished?: boolean | null
          latitude?: number | null
          longitude?: number | null
          main_image?: string | null
          media_metadata?: Json | null
          monthly_rent?: number
          neighborhood?: string | null
          owner_id?: string
          panoramic_images?: Json | null
          property_type?: string
          status?: string
          surface_area?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
          virtual_tour_url?: string | null
        }
        Relationships: []
      }
      recommendation_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          recommendation_type: string
          recommended_items: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          recommendation_type: string
          recommended_items?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          recommendation_type?: string
          recommended_items?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      reputation_scores: {
        Row: {
          as_landlord_reviews: number | null
          as_landlord_score: number | null
          as_tenant_reviews: number | null
          as_tenant_score: number | null
          avg_rating: number | null
          created_at: string
          id: string
          overall_score: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          as_landlord_reviews?: number | null
          as_landlord_score?: number | null
          as_tenant_reviews?: number | null
          as_tenant_score?: number | null
          avg_rating?: number | null
          created_at?: string
          id?: string
          overall_score?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          as_landlord_reviews?: number | null
          as_landlord_score?: number | null
          as_tenant_reviews?: number | null
          as_tenant_score?: number | null
          avg_rating?: number | null
          created_at?: string
          id?: string
          overall_score?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          lease_id: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string | null
          rating: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          lease_id?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          rating: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          lease_id?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          rating?: number
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          clicked_properties: string[] | null
          created_at: string
          id: string
          result_count: number | null
          search_filters: Json
          user_id: string
        }
        Insert: {
          clicked_properties?: string[] | null
          created_at?: string
          id?: string
          result_count?: number | null
          search_filters?: Json
          user_id: string
        }
        Update: {
          clicked_properties?: string[] | null
          created_at?: string
          id?: string
          result_count?: number | null
          search_filters?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          max_budget: number | null
          min_bathrooms: number | null
          min_bedrooms: number | null
          min_budget: number | null
          preferred_cities: string[] | null
          preferred_property_types: string[] | null
          requires_ac: boolean | null
          requires_furnished: boolean | null
          requires_garden: boolean | null
          requires_parking: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_budget?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          min_budget?: number | null
          preferred_cities?: string[] | null
          preferred_property_types?: string[] | null
          requires_ac?: boolean | null
          requires_furnished?: boolean | null
          requires_garden?: boolean | null
          requires_parking?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_budget?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          min_budget?: number | null
          preferred_cities?: string[] | null
          preferred_property_types?: string[] | null
          requires_ac?: boolean | null
          requires_furnished?: boolean | null
          requires_garden?: boolean | null
          requires_parking?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reminders: {
        Row: {
          created_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          link: string | null
          message: string | null
          reminder_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          link?: string | null
          message?: string | null
          reminder_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          link?: string | null
          message?: string | null
          reminder_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
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
          face_similarity_score: number | null
          face_verification_attempts: number | null
          face_verification_status: string | null
          face_verified_at: string | null
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
          face_similarity_score?: number | null
          face_verification_attempts?: number | null
          face_verification_status?: string | null
          face_verified_at?: string | null
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
          face_similarity_score?: number | null
          face_verification_attempts?: number | null
          face_verification_status?: string | null
          face_verified_at?: string | null
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
      calculate_reputation_score: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      cleanup_expired_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
