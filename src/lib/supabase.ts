import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get and clean environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validate environment variables
if (!rawSupabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please check your environment variables:\n' +
    `VITE_SUPABASE_URL: ${rawSupabaseUrl ? '✓' : '✗'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}`
  );
}

// Format and validate URL
let supabaseUrl = rawSupabaseUrl;
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

// Validate URL format
try {
  const url = new URL(supabaseUrl);
  if (!url.hostname.includes('supabase.co')) {
    throw new Error('Invalid Supabase URL: Must be a supabase.co domain');
  }
  // Remove any trailing slash
  supabaseUrl = supabaseUrl.replace(/\/$/, '');
} catch (error) {
  console.error('Supabase URL validation error:', {
    raw: rawSupabaseUrl,
    formatted: supabaseUrl,
    error
  });
  throw new Error(
    `Invalid Supabase URL format: ${rawSupabaseUrl}\n` +
    'URL must be a valid Supabase URL (e.g., https://your-project.supabase.co)'
  );
}

console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});