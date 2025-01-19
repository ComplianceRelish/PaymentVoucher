import { supabase } from './supabase';

export async function initializeAdmin() {
  try {
    // Check for admin credentials in environment variables
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('Admin credentials not found in environment variables');
    }

    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existingAdmin) {
      return { success: true, message: 'Admin user already exists' };
    }

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('Failed to create admin user');
    }

    // Add user to admins table
    const { error: adminError } = await supabase.from('admins').insert([
      {
        user_id: authData.user.id,
        email: adminEmail,
      },
    ]);

    if (adminError) throw adminError;

    return { success: true, message: 'Admin user created successfully' };
  } catch (error) {
    return { success: false, error };
  }
}
