import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    // Test the connection by attempting to get the server timestamp
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}
