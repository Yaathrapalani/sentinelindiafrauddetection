import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('YOUR_PROJECT') &&
    supabaseAnonKey !== 'your_anon_public_key'
);

/**
 * Browser/client Supabase instance.
 * Uses inert placeholders when env is missing so `next build` can complete;
 * API helpers surface a clear runtime error when called without real config.
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? (supabaseUrl as string) : PLACEHOLDER_URL,
  isSupabaseConfigured ? (supabaseAnonKey as string) : PLACEHOLDER_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const isBrowser = typeof window !== 'undefined';

export function assertSupabaseConfigured(): string | null {
  if (!isSupabaseConfigured) {
    return 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).';
  }
  return null;
}
