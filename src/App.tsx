import { useState, useEffect, useContext } from 'react';
import { UserRole } from './types';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import NotificationToast from './components/NotificationToast';
import { NotificationContext } from './context/NotificationContext';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { notifications, removeNotification, addNotification } = useContext(NotificationContext) || {
    notifications: [],
    removeNotification: () => {},
    addNotification: () => {}
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addNotification({
            type: 'error',
            message: 'Failed to get session: ' + sessionError.message
          });
          return;
        }

        setSession(initialSession);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to initialize authentication'
        });
      }
    };

    initializeAuth();
  }, [addNotification]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (session?.user) {
        try {
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (error) {
            addNotification({
              type: 'error',
              message: 'Failed to fetch user role'
            });
            return;
          }

          if (userRoles?.role) {
            setSelectedRole(userRoles.role as UserRole);
          } else {
            const { data: adminData, error: adminError } = await supabase
              .from('admins')
              .select('id')
              .eq('user_id', session.user.id)
              .single();

            if (adminError) {
              addNotification({
                type: 'error',
                message: 'Failed to check admin status'
              });
              return;
            }

            if (adminData) {
              setSelectedRole('admin');
            }
          }
        } catch (error) {
          addNotification({
            type: 'error',
            message: 'Failed to check user role'
          });
        }
      }
    };

    checkUserRole();
  }, [session, addNotification]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSelectedRole(null);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to log out'
      });
    }
  };

  const renderContent = () => {
    if (!session) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
              </h2>
            </div>
            <div className="mt-8 space-y-6">
              <button
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!selectedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Waiting for role assignment...
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please contact your administrator to assign you a role.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <Dashboard session={session} role={selectedRole} onLogout={handleLogout} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
      {renderContent()}
    </div>
  );
}

export default App;