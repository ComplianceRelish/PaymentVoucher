import { supabase } from './supabase';

export const initializeAdmin = async () => {
  try {
    const adminEmail = import.meta.env.ADMIN_EMAIL;
    const adminPassword = import.meta.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('Admin credentials not found in environment variables');
      return;
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .eq('role', 'admin')
      .single();

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });

    if (authError) throw authError;

    // Update the profile to be admin
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        active: true,
        name: 'System Admin',
      })
      .eq('id', authData.user!.id);

    if (profileError) throw profileError;

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};
