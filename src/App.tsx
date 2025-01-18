import { useState, useEffect } from 'react';
import { UserRole } from './types';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { testSupabaseConnection } from './lib/supabaseTest';
import NotificationToast from './components/NotificationToast';

// Debug environment variables
console.log('Environment check:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  env: import.meta.env.MODE,
  fullUrl: import.meta.env.VITE_SUPABASE_URL
});

function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem('selectedRole');
      return saved ? JSON.parse(saved) as UserRole : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test Supabase connection
        const isConnected = await testSupabaseConnection();
        console.log('Supabase connection test result:', isConnected);
        
        if (!isConnected) {
          throw new Error('Failed to connect to Supabase');
        }

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        console.log('Session status:', initialSession ? 'Active' : 'No session');
        setSession(initialSession);

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('Auth state changed:', _event, session ? 'Has session' : 'No session');
          if (!session) {
            // Clear role when logged out
            localStorage.removeItem('selectedRole');
            setSelectedRole(null);
          }
          setSession(session);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setSelectedRole(null);
      localStorage.removeItem('selectedRole');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to logout');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!session || !session.user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Payment Voucher System</h1>
            <p className="text-gray-600 mb-4">Please sign in using Supabase Authentication.</p>
            <button
              onClick={() => supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                  redirectTo: window.location.origin
                }
              })}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      );
    }

    if (!selectedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Your Role</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setSelectedRole('requester')}
                className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
              >
                <span className="text-lg font-medium">Requester</span>
              </button>
              <button
                onClick={() => setSelectedRole('approver')}
                className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
              >
                <span className="text-lg font-medium">Approver</span>
              </button>
              <button
                onClick={() => setSelectedRole('admin')}
                className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
              >
                <span className="text-lg font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <Dashboard session={session} role={selectedRole} onLogout={handleLogout} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationToast />
      {renderContent()}
    </div>
  );
}

export default App;