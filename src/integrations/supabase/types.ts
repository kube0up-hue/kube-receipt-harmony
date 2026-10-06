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
          branch_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_user?: string | null
          branch_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_user?: string | null
          branch_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_kubeup_generations: {
        Row: {
          aspect_ratio: string
          brand_mode: boolean
          created_at: string
          created_by: string | null
          error_message: string | null
          final_prompt: string
          generated_image_path: string | null
          generated_image_url: string | null
          id: string
          model_name: string
          prompt: string
          reference_images: Json
          resolution: string
          settings: Json
          status: string
          updated_at: string
        }
        Insert: {
          aspect_ratio?: string
          brand_mode?: boolean
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          final_prompt: string
          generated_image_path?: string | null
          generated_image_url?: string | null
          id?: string
          model_name?: string
          prompt: string
          reference_images?: Json
          resolution?: string
          settings?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          aspect_ratio?: string
          brand_mode?: boolean
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          final_prompt?: string
          generated_image_path?: string | null
          generated_image_url?: string | null
          id?: string
          model_name?: string
          prompt?: string
          reference_images?: Json
          resolution?: string
          settings?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_kubeup_studio_settings: {
        Row: {
          brand_instruction: string
          setting_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          brand_instruction: string
          setting_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          brand_instruction?: string
          setting_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          kind: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      count_lines: {
        Row: {
          adjust_qty: number
          counted_at: string | null
          counted_by: string | null
          counted_qty: number | null
          created_at: string
          expected_qty: number
          foodics_diff: number | null
          foodics_qty: number | null
          id: string
          match_status: Database["public"]["Enums"]["count_match_status"] | null
          note: string | null
          prev_count_qty: number
          product_id: string
          purchases_qty: number
          session_id: string
          transfer_in_qty: number
          transfer_out_qty: number
          unit_price: number
          updated_at: string
          variance_qty: number
          variance_value: number
          waste_qty: number
        }
        Insert: {
          adjust_qty?: number
          counted_at?: string | null
          counted_by?: string | null
          counted_qty?: number | null
          created_at?: string
          expected_qty?: number
          foodics_diff?: number | null
          foodics_qty?: number | null
          id?: string
          match_status?:
            | Database["public"]["Enums"]["count_match_status"]
            | null
          note?: string | null
          prev_count_qty?: number
          product_id: string
          purchases_qty?: number
          session_id: string
          transfer_in_qty?: number
          transfer_out_qty?: number
          unit_price?: number
          updated_at?: string
          variance_qty?: number
          variance_value?: number
          waste_qty?: number
        }
        Update: {
          adjust_qty?: number
          counted_at?: string | null
          counted_by?: string | null
          counted_qty?: number | null
          created_at?: string
          expected_qty?: number
          foodics_diff?: number | null
          foodics_qty?: number | null
          id?: string
          match_status?:
            | Database["public"]["Enums"]["count_match_status"]
            | null
          note?: string | null
          prev_count_qty?: number
          product_id?: string
          purchases_qty?: number
          session_id?: string
          transfer_in_qty?: number
          transfer_out_qty?: number
          unit_price?: number
          updated_at?: string
          variance_qty?: number
          variance_value?: number
          waste_qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "count_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "count_lines_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "count_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      count_sessions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          baseline_at: string
          branch_id: string
          cancel_reason: string | null
          count_date: string
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["count_kind"]
          note: string | null
          prev_session_id: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["count_session_status"]
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          baseline_at?: string
          branch_id: string
          cancel_reason?: string | null
          count_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: Database["public"]["Enums"]["count_kind"]
          note?: string | null
          prev_session_id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["count_session_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          baseline_at?: string
          branch_id?: string
          cancel_reason?: string | null
          count_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["count_kind"]
          note?: string | null
          prev_session_id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["count_session_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "count_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "count_sessions_prev_session_id_fkey"
            columns: ["prev_session_id"]
            isOneToOne: false
            referencedRelation: "count_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales: {
        Row: {
          branch_id: string
          card_amount: number
          cash_amount: number
          created_at: string
          id: string
          note: string | null
          orders_count: number
          other_amount: number
          recorded_by: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sales_date: string
          status: Database["public"]["Enums"]["sales_status"]
          submitted_at: string | null
          submitted_by: string | null
          total_sales: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          card_amount?: number
          cash_amount?: number
          created_at?: string
          id?: string
          note?: string | null
          orders_count?: number
          other_amount?: number
          recorded_by?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sales_date: string
          status?: Database["public"]["Enums"]["sales_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          total_sales?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          card_amount?: number
          cash_amount?: number
          created_at?: string
          id?: string
          note?: string | null
          orders_count?: number
          other_amount?: number
          recorded_by?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sales_date?: string
          status?: Database["public"]["Enums"]["sales_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          total_sales?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          branch: string | null
          branch_id: string
          created_at: string
          full_name: string
          hire_date: string | null
          id: string
          is_active: boolean
          job_title: string | null
          note: string | null
          phone: string | null
          pin_code: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch?: string | null
          branch_id: string
          created_at?: string
          full_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          note?: string | null
          phone?: string | null
          pin_code: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch?: string | null
          branch_id?: string
          created_at?: string
          full_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          note?: string | null
          phone?: string | null
          pin_code?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
          branch_id: string
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
          branch_id: string
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
          branch_id?: string
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
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
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
      pin_login_attempts: {
        Row: {
          created_at: string
          id: string
          ip: string
          reason: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          reason?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          reason?: string | null
          success?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          foodics_stock: number | null
          id: string
          is_counted: boolean
          is_hidden: boolean
          min_qty: number
          name: string
          sort_order: number
          storage_location: string | null
          supplier_id: string
          unit: Database["public"]["Enums"]["unit_type"]
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          foodics_stock?: number | null
          id?: string
          is_counted?: boolean
          is_hidden?: boolean
          min_qty?: number
          name: string
          sort_order?: number
          storage_location?: string | null
          supplier_id: string
          unit: Database["public"]["Enums"]["unit_type"]
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          foodics_stock?: number | null
          id?: string
          is_counted?: boolean
          is_hidden?: boolean
          min_qty?: number
          name?: string
          sort_order?: number
          storage_location?: string | null
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
      quality_metrics: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          max_ok: number | null
          min_ok: number | null
          requires_photo: boolean
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          max_ok?: number | null
          min_ok?: number | null
          requires_photo?: boolean
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          max_ok?: number | null
          min_ok?: number | null
          requires_photo?: boolean
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      quality_readings: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          metric_id: string
          note: string | null
          photo_paths: string[]
          reading_at: string
          recorded_by: string | null
          status: Database["public"]["Enums"]["quality_status"]
          value: number
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          metric_id: string
          note?: string | null
          photo_paths?: string[]
          reading_at?: string
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["quality_status"]
          value: number
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          metric_id?: string
          note?: string | null
          photo_paths?: string[]
          reading_at?: string
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["quality_status"]
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "quality_readings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_readings_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "quality_metrics"
            referencedColumns: ["id"]
          },
        ]
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
          branch_id: string
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
          branch_id: string
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
          branch_id?: string
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
            foreignKeyName: "receipts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
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
      recipe_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          items: Json
          note: string | null
          recipe_id: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json
          note?: string | null
          recipe_id: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json
          note?: string | null
          recipe_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          yield_qty: number
          yield_unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          yield_qty?: number
          yield_unit?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          yield_qty?: number
          yield_unit?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          branch_id: string
          created_at: string
          created_by: string | null
          employee_id: string
          end_time: string
          id: string
          note: string | null
          shift_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          created_by?: string | null
          employee_id: string
          end_time: string
          id?: string
          note?: string | null
          shift_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string
          end_time?: string
          id?: string
          note?: string | null
          shift_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_ledger: {
        Row: {
          actor_user: string | null
          balance_after: number
          branch_id: string
          created_at: string
          id: string
          note: string | null
          product_id: string
          qty_delta: number
          reason: Database["public"]["Enums"]["stock_reason"]
          ref_id: string | null
          ref_table: string | null
        }
        Insert: {
          actor_user?: string | null
          balance_after: number
          branch_id: string
          created_at?: string
          id?: string
          note?: string | null
          product_id: string
          qty_delta: number
          reason: Database["public"]["Enums"]["stock_reason"]
          ref_id?: string | null
          ref_table?: string | null
        }
        Update: {
          actor_user?: string | null
          balance_after?: number
          branch_id?: string
          created_at?: string
          id?: string
          note?: string | null
          product_id?: string
          qty_delta?: number
          reason?: Database["public"]["Enums"]["stock_reason"]
          ref_id?: string | null
          ref_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_ledger_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          product_id: string
          qty: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          product_id: string
          qty?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          product_id?: string
          qty?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          created_at: string
          id: string
          note: string | null
          product_id: string
          qty_received: number | null
          qty_sent: number
          transfer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          product_id: string
          qty_received?: number | null
          qty_sent: number
          transfer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          product_id?: string
          qty_received?: number | null
          qty_sent?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string
          from_branch_id: string
          id: string
          note: string | null
          received_at: string | null
          received_by: string | null
          sent_at: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          to_branch_id: string
          transfer_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_branch_id: string
          id?: string
          note?: string | null
          received_at?: string | null
          received_by?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_branch_id: string
          transfer_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_branch_id?: string
          id?: string
          note?: string | null
          received_at?: string | null
          received_by?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_branch_id?: string
          transfer_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
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
      user_branches: {
        Row: {
          branch_id: string
          created_at: string
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
      waste_entries: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          note: string | null
          photo_paths: string[]
          product_id: string
          qty: number
          reason: string
          reason_code: Database["public"]["Enums"]["waste_reason"]
          recorded_by: string | null
          unit_price: number
          waste_date: string
          waste_value: number
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          note?: string | null
          photo_paths?: string[]
          product_id: string
          qty: number
          reason: string
          reason_code: Database["public"]["Enums"]["waste_reason"]
          recorded_by?: string | null
          unit_price?: number
          waste_date?: string
          waste_value?: number
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          note?: string | null
          photo_paths?: string[]
          product_id?: string
          qty?: number
          reason?: string
          reason_code?: Database["public"]["Enums"]["waste_reason"]
          recorded_by?: string | null
          unit_price?: number
          waste_date?: string
          waste_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "waste_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_orders_effective: {
        Row: {
          branch_id: string | null
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
          branch_id?: string | null
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
          branch_id?: string | null
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
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
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
      approve_count_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      cancel_count_session: {
        Args: { p_reason: string; p_session_id: string }
        Returns: undefined
      }
      edit_approved_count_line: {
        Args: { p_counted_qty: number; p_line_id: string; p_reason: string }
        Returns: undefined
      }
      edit_approved_daily_sales: {
        Args: {
          p_card: number
          p_cash: number
          p_id: string
          p_orders_count: number
          p_other: number
          p_reason: string
          p_total: number
        }
        Returns: undefined
      }
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
      open_count_session: {
        Args: {
          p_branch_id: string
          p_count_date: string
          p_kind: string
          p_note: string
        }
        Returns: string
      }
      record_quality_reading: {
        Args: {
          p_branch_id: string
          p_metric_id: string
          p_note?: string
          p_photo_paths?: string[]
          p_value: number
        }
        Returns: string
      }
      record_waste: {
        Args: {
          p_branch_id: string
          p_note?: string
          p_photo_paths?: string[]
          p_product_id: string
          p_qty: number
          p_reason: string
          p_reason_code: string
          p_waste_date?: string
        }
        Returns: string
      }
      refresh_count_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      review_count_session: {
        Args: { p_accept: boolean; p_note: string; p_session_id: string }
        Returns: undefined
      }
      review_daily_sales: {
        Args: { p_accept: boolean; p_id: string; p_note?: string }
        Returns: undefined
      }
      save_count_lines: {
        Args: { p_lines: Json; p_session_id: string }
        Returns: undefined
      }
      save_daily_sales: {
        Args: {
          p_branch_id: string
          p_card?: number
          p_cash?: number
          p_note?: string
          p_orders_count?: number
          p_other?: number
          p_sales_date: string
          p_total: number
        }
        Returns: string
      }
      set_user_permissions: {
        Args: { p_actor: string; p_permissions: string[]; p_user_id: string }
        Returns: number
      }
      stock_adjust: {
        Args: {
          p_branch_id: string
          p_delta: number
          p_note: string
          p_product_id: string
          p_reason: string
        }
        Returns: number
      }
      stock_transfer_receive: {
        Args: { p_items: Json; p_note: string; p_transfer_id: string }
        Returns: string
      }
      stock_transfer_send: {
        Args: {
          p_from_branch_id: string
          p_items: Json
          p_note: string
          p_to_branch_id: string
        }
        Returns: string
      }
      submit_count_session: {
        Args: { p_note: string; p_session_id: string }
        Returns: undefined
      }
      submit_daily_sales: { Args: { p_id: string }; Returns: undefined }
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
      update_ai_kubeup_brand_instruction: {
        Args: { p_instruction: string }
        Returns: {
          brand_instruction: string
          setting_key: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "ai_kubeup_studio_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_quality_metric_limits: {
        Args: { p_max: number; p_metric_id: string; p_min: number }
        Returns: undefined
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
        | "branches_manage"
        | "branches_view_all"
        | "inventory_view"
        | "inventory_transfer"
        | "inventory_receive_transfer"
        | "inventory_adjust"
        | "count_perform"
        | "count_review"
        | "count_approve"
        | "count_edit_approved"
        | "waste_record"
        | "waste_view"
        | "quality_record"
        | "quality_view"
        | "sales_record"
        | "sales_review"
        | "sales_edit_approved"
        | "recipes_manage"
        | "schedules_manage"
        | "employees_manage"
        | "orders_create"
        | "orders_approve"
        | "orders_receive"
        | "tomorrow_orders_create"
        | "tomorrow_orders_approve"
        | "alerts_view"
        | "ai_studio_use"
      app_role:
        | "admin"
        | "accountant"
        | "branch_employee"
        | "owner"
        | "branch_manager"
        | "operations"
      billing_cycle: "weekly" | "biweekly" | "monthly" | "custom"
      count_kind: "cycle_1" | "cycle_15" | "extra"
      count_match_status: "matched" | "minor_diff" | "mismatch"
      count_session_status:
        | "open"
        | "in_progress"
        | "submitted"
        | "reviewed"
        | "approved"
        | "cancelled"
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
      quality_status: "ok" | "warn" | "out_of_range"
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
      sales_status: "draft" | "submitted" | "approved"
      stock_reason:
        | "purchase"
        | "receipt"
        | "transfer_out"
        | "transfer_in"
        | "count_adjust"
        | "waste"
        | "manual_adjust"
        | "return"
        | "correction"
      transfer_status: "draft" | "sent" | "received" | "cancelled"
      unit_type: "حبة" | "لتر" | "كيلو" | "كرتون" | "صينية" | "عبوة"
      waste_reason:
        | "expired"
        | "damaged"
        | "spillage"
        | "prep_error"
        | "quality"
        | "customer_return"
        | "other"
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
        "branches_manage",
        "branches_view_all",
        "inventory_view",
        "inventory_transfer",
        "inventory_receive_transfer",
        "inventory_adjust",
        "count_perform",
        "count_review",
        "count_approve",
        "count_edit_approved",
        "waste_record",
        "waste_view",
        "quality_record",
        "quality_view",
        "sales_record",
        "sales_review",
        "sales_edit_approved",
        "recipes_manage",
        "schedules_manage",
        "employees_manage",
        "orders_create",
        "orders_approve",
        "orders_receive",
        "tomorrow_orders_create",
        "tomorrow_orders_approve",
        "alerts_view",
        "ai_studio_use",
      ],
      app_role: [
        "admin",
        "accountant",
        "branch_employee",
        "owner",
        "branch_manager",
        "operations",
      ],
      billing_cycle: ["weekly", "biweekly", "monthly", "custom"],
      count_kind: ["cycle_1", "cycle_15", "extra"],
      count_match_status: ["matched", "minor_diff", "mismatch"],
      count_session_status: [
        "open",
        "in_progress",
        "submitted",
        "reviewed",
        "approved",
        "cancelled",
      ],
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
      quality_status: ["ok", "warn", "out_of_range"],
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
      sales_status: ["draft", "submitted", "approved"],
      stock_reason: [
        "purchase",
        "receipt",
        "transfer_out",
        "transfer_in",
        "count_adjust",
        "waste",
        "manual_adjust",
        "return",
        "correction",
      ],
      transfer_status: ["draft", "sent", "received", "cancelled"],
      unit_type: ["حبة", "لتر", "كيلو", "كرتون", "صينية", "عبوة"],
      waste_reason: [
        "expired",
        "damaged",
        "spillage",
        "prep_error",
        "quality",
        "customer_return",
        "other",
      ],
    },
  },
} as const
