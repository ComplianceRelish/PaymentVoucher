import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // First test: Check if we can connect to the service
    const { data: healthCheck, error: healthError } = await supabase.rpc('get_service_status');
    if (healthError) {
      console.log('Health check failed, trying alternative test...');
    } else {
      console.log('Health check passed:', healthCheck);
    }

    // Second test: Try to get system timestamp
    const { data: timeData, error: timeError } = await supabase.rpc('get_timestamp');
    if (timeError) {
      console.log('Timestamp check failed, trying final test...');
    } else {
      console.log('Server timestamp:', timeData);
    }

    // Final test: Simple table query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Database query failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('✅ Supabase connection successful!', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    // Try to get more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return false;
  }
}
