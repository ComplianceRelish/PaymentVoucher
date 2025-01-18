import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import Dashboard from './components/Dashboard';
import { IndianRupee, Users, FileText, CheckSquare, ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { testSupabaseConnection } from './lib/supabaseTest';
import { NotificationProvider } from './context/NotificationContext';
import NotificationToast from './components/NotificationToast';

// Debug environment variables
console.log('Environment check:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  env: import.meta.env.MODE,
  fullUrl: import.meta.env.VITE_SUPABASE_URL // Log the full URL for debugging
});

function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Initialize auth state and test connection
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test Supabase connection
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
          throw new Error('Failed to connect to Supabase');
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setSession(session);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Get user profile and verify role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Role verification
      if (profile?.role === 'admin') {
        // Admins can access any role
        return;
      }

      if (selectedRole && profile?.role !== selectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Access denied. You don't have ${selectedRole} privileges.`);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
                         typeof error === 'object' && error && 'message' in error ? 
                         (error.message as string) : 'An unexpected error occurred';
      
      setError(errorMessage);
      if (errorMessage !== 'Access denied.') {
        console.error('Login error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSelectedRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setError(null);
  };

  if (session && selectedRole) {
    return <Dashboard session={session} role={selectedRole} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationToast />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : error ? (
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
      ) : session ? (
        selectedRole ? (
          <Dashboard session={session} role={selectedRole} onLogout={handleLogout} />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            {/* Role selection UI */}
          </div>
        )
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          {/* Login form UI */}
        </div>
      )}
    </div>
  );
}

export default App;