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
    detectSessionInUrl: true,
    storageKey: 'payment-voucher-auth',
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'payment-voucher'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// User management functions
export const createUser = async (userData: { 
  name: string; 
  email: string; 
  mobile: string;
  role: string; 
  active: boolean;
  otp: string;
}) => {
  try {
    // 1. Create profile first (we'll use mobile number as the primary authentication)
    const { error: profileError, data: profile } = await supabase.from('profiles').insert([{
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      active: userData.active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]).select().single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Failed to create profile');

    return { profile };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: { 
  name?: string; 
  email?: string;
  mobile?: string;
  role?: string; 
  active?: boolean 
}) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...userData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
};

export const deleteUser = async (userId: string) => {
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};