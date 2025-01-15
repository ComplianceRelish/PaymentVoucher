import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Debug configuration (without exposing full key)
console.log('Supabase Configuration Check:', {
  url: supabaseUrl,
  keyLength: supabaseKey?.length || 0,
  keyPrefix: supabaseKey?.substring(0, 8),
  mode: import.meta.env.MODE,
  env: {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    fullUrl: supabaseUrl
  }
});

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables:\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✓' : '✗'}`
  );
}

// Validate key format
if (!supabaseKey.startsWith('eyJ') || supabaseKey.length < 160) {
  console.error('Invalid API key format:', {
    startsWithEyJ: supabaseKey.startsWith('eyJ'),
    length: supabaseKey.length,
    prefix: supabaseKey.substring(0, 8)
  });
  throw new Error(
    'Invalid Supabase API key format. The anon key should:\n' +
    '1. Start with "eyJ"\n' +
    '2. Be at least 160 characters long\n' +
    'Please check your VITE_SUPABASE_ANON_KEY in Netlify environment variables.\n' +
    'Make sure you are using the anon/public key from Project Settings > API.'
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