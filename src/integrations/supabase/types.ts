export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      company_profiles: {
        Row: {
          cnpj: string | null;
          created_at: string | null;
          display_name: string;
          id: string;
          industry: string | null;
          updated_at: string | null;
          user_id: string;
          verified: boolean | null;
          website: string | null;
        };
        Insert: {
          cnpj?: string | null;
          created_at?: string | null;
          display_name: string;
          id?: string;
          industry?: string | null;
          updated_at?: string | null;
          user_id: string;
          verified?: boolean | null;
          website?: string | null;
        };
        Update: {
          cnpj?: string | null;
          created_at?: string | null;
          display_name?: string;
          id?: string;
          industry?: string | null;
          updated_at?: string | null;
          user_id?: string;
          verified?: boolean | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contracts: {
        Row: {
          company_id: string;
          created_at: string | null;
          end_date: string | null;
          freela_id: string;
          id: string;
          job_id: string;
          model: Database["public"]["Enums"]["job_model"];
          proposal_id: string;
          scope: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["contract_status"] | null;
          title: string;
          total_value: number;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          end_date?: string | null;
          freela_id: string;
          id?: string;
          job_id: string;
          model: Database["public"]["Enums"]["job_model"];
          proposal_id: string;
          scope: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["contract_status"] | null;
          title: string;
          total_value: number;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          end_date?: string | null;
          freela_id?: string;
          id?: string;
          job_id?: string;
          model?: Database["public"]["Enums"]["job_model"];
          proposal_id?: string;
          scope?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["contract_status"] | null;
          title?: string;
          total_value?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_freela_id_fkey";
            columns: ["freela_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          }
        ];
      };
      freelancer_profiles: {
        Row: {
          availability: string | null;
          bio: string | null;
          created_at: string | null;
          headline: string | null;
          id: string;
          languages: Json | null;
          links: Json | null;
          location: string | null;
          rate_hour: number | null;
          seniority: Database["public"]["Enums"]["seniority_level"] | null;
          skills: Json | null;
          updated_at: string | null;
          user_id: string;
          verified: boolean | null;
        };
        Insert: {
          availability?: string | null;
          bio?: string | null;
          created_at?: string | null;
          headline?: string | null;
          id?: string;
          languages?: Json | null;
          links?: Json | null;
          location?: string | null;
          rate_hour?: number | null;
          seniority?: Database["public"]["Enums"]["seniority_level"] | null;
          skills?: Json | null;
          updated_at?: string | null;
          user_id: string;
          verified?: boolean | null;
        };
        Update: {
          availability?: string | null;
          bio?: string | null;
          created_at?: string | null;
          headline?: string | null;
          id?: string;
          languages?: Json | null;
          links?: Json | null;
          location?: string | null;
          rate_hour?: number | null;
          seniority?: Database["public"]["Enums"]["seniority_level"] | null;
          skills?: Json | null;
          updated_at?: string | null;
          user_id?: string;
          verified?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "freelancer_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      jobs: {
        Row: {
          budget: number | null;
          company_id: string;
          created_at: string | null;
          deadline: string | null;
          description: string;
          id: string;
          model: Database["public"]["Enums"]["job_model"];
          seniority: Database["public"]["Enums"]["seniority_level"] | null;
          skills: Json | null;
          status: Database["public"]["Enums"]["job_status"] | null;
          tags: Json | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          budget?: number | null;
          company_id: string;
          created_at?: string | null;
          deadline?: string | null;
          description: string;
          id?: string;
          model: Database["public"]["Enums"]["job_model"];
          seniority?: Database["public"]["Enums"]["seniority_level"] | null;
          skills?: Json | null;
          status?: Database["public"]["Enums"]["job_status"] | null;
          tags?: Json | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          budget?: number | null;
          company_id?: string;
          created_at?: string | null;
          deadline?: string | null;
          description?: string;
          id?: string;
          model?: Database["public"]["Enums"]["job_model"];
          seniority?: Database["public"]["Enums"]["seniority_level"] | null;
          skills?: Json | null;
          status?: Database["public"]["Enums"]["job_status"] | null;
          tags?: Json | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          attachment_url: string | null;
          created_at: string | null;
          id: string;
          sender_id: string;
          text: string;
          thread_id: string;
        };
        Insert: {
          attachment_url?: string | null;
          created_at?: string | null;
          id?: string;
          sender_id: string;
          text: string;
          thread_id: string;
        };
        Update: {
          attachment_url?: string | null;
          created_at?: string | null;
          id?: string;
          sender_id?: string;
          text?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      milestones: {
        Row: {
          contract_id: string;
          created_at: string | null;
          description: string;
          due_date: string | null;
          id: string;
          order: number;
          status: Database["public"]["Enums"]["milestone_status"] | null;
          updated_at: string | null;
          value: number;
        };
        Insert: {
          contract_id: string;
          created_at?: string | null;
          description: string;
          due_date?: string | null;
          id?: string;
          order: number;
          status?: Database["public"]["Enums"]["milestone_status"] | null;
          updated_at?: string | null;
          value: number;
        };
        Update: {
          contract_id?: string;
          created_at?: string | null;
          description?: string;
          due_date?: string | null;
          id?: string;
          order?: number;
          status?: Database["public"]["Enums"]["milestone_status"] | null;
          updated_at?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "milestones_contract_id_fkey";
            columns: ["contract_id"];
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          created_at: string | null;
          gross_value: number;
          id: string;
          milestone_id: string;
          net_value: number;
          paid_at: string | null;
          platform_fee: number;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_payment_id: string | null;
          qr_code: string | null;
          status: Database["public"]["Enums"]["payment_status"] | null;
          updated_at: string | null;
          webhook_payload: Json | null;
        };
        Insert: {
          created_at?: string | null;
          gross_value: number;
          id?: string;
          milestone_id: string;
          net_value: number;
          paid_at?: string | null;
          platform_fee: number;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_payment_id?: string | null;
          qr_code?: string | null;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          updated_at?: string | null;
          webhook_payload?: Json | null;
        };
        Update: {
          created_at?: string | null;
          gross_value?: number;
          id?: string;
          milestone_id?: string;
          net_value?: number;
          paid_at?: string | null;
          platform_fee?: number;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_payment_id?: string | null;
          qr_code?: string | null;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          updated_at?: string | null;
          webhook_payload?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_milestone_id_fkey";
            columns: ["milestone_id"];
            isOneToOne: false;
            referencedRelation: "milestones";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          role: Database["public"]["Enums"]["user_role"];
          trust_score: number | null;
          updated_at: string | null;
          verif_level: number | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          name: string;
          role: Database["public"]["Enums"]["user_role"];
          trust_score?: number | null;
          updated_at?: string | null;
          verif_level?: number | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          trust_score?: number | null;
          updated_at?: string | null;
          verif_level?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      proposals: {
        Row: {
          attachment_url: string | null;
          created_at: string | null;
          duration: string | null;
          freela_id: string;
          id: string;
          job_id: string;
          message: string;
          price: number | null;
          status: Database["public"]["Enums"]["proposal_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          attachment_url?: string | null;
          created_at?: string | null;
          duration?: string | null;
          freela_id: string;
          id?: string;
          job_id: string;
          message: string;
          price?: number | null;
          status?: Database["public"]["Enums"]["proposal_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          attachment_url?: string | null;
          created_at?: string | null;
          duration?: string | null;
          freela_id?: string;
          id?: string;
          job_id?: string;
          message?: string;
          price?: number | null;
          status?: Database["public"]["Enums"]["proposal_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "proposals_freela_id_fkey";
            columns: ["freela_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      shortlist: {
        Row: {
          created_at: string | null;
          freela_id: string;
          id: string;
          job_id: string;
          rank: number;
          score_json: Json | null;
        };
        Insert: {
          created_at?: string | null;
          freela_id: string;
          id?: string;
          job_id: string;
          rank: number;
          score_json?: Json | null;
        };
        Update: {
          created_at?: string | null;
          freela_id?: string;
          id?: string;
          job_id?: string;
          rank?: number;
          score_json?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "shortlist_freela_id_fkey";
            columns: ["freela_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shortlist_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: {
          aud: string;
          confirmation_sent_at: string;
          confirmed_at: string;
          created_at: string;
          email: string;
          email_confirmed_at: string;
          id: string;
          identities: Json;
          invited_at: string;
          is_sso_user: boolean;
          last_sign_in_at: string;
          phone: string;
          recovery_sent_at: string;
          role: string;
          updated_at: string;
          user_metadata: Json;
        };
      };
      update_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      contract_status: "ATIVO" | "CONCLUIDO" | "CANCELADO";
      job_model: "FIXO" | "HORA";
      job_status: "ATIVO" | "FECHADO" | "PAUSADO";
      milestone_status: "PENDENTE" | "PAGO" | "ENTREGUE" | "APROVADO";
      payment_provider: "ASAAS" | "PAGARME" | "MERCADOPAGO";
      payment_status: "PENDENTE" | "PAGO" | "FALHOU";
      proposal_status: "ENVIADA" | "ACEITA" | "REJEITADA";
      seniority_level: "JUNIOR" | "PLENO" | "SENIOR" | "ESPECIALISTA";
      user_role: "FREELA" | "EMPRESA" | "ADMIN";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      job_model: ["FIXO", "HORA"],
      job_status: ["ATIVO", "FECHADO", "PAUSADO"],
      proposal_status: ["ENVIADA", "ACEITA", "REJEITADA"],
      seniority_level: ["JUNIOR", "PLENO", "SENIOR", "ESPECIALISTA"],
      user_role: ["FREELA", "EMPRESA", "ADMIN"],
    },
  },
} as const;
