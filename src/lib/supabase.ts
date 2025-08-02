import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseAnonKey.length > 20;

// Log credential status for debugging
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');
console.log('Valid credentials:', hasValidCredentials);

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not configured properly.');
  console.warn('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
}
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'ong-aas-web'
      }
    },
    db: {
      schema: 'public'
    },
    // Add retry and timeout settings
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  }
);

// Add connection test function
export const testSupabaseConnection = async () => {
  try {
    if (!hasValidCredentials) {
      return { 
        connected: false, 
        error: 'بيانات الاعتماد غير صحيحة - تحقق من متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY' 
      };
    }
    
    // Test connection with a simple query
    const { data, error } = await Promise.race([
      supabase.from('app_users').select('count').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]) as any;
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { 
        connected: false, 
        error: `فشل الاتصال بقاعدة البيانات: ${error.message}` 
      };
    }
    
    console.log('✅ Supabase connection successful');
    return { connected: true };
  } catch (error) {
    console.error('Supabase connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return { 
      connected: false, 
      error: `خطأ في الاتصال: ${errorMessage}` 
    };
  }
};

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