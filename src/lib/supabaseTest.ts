import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // First test: Check if we can connect to the service
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (healthError) {
      console.error('Database access error:', {
        message: healthError.message,
        code: healthError.code,
        details: healthError.details,
        hint: healthError.hint
      });

      if (healthError.code === 'PGRST301') {
        console.error('Row Level Security (RLS) policy error. Please check database policies.');
      }
      
      throw healthError;
    }
    
    console.log('✅ Database connection successful!', healthCheck);
    
    // Check auth state
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Auth state:', {
      isAuthenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      } : null
    });

    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
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
