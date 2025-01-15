import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Debug configuration
console.log('Supabase Configuration Check:', {
  url: supabaseUrl,
  keyLength: supabaseKey?.length || 0,
  keyPrefix: supabaseKey?.substring(0, 8),
  mode: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables:\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✓' : '✗'}`
  );
}

if (!supabaseKey.startsWith('eyJ')) {
  console.error('Invalid API key format. The anon key should start with "eyJ"');
  throw new Error(
    'Invalid Supabase API key format. Please check your VITE_SUPABASE_ANON_KEY environment variable.\n' +
    'Make sure you are using the anon public key from your Supabase project settings.'
  );
}

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'payment-voucher'
    }
  }
});