import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Shared Supabase client for Client components and lightweight Server usage.
 * Restricted by RLS (Row Level Security) policies defined in your dashboard.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service Role client for bypass RLS in secure server-side routes (Admin/Workers).
 * USE WITH CAUTION: This client has full admin access to your DB.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
