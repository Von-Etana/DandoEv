import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

/**
 * Mobile Supabase Client.
 * Use this for real-time subscriptions and standard queries.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
