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
      activity_log: {
        Row: {
          action: string
          actor_name: string | null
          actor_user: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_user?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_user?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          branch: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          pin_code: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          pin_code: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          pin_code?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          invoiced_qty: number
          line_total: number
          product_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          invoiced_qty: number
          line_total?: number
          product_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          invoiced_qty?: number
          line_total?: number
          product_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_matches: {
        Row: {
          created_at: string
          id: string
          invoice_diff: number
          invoice_id: string
          product_id: string
          status: Database["public"]["Enums"]["invoice_match_status"]
          total_accepted: number
          total_damaged: number
          total_invoiced: number
          total_ordered: number
          total_received: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_diff?: number
          invoice_id: string
          product_id: string
          status?: Database["public"]["Enums"]["invoice_match_status"]
          total_accepted?: number
          total_damaged?: number
          total_invoiced?: number
          total_ordered?: number
          total_received?: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_diff?: number
          invoice_id?: string
          product_id?: string
          status?: Database["public"]["Enums"]["invoice_match_status"]
          total_accepted?: number
          total_damaged?: number
          total_invoiced?: number
          total_ordered?: number
          total_received?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_matches_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_matches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          accountant_note: string | null
          admin_override_by: string | null
          admin_override_reason: string | null
          created_at: string
          created_by: string | null
          file_path: string | null
          id: string
          invoice_date: string
          invoice_number: string
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["invoice_status"]
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          accountant_note?: string | null
          admin_override_by?: string | null
          admin_override_reason?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["invoice_status"]
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          accountant_note?: string | null
          admin_override_by?: string | null
          admin_override_reason?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          ordered_qty: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          ordered_qty: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          ordered_qty?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by_user: string | null
          employee_id: string
          expected_delivery_date: string | null
          id: string
          note: string | null
          order_date: string
          order_number: string
          status: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user?: string | null
          employee_id: string
          expected_delivery_date?: string | null
          id?: string
          note?: string | null
          order_date?: string
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user?: string | null
          employee_id?: string
          expected_delivery_date?: string | null
          id?: string
          note?: string | null
          order_date?: string
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          payment_date: string
          proof_path: string | null
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          payment_date?: string
          proof_path?: string | null
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          payment_date?: string
          proof_path?: string | null
          recorded_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          is_hidden: boolean
          name: string
          sort_order: number
          supplier_id: string
          unit: Database["public"]["Enums"]["unit_type"]
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_hidden?: boolean
          name: string
          sort_order?: number
          supplier_id: string
          unit: Database["public"]["Enums"]["unit_type"]
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_hidden?: boolean
          name?: string
          sort_order?: number
          supplier_id?: string
          unit?: Database["public"]["Enums"]["unit_type"]
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      receipt_items: {
        Row: {
          accepted_qty: number
          created_at: string
          damaged_qty: number
          diff: number
          id: string
          note: string | null
          ordered_qty: number
          product_id: string
          receipt_id: string
          received_qty: number
          status: Database["public"]["Enums"]["receipt_item_status"]
        }
        Insert: {
          accepted_qty?: number
          created_at?: string
          damaged_qty?: number
          diff?: number
          id?: string
          note?: string | null
          ordered_qty?: number
          product_id: string
          receipt_id: string
          received_qty?: number
          status?: Database["public"]["Enums"]["receipt_item_status"]
        }
        Update: {
          accepted_qty?: number
          created_at?: string
          damaged_qty?: number
          diff?: number
          id?: string
          note?: string | null
          ordered_qty?: number
          product_id?: string
          receipt_id?: string
          received_qty?: number
          status?: Database["public"]["Enums"]["receipt_item_status"]
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_photos: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          receipt_id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          receipt_id: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          receipt_id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_photos_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_photos_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          id: string
          note: string | null
          order_id: string | null
          received_at: string
          received_by_user: string | null
          status: Database["public"]["Enums"]["receipt_status"]
          supplier_id: string
          telegram_error: string | null
          telegram_message_id: number | null
          telegram_notification_status: string
          telegram_sent_at: string | null
          total_accepted: number
          total_damaged: number
          total_ordered: number
          total_over: number
          total_received: number
          total_short: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          id?: string
          note?: string | null
          order_id?: string | null
          received_at?: string
          received_by_user?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          supplier_id: string
          telegram_error?: string | null
          telegram_message_id?: number | null
          telegram_notification_status?: string
          telegram_sent_at?: string | null
          total_accepted?: number
          total_damaged?: number
          total_ordered?: number
          total_over?: number
          total_received?: number
          total_short?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          note?: string | null
          order_id?: string | null
          received_at?: string
          received_by_user?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          supplier_id?: string
          telegram_error?: string | null
          telegram_message_id?: number | null
          telegram_notification_status?: string
          telegram_sent_at?: string | null
          total_accepted?: number
          total_damaged?: number
          total_ordered?: number
          total_over?: number
          total_received?: number
          total_short?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          billing_period_end_day: number | null
          billing_period_start_day: number | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          product_type: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          billing_period_end_day?: number | null
          billing_period_start_day?: number | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          product_type?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          billing_period_end_day?: number | null
          billing_period_start_day?: number | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          product_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
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
    }
    Views: {
      v_orders_effective: {
        Row: {
          created_at: string | null
          created_by_user: string | null
          effective_status: Database["public"]["Enums"]["order_status"] | null
          employee_id: string | null
          expected_delivery_date: string | null
          id: string | null
          note: string | null
          order_date: string | null
          order_number: string | null
          stored_status: Database["public"]["Enums"]["order_status"] | null
          supplier_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user?: string | null
          effective_status?: never
          employee_id?: string | null
          expected_delivery_date?: string | null
          id?: string | null
          note?: string | null
          order_date?: string | null
          order_number?: string | null
          stored_status?: Database["public"]["Enums"]["order_status"] | null
          supplier_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user?: string | null
          effective_status?: never
          employee_id?: string | null
          expected_delivery_date?: string | null
          id?: string | null
          note?: string | null
          order_date?: string | null
          order_number?: string | null
          stored_status?: Database["public"]["Enums"]["order_status"] | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      find_overlapping_invoices: {
        Args: {
          p_period_end: string
          p_period_start: string
          p_supplier_id: string
        }
        Returns: {
          id: string
          invoice_number: string
          period_end: string
          period_start: string
          total_amount: number
        }[]
      }
      mark_receipt_telegram: {
        Args: {
          p_error?: string
          p_message_id?: number
          p_receipt_id: string
          p_status: string
        }
        Returns: undefined
      }
      set_user_permissions: {
        Args: { p_actor: string; p_permissions: string[]; p_user_id: string }
        Returns: number
      }
      submit_invoice_match: {
        Args: {
          p_invoice_date: string
          p_invoice_number: string
          p_items: Json
          p_matches: Json
          p_note: string
          p_period_end: string
          p_period_start: string
          p_supplier_id: string
          p_total_amount: number
        }
        Returns: string
      }
      submit_new_order: {
        Args: {
          p_expected_delivery_date: string
          p_items: Json
          p_note: string
          p_supplier_id: string
        }
        Returns: {
          id: string
          order_number: string
        }[]
      }
      submit_order_receipt: {
        Args: {
          p_items: Json
          p_note: string
          p_order_id: string
          p_photos?: Json
          p_receipt_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_permission:
        | "products_view"
        | "products_write"
        | "products_delete"
        | "products_price_edit"
        | "suppliers_view"
        | "suppliers_write"
        | "suppliers_delete"
        | "invoices_view"
        | "invoices_create_match"
        | "invoices_update"
        | "invoices_delete"
        | "invoices_approve"
        | "payments_view"
        | "payments_create"
        | "payments_manage"
        | "orders_view"
        | "receipt_photos_view"
        | "reports_dues"
        | "reports_export"
        | "reports_integrity"
      app_role: "admin" | "accountant" | "branch_employee"
      billing_cycle: "weekly" | "biweekly" | "monthly" | "custom"
      invoice_match_status:
        | "matched"
        | "invoice_higher"
        | "invoice_lower"
        | "in_invoice_not_received"
        | "received_not_in_invoice"
        | "has_damage_in_invoice"
        | "needs_review"
      invoice_status:
        | "pending_match"
        | "matched_ready"
        | "unmatched"
        | "approved_for_payment"
        | "paid"
      order_status: "pending_receipt" | "received" | "cancelled"
      payment_method: "bank_transfer" | "cash" | "cheque" | "other"
      receipt_item_status:
        | "matched"
        | "short"
        | "over"
        | "not_delivered"
        | "has_damage"
      receipt_status:
        | "draft"
        | "submitted"
        | "approved"
        | "returned_for_review"
        | "no_delivery"
      unit_type: "حبة" | "لتر" | "كيلو" | "كرتون" | "صينية" | "عبوة"
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
      app_permission: [
        "products_view",
        "products_write",
        "products_delete",
        "products_price_edit",
        "suppliers_view",
        "suppliers_write",
        "suppliers_delete",
        "invoices_view",
        "invoices_create_match",
        "invoices_update",
        "invoices_delete",
        "invoices_approve",
        "payments_view",
        "payments_create",
        "payments_manage",
        "orders_view",
        "receipt_photos_view",
        "reports_dues",
        "reports_export",
        "reports_integrity",
      ],
      app_role: ["admin", "accountant", "branch_employee"],
      billing_cycle: ["weekly", "biweekly", "monthly", "custom"],
      invoice_match_status: [
        "matched",
        "invoice_higher",
        "invoice_lower",
        "in_invoice_not_received",
        "received_not_in_invoice",
        "has_damage_in_invoice",
        "needs_review",
      ],
      invoice_status: [
        "pending_match",
        "matched_ready",
        "unmatched",
        "approved_for_payment",
        "paid",
      ],
      order_status: ["pending_receipt", "received", "cancelled"],
      payment_method: ["bank_transfer", "cash", "cheque", "other"],
      receipt_item_status: [
        "matched",
        "short",
        "over",
        "not_delivered",
        "has_damage",
      ],
      receipt_status: [
        "draft",
        "submitted",
        "approved",
        "returned_for_review",
        "no_delivery",
      ],
      unit_type: ["حبة", "لتر", "كيلو", "كرتون", "صينية", "عبوة"],
    },
  },
} as const
