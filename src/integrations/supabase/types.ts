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
      bank_details: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at: string | null
          employee_id: string | null
          iban_code: string | null
          id: string
          ifsc_code: string | null
          is_agency: boolean | null
          sort_code: string | null
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at?: string | null
          employee_id?: string | null
          iban_code?: string | null
          id?: string
          ifsc_code?: string | null
          is_agency?: boolean | null
          sort_code?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          employee_id?: string | null
          iban_code?: string | null
          id?: string
          ifsc_code?: string | null
          is_agency?: boolean | null
          sort_code?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          country: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          country: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          country?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          document_type: string
          employee_id: string | null
          file_name: string
          file_path: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_type: string
          employee_id?: string | null
          file_name: string
          file_path: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_type?: string
          employee_id?: string | null
          file_name?: string
          file_path?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_details: {
        Row: {
          agency_address: string | null
          agency_company: string | null
          company_number: string | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          emergency_contact_relation: string | null
          employee_id: string | null
          id: string
          insurance_details: string | null
          nationality: string | null
          passport_expiry: string | null
          passport_number: string | null
          pc_status: string | null
          tax_reference: string | null
          updated_at: string | null
          vat_number: string | null
          work_permit_details: string | null
        }
        Insert: {
          agency_address?: string | null
          agency_company?: string | null
          company_number?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          emergency_contact_relation?: string | null
          employee_id?: string | null
          id?: string
          insurance_details?: string | null
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          pc_status?: string | null
          tax_reference?: string | null
          updated_at?: string | null
          vat_number?: string | null
          work_permit_details?: string | null
        }
        Update: {
          agency_address?: string | null
          agency_company?: string | null
          company_number?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          emergency_contact_relation?: string | null
          employee_id?: string | null
          id?: string
          insurance_details?: string | null
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          pc_status?: string | null
          tax_reference?: string | null
          updated_at?: string | null
          vat_number?: string | null
          work_permit_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          employee_number: string | null
          employment_type: string
          end_date: string | null
          first_name: string
          home_number: string | null
          id: string
          last_name: string
          mobile_number: string | null
          postal_address: string | null
          role: string
          start_date: string
          updated_at: string | null
          user_id: string | null
          work_location: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          employee_number?: string | null
          employment_type: string
          end_date?: string | null
          first_name: string
          home_number?: string | null
          id?: string
          last_name: string
          mobile_number?: string | null
          postal_address?: string | null
          role: string
          start_date: string
          updated_at?: string | null
          user_id?: string | null
          work_location?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          employee_number?: string | null
          employment_type?: string
          end_date?: string | null
          first_name?: string
          home_number?: string | null
          id?: string
          last_name?: string
          mobile_number?: string | null
          postal_address?: string | null
          role?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          currency: string
          employee_id: string | null
          file_path: string | null
          generated_at: string | null
          id: string
          invoice_number: string
          month: number
          paid_at: string | null
          status: string | null
          year: number
        }
        Insert: {
          amount: number
          currency: string
          employee_id?: string | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          invoice_number: string
          month: number
          paid_at?: string | null
          status?: string | null
          year: number
        }
        Update: {
          amount?: number
          currency?: string
          employee_id?: string | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          invoice_number?: string
          month?: number
          paid_at?: string | null
          status?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      salaries: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          effective_from: string
          effective_to: string | null
          employee_id: string | null
          id: string
          salary_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          effective_from: string
          effective_to?: string | null
          employee_id?: string | null
          id?: string
          salary_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string | null
          id?: string
          salary_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          created_at: string | null
          date: string
          hours: number | null
          id: string
          leave_type: string | null
          notes: string | null
          timesheet_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hours?: number | null
          id?: string
          leave_type?: string | null
          notes?: string | null
          timesheet_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hours?: number | null
          id?: string
          leave_type?: string | null
          notes?: string | null
          timesheet_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          month: number
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          month: number
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          month?: number
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { required_role: string }
        Returns: boolean
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
