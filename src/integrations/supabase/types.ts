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
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          level: number
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          level: number
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          level?: number
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_attributes: {
        Row: {
          attribute_type: string
          attribute_value: string
          category_id: string | null
          id: string
        }
        Insert: {
          attribute_type: string
          attribute_value: string
          category_id?: string | null
          id?: string
        }
        Update: {
          attribute_type?: string
          attribute_value?: string
          category_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_attributes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_rates: {
        Row: {
          id: string
          is_active: boolean | null
          last_updated: string | null
          name: string
          rate_eur: number
          rate_gbp: number
          rate_usd: number
          symbol: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          name: string
          rate_eur: number
          rate_gbp: number
          rate_usd: number
          symbol: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          name?: string
          rate_eur?: number
          rate_gbp?: number
          rate_usd?: number
          symbol?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          brand: string | null
          category: string
          color: string[] | null
          condition: string | null
          created_at: string | null
          crypto_amount: number | null
          crypto_currency: string | null
          description: string
          id: string
          images: string[] | null
          location: string
          material: string[] | null
          model: string | null
          payment_status: string | null
          price: number
          shipping_method: string | null
          shipping_weight: number | null
          size: string | null
          species: string | null
          status: string | null
          subcategory: string | null
          subsubcategory: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string[] | null
          condition?: string | null
          created_at?: string | null
          crypto_amount?: number | null
          crypto_currency?: string | null
          description: string
          id?: string
          images?: string[] | null
          location: string
          material?: string[] | null
          model?: string | null
          payment_status?: string | null
          price: number
          shipping_method?: string | null
          shipping_weight?: number | null
          size?: string | null
          species?: string | null
          status?: string | null
          subcategory?: string | null
          subsubcategory?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string[] | null
          condition?: string | null
          created_at?: string | null
          crypto_amount?: number | null
          crypto_currency?: string | null
          description?: string
          id?: string
          images?: string[] | null
          location?: string
          material?: string[] | null
          model?: string | null
          payment_status?: string | null
          price?: number
          shipping_method?: string | null
          shipping_weight?: number | null
          size?: string | null
          species?: string | null
          status?: string | null
          subcategory?: string | null
          subsubcategory?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          delivered: boolean | null
          delivered_at: string | null
          files: string[] | null
          id: string
          listing_id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          delivered?: boolean | null
          delivered_at?: string | null
          files?: string[] | null
          id?: string
          listing_id: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          delivered?: boolean | null
          delivered_at?: string | null
          files?: string[] | null
          id?: string
          listing_id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string
          country: string
          created_at: string | null
          first_name: string
          full_name: string
          id: string
          language: string
          last_name: string
          phone_number: string
          preferred_network: string | null
          updated_at: string | null
          username: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          city: string
          country: string
          created_at?: string | null
          first_name: string
          full_name: string
          id: string
          language: string
          last_name: string
          phone_number: string
          preferred_network?: string | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string
          country?: string
          created_at?: string | null
          first_name?: string
          full_name?: string
          id?: string
          language?: string
          last_name?: string
          phone_number?: string
          preferred_network?: string | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      smart_contracts: {
        Row: {
          address: string
          chain_id: number
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          network: string
          updated_at: string | null
        }
        Insert: {
          address: string
          chain_id: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          network: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          chain_id?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          network?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          blockchain_sequence_number: number | null
          blockchain_txn_id: string
          buyer_confirmation: boolean | null
          buyer_id: string | null
          can_be_cancelled: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          chain_id: number | null
          commission_amount: number
          created_at: string | null
          dispute_reason: string | null
          dispute_resolution: string | null
          dispute_status: string | null
          escrow_release_time: string | null
          escrow_status: string | null
          funds_secured: boolean | null
          funds_secured_at: string | null
          id: string
          listing_id: string | null
          network: string | null
          released_at: string | null
          released_by: string | null
          seller_confirmation: boolean | null
          seller_id: string | null
          seller_wallet_address: string | null
          smart_contract_address: string | null
          status: string | null
          token_symbol: string | null
          transaction_confirmed_at: string | null
          transaction_hash: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          blockchain_sequence_number?: number | null
          blockchain_txn_id?: string
          buyer_confirmation?: boolean | null
          buyer_id?: string | null
          can_be_cancelled?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chain_id?: number | null
          commission_amount: number
          created_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          dispute_status?: string | null
          escrow_release_time?: string | null
          escrow_status?: string | null
          funds_secured?: boolean | null
          funds_secured_at?: string | null
          id?: string
          listing_id?: string | null
          network?: string | null
          released_at?: string | null
          released_by?: string | null
          seller_confirmation?: boolean | null
          seller_id?: string | null
          seller_wallet_address?: string | null
          smart_contract_address?: string | null
          status?: string | null
          token_symbol?: string | null
          transaction_confirmed_at?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          blockchain_sequence_number?: number | null
          blockchain_txn_id?: string
          buyer_confirmation?: boolean | null
          buyer_id?: string | null
          can_be_cancelled?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chain_id?: number | null
          commission_amount?: number
          created_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          dispute_status?: string | null
          escrow_release_time?: string | null
          escrow_status?: string | null
          funds_secured?: boolean | null
          funds_secured_at?: string | null
          id?: string
          listing_id?: string | null
          network?: string | null
          released_at?: string | null
          released_by?: string | null
          seller_confirmation?: boolean | null
          seller_id?: string | null
          seller_wallet_address?: string | null
          smart_contract_address?: string | null
          status?: string | null
          token_symbol?: string | null
          transaction_confirmed_at?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transactions_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transactions_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      transaction_details: {
        Row: {
          amount: number | null
          blockchain_sequence_number: number | null
          blockchain_txn_id: string | null
          buyer_confirmation: boolean | null
          buyer_id: string | null
          buyer_name: string | null
          can_be_cancelled: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          chain_id: number | null
          commission_amount: number | null
          created_at: string | null
          crypto_amount: number | null
          crypto_currency: string | null
          dispute_reason: string | null
          dispute_resolution: string | null
          dispute_status: string | null
          escrow_release_time: string | null
          escrow_status: string | null
          funds_secured: boolean | null
          funds_secured_at: string | null
          id: string | null
          listing_id: string | null
          listing_title: string | null
          network: string | null
          released_at: string | null
          released_by: string | null
          seller_confirmation: boolean | null
          seller_id: string | null
          seller_name: string | null
          seller_wallet_address: string | null
          smart_contract_address: string | null
          status: string | null
          token_symbol: string | null
          transaction_confirmed_at: string | null
          transaction_hash: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transactions_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transactions_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_listings: {
        Args: {
          page_number?: number
          items_per_page?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          price: number
          image_url: string
          owner_id: string
          created_at: string
          username: string
          avatar_url: string
        }[]
      }
      get_listings_by_category: {
        Args: {
          category_name: string
          page_number?: number
          items_per_page?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          price: number
          image_url: string
          owner_id: string
          created_at: string
          username: string
          avatar_url: string
        }[]
      }
      insert_category_with_subs: {
        Args: {
          main_category: string
          subcategories: string[]
        }
        Returns: undefined
      }
      insert_subcategories: {
        Args: {
          parent_name: string
          subcategories: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      escrow_status_type:
        | "pending"
        | "funded"
        | "confirmed_by_buyer"
        | "confirmed_by_seller"
        | "completed"
        | "refunded"
        | "disputed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
