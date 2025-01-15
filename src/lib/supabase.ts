import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please check your environment variables:\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}`
  );
}

// Validate URL format
let validatedUrl: string;
try {
  const url = new URL(supabaseUrl);
  if (!url.protocol.startsWith('http')) {
    throw new Error('Invalid protocol');
  }
  validatedUrl = url.toString();
} catch (error) {
  throw new Error(
    `Invalid Supabase URL format: ${supabaseUrl}\n` +
    'URL must start with http:// or https://'
  );
}

export const supabase = createClient<Database>(validatedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});