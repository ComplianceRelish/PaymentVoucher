export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string
          password: string
          role: 'admin' | 'requester' | 'approver'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone_number: string
          password: string
          role?: 'admin' | 'requester' | 'approver'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone_number?: string
          password?: string
          role?: 'admin' | 'requester' | 'approver'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      account_heads: {
        Row: {
          id: string
          name: string
          code: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_vouchers: {
        Row: {
          id: string
          voucher_number: string
          date: string
          payee: string
          account_head_id: string
          description: string
          amount: number
          status: 'pending' | 'approved' | 'rejected'
          requested_by: string
          requested_date: string
          approved_by: string | null
          approved_date: string | null
          rejected_by: string | null
          rejected_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          voucher_number?: string
          date?: string
          payee: string
          account_head_id: string
          description: string
          amount: number
          status?: 'pending' | 'approved' | 'rejected'
          requested_by: string
          requested_date?: string
          approved_by?: string | null
          approved_date?: string | null
          rejected_by?: string | null
          rejected_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          voucher_number?: string
          date?: string
          payee?: string
          account_head_id?: string
          description?: string
          amount?: number
          status?: 'pending' | 'approved' | 'rejected'
          requested_by?: string
          requested_date?: string
          approved_by?: string | null
          approved_date?: string | null
          rejected_by?: string | null
          rejected_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}