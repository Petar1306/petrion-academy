import { createClient } from '@supabase/supabase-js';

// Single Supabase client instance for the whole app.
// Keys come from .env (never hardcode them).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
