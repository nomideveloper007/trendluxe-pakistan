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
      blog_posts: {
        Row: {
          category: string
          content: Json
          created_at: string
          excerpt: string
          id: string
          image_key: string
          published: boolean
          published_at: string | null
          read_minutes: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: Json
          created_at?: string
          excerpt: string
          id?: string
          image_key: string
          published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          excerpt?: string
          id?: string
          image_key?: string
          published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["comment_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["comment_target"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["comment_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["comment_target"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["comment_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["comment_target"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_slug: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_slug: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_slug?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_carts: {
        Row: {
          user_id: string
          cart_items: Json
          saved_items: Json
          coupon_code: string | null
          gift_note: string
          updated_at: string
        }
        Insert: {
          user_id: string
          cart_items?: Json
          saved_items?: Json
          coupon_code?: string | null
          gift_note?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          cart_items?: Json
          saved_items?: Json
          coupon_code?: string | null
          gift_note?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trend_likes: {
        Row: {
          created_at: string
          id: string
          trend_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          trend_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          trend_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      trends: {
        Row: {
          category_slug: string
          content: Json
          created_at: string
          excerpt: string
          gallery_keys: Json
          id: string
          image_key: string
          likes_seed: number
          published: boolean
          published_at: string | null
          slug: string
          tags: string[]
          tips: Json
          title: string
          updated_at: string
          views_seed: number
        }
        Insert: {
          category_slug: string
          content?: Json
          created_at?: string
          excerpt: string
          gallery_keys?: Json
          id?: string
          image_key: string
          likes_seed?: number
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[]
          tips?: Json
          title: string
          updated_at?: string
          views_seed?: number
        }
        Update: {
          category_slug?: string
          content?: Json
          created_at?: string
          excerpt?: string
          gallery_keys?: Json
          id?: string
          image_key?: string
          likes_seed?: number
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[]
          tips?: Json
          title?: string
          updated_at?: string
          views_seed?: number
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
      products: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          short_description: string
          price: number
          compare_at_price: number | null
          images: string[]
          video_url: string | null
          stock_status: "in_stock" | "low_stock" | "out_of_stock"
          sku: string
          brand: string
          category: string
          sizes: string[]
          colors: string[]
          fabric: string | null
          embroidery: string | null
          rating: number
          review_count: number
          tags: string[]
          is_featured: boolean
          is_trending: boolean
          is_best_seller: boolean
          is_new_arrival: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description: string
          short_description: string
          price: number
          compare_at_price?: number | null
          images?: string[]
          video_url?: string | null
          stock_status?: "in_stock" | "low_stock" | "out_of_stock"
          sku: string
          brand?: string
          category: string
          sizes?: string[]
          colors?: string[]
          fabric?: string | null
          embroidery?: string | null
          rating?: number
          review_count?: number
          tags?: string[]
          is_featured?: boolean
          is_trending?: boolean
          is_best_seller?: boolean
          is_new_arrival?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string
          short_description?: string
          price?: number
          compare_at_price?: number | null
          images?: string[]
          video_url?: string | null
          stock_status?: "in_stock" | "low_stock" | "out_of_stock"
          sku?: string
          brand?: string
          category?: string
          sizes?: string[]
          colors?: string[]
          fabric?: string | null
          embroidery?: string | null
          rating?: number
          review_count?: number
          tags?: string[]
          is_featured?: boolean
          is_trending?: boolean
          is_best_seller?: boolean
          is_new_arrival?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          size: string
          color: string
          quantity: number
          reserved_quantity: number
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          color: string
          quantity?: number
          reserved_quantity?: number
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          color?: string
          quantity?: number
          reserved_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: "percentage" | "fixed" | "free_shipping"
          discount_value: number
          min_purchase_amount: number
          start_date: string
          end_date: string
          usage_limit: number | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: "percentage" | "fixed" | "free_shipping"
          discount_value: number
          min_purchase_amount?: number
          start_date?: string
          end_date: string
          usage_limit?: number | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: "percentage" | "fixed" | "free_shipping"
          discount_value?: number
          min_purchase_amount?: number
          start_date?: string
          end_date?: string
          usage_limit?: number | null
          usage_count?: number
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: string
          email: string
          first_name: string
          last_name: string
          phone: string
          shipping_address: Json
          billing_address: Json
          delivery_method: string
          shipping_cost: number
          tax_cost: number
          discount_amount: number
          subtotal: number
          total: number
          coupon_code: string | null
          payment_method: string
          payment_status: string
          tracking_number: string | null
          order_notes: string | null
          gift_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: string
          email: string
          first_name: string
          last_name: string
          phone: string
          shipping_address: Json
          billing_address: Json
          delivery_method?: string
          shipping_cost?: number
          tax_cost?: number
          discount_amount?: number
          subtotal: number
          total: number
          coupon_code?: string | null
          payment_method: string
          payment_status?: string
          tracking_number?: string | null
          order_notes?: string | null
          gift_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          shipping_address?: Json
          billing_address?: Json
          delivery_method?: string
          shipping_cost?: number
          tax_cost?: number
          discount_amount?: number
          subtotal?: number
          total?: number
          coupon_code?: string | null
          payment_method?: string
          payment_status?: string
          tracking_number?: string | null
          order_notes?: string | null
          gift_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_title: string
          size: string
          color: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_title: string
          size: string
          color: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_title?: string
          size?: string
          color?: string
          quantity?: number
          price?: number
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          display_name: string
          rating: number
          title: string | null
          comment: string
          images: string[]
          verified_purchase: boolean
          status: "visible" | "hidden"
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          display_name: string
          rating: number
          title?: string | null
          comment: string
          images?: string[]
          verified_purchase?: boolean
          status?: "visible" | "hidden"
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          display_name?: string
          rating?: number
          title?: string | null
          comment?: string
          images?: string[]
          verified_purchase?: boolean
          status?: "visible" | "hidden"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          first_name: string
          last_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          first_name: string
          last_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          first_name?: string
          last_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
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
      decrement_inventory: {
        Args: {
          p_id: string
          sz: string
          col: string
          qty: number
        }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: {
          coupon_code: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      comment_status: "visible" | "hidden"
      comment_target: "trend" | "post"
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
      app_role: ["admin", "user"],
      comment_status: ["visible", "hidden"],
      comment_target: ["trend", "post"],
    },
  },
} as const
