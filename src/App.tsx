import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import Dashboard from './components/Dashboard';
import { IndianRupee, Users, FileText, CheckSquare, ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error: any) {
        console.error('Error initializing app:', error);
        setError('Failed to initialize application. Please try again.');
      }
    };

    initializeApp();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with email and password
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      // If sign in successful, get user profile
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Error fetching user profile. Please try again.');
          await supabase.auth.signOut();
          return;
        }

        // For non-admin users, verify role matches
        if (selectedRole && profile?.role !== selectedRole && profile?.role !== 'admin') {
          await supabase.auth.signOut();
          setError(`Access denied. You don't have ${selectedRole} privileges.`);
          return;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSelectedRole(null);
      setEmail('');
      setPassword('');
      setError(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  if (session) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-8">
          <div className="flex items-center justify-center space-x-4">
            <IndianRupee className="w-12 h-12 text-blue-600" />
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">Relish Foods Pvt Ltd</h1>
              <p className="text-lg text-gray-600">Payment Approval System</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mt-8">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              {selectedRole ? (
                <div>
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setSelectedRole(null);
                        setError(null);
                      }}
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to role selection
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </h3>
                  <form onSubmit={handleLogin} className="space-y-4">
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
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
                    Select Your Role
                  </h2>
                  <div className="flex flex-col space-y-4 mb-8">
                    <button
                      onClick={() => setSelectedRole('admin')}
                      className="flex items-center space-x-4 p-4 rounded-lg transition-all bg-gray-50 text-gray-700 hover:bg-gray-100"
                    >
                      <Users className="w-6 h-6" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Administrator</span>
                        <span className="text-sm opacity-90">Manage users and account heads</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedRole('requester')}
                      className="flex items-center space-x-4 p-4 rounded-lg transition-all bg-gray-50 text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="w-6 h-6" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Requester</span>
                        <span className="text-sm opacity-90">Create and manage payment vouchers</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedRole('approver')}
                      className="flex items-center space-x-4 p-4 rounded-lg transition-all bg-gray-50 text-gray-700 hover:bg-gray-100"
                    >
                      <CheckSquare className="w-6 h-6" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Approver</span>
                        <span className="text-sm opacity-90">Review and approve payment requests</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;