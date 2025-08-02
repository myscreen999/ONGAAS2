import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          car_number: string;
          phone_number: string;
          profile_picture_url: string | null;
          drivers_license_url: string | null;
          insurance_start_date: string;
          insurance_end_date: string;
          is_verified: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          car_number: string;
          phone_number: string;
          profile_picture_url?: string | null;
          drivers_license_url?: string | null;
          insurance_start_date: string;
          insurance_end_date: string;
          is_verified?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          car_number?: string;
          phone_number?: string;
          profile_picture_url?: string | null;
          drivers_license_url?: string | null;
          insurance_start_date?: string;
          insurance_end_date?: string;
          is_verified?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          media_url: string | null;
          media_type: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          media_url?: string | null;
          media_type?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          media_url?: string | null;
          media_type?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      claims: {
        Row: {
          id: string;
          claim_number: string;
          user_id: string;
          car_number: string;
          accident_date: string;
          description: string;
          accident_photo_1_url: string | null;
          accident_photo_2_url: string | null;
          insurance_receipt_url: string;
          police_report_url: string;
          progress: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          claim_number?: string;
          user_id: string;
          car_number: string;
          accident_date: string;
          description: string;
          accident_photo_1_url?: string | null;
          accident_photo_2_url?: string | null;
          insurance_receipt_url: string;
          police_report_url: string;
          progress?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          claim_number?: string;
          user_id?: string;
          car_number?: string;
          accident_date?: string;
          description?: string;
          accident_photo_1_url?: string | null;
          accident_photo_2_url?: string | null;
          insurance_receipt_url?: string;
          police_report_url?: string;
          progress?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
};