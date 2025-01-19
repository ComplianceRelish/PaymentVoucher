export const checkEnvironmentVariables = () => {
  console.log('Environment Variables Check:');
  console.log('SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (import.meta.env.VITE_SUPABASE_URL) {
    console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  }
};
