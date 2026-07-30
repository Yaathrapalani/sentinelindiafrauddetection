import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
    supabaseServiceKey &&
    !supabaseUrl.includes('YOUR_PROJECT') &&
    supabaseServiceKey !== 'your_service_role_key'
);

/**
 * Server/admin Supabase client.
 * Inert placeholders allow builds without env; callers should check configuration.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  isSupabaseAdminConfigured ? (supabaseUrl as string) : PLACEHOLDER_URL,
  isSupabaseAdminConfigured ? (supabaseServiceKey as string) : PLACEHOLDER_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
