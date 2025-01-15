import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import Dashboard from './components/Dashboard';
import { IndianRupee, Users, FileText, CheckSquare, ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { testSupabaseConnection } from './lib/supabaseTest';

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

    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
      if (error.message !== 'Access denied.') {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-8">
          <div className="flex items-center justify-center space-x-4">
            <IndianRupee className="w-12 h-12 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Payment Voucher System</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="mt-8">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              {selectedRole ? (
                <div>
                  <button
                    onClick={handleBack}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to role selection
                  </button>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Login as {selectedRole}
                  </h2>
                  <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      {error && (
                        <div className="text-red-600 text-sm mt-2">{error}</div>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? 'Signing in...' : 'Sign in'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Your Role</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => handleRoleSelect('requester')}
                      className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Users className="w-6 h-6 mr-2 text-blue-600" />
                      <span className="text-lg font-medium">Requester</span>
                    </button>
                    <button
                      onClick={() => handleRoleSelect('approver')}
                      className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                    >
                      <CheckSquare className="w-6 h-6 mr-2 text-blue-600" />
                      <span className="text-lg font-medium">Approver</span>
                    </button>
                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                    >
                      <FileText className="w-6 h-6 mr-2 text-blue-600" />
                      <span className="text-lg font-medium">Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;