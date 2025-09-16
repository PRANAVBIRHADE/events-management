import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData: any) => Promise<{ data: any; error: any }>;
  lastActivity: number;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto-logout after 10 minutes of inactivity
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
          
          // If user exists, verify profile or create one for admins
          if (session?.user) {
            console.log('Checking if user profile exists for:', session.user.email);
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle();

            // If profile missing, check admin status
            if (profileError || !profile) {
              const { data: adminUser } = await supabase
                .from('admin_users')
                .select('id')
                .eq('email', session.user.email as any)
                .eq('role', 'admin')
                .maybeSingle();

              if (adminUser) {
                console.log('Admin detected without profile. Creating minimal admin profile...');
                try {
                  await supabase
                    .from('user_profiles')
                    .insert([{ 
                      user_id: session.user.id,
                      full_name: (session.user.user_metadata as any)?.full_name || session.user.email?.split('@')[0] || 'Admin',
                      mobile_number: (session.user.user_metadata as any)?.mobile_number || '',
                      studying_year: 4
                    }]);
                  console.log('Admin profile created');
                } catch (e) {
                  console.warn('Failed to auto-create admin profile:', e);
                }
              } else {
                console.log('Non-admin user profile not found, signing out deleted user');
                try {
                  await supabase.auth.signOut();
                  setUser(null);
                  console.log('Successfully signed out deleted user');
                } catch (signOutError) {
                  console.error('Error signing out:', signOutError);
                  setUser(null);
                }
              }
            } else {
              console.log('User profile found, keeping user logged in');
            }
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          setLastActivity(Date.now());
          
          // Verify user still has a profile (create for admins if missing)
          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (profileError || !profile) {
              const { data: adminUser } = await supabase
                .from('admin_users')
                .select('id')
                .eq('email', session.user.email as any)
                .eq('role', 'admin')
                .maybeSingle();

              if (adminUser) {
                try {
                  await supabase
                    .from('user_profiles')
                    .insert([{ 
                      user_id: session.user.id,
                      full_name: (session.user.user_metadata as any)?.full_name || session.user.email?.split('@')[0] || 'Admin',
                      mobile_number: (session.user.user_metadata as any)?.mobile_number || '',
                      studying_year: 4
                    }]);
                  console.log('Admin profile created on SIGNED_IN');
                } catch (e) {
                  console.warn('Failed to auto-create admin profile on SIGNED_IN:', e);
                }
              } else {
                console.log('User profile not found during sign in, signing out deleted non-admin user');
                await supabase.auth.signOut();
                setUser(null);
              }
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Revalidate session on window focus and sync logout across tabs
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && user) {
          setUser(null);
        }
      } catch (_e) {}
    };

    const handleStorage = (e: StorageEvent) => {
      // Custom cross-tab logout signal
      if (e.key === 'forceLogout' && e.newValue) {
        setUser(null);
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
      }
      // If Supabase auth token is cleared/changed in another tab
      if (e.key && e.key.includes('-auth-token')) {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user]);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        logout();
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, lastActivity, INACTIVITY_TIMEOUT]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const updateActivityOnAction = () => {
      setLastActivity(Date.now());
    };

    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivityOnAction, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivityOnAction, true);
      });
    };
  }, [user]);

  // Logout on browser close/refresh
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      // Clear any stored session data
      localStorage.removeItem('registrationData');
      // Note: We can't call logout here as it's async and the page is closing
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        setLastActivity(Date.now());
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting to sign out user...');

      // Clear stored data early (client-side state)
      localStorage.removeItem('registrationData');
      console.log('Cleared localStorage');

      // Clear Supabase auth keys from storage proactively
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.includes('-auth-token') || k.startsWith('sb-')) {
            localStorage.removeItem(k);
          }
        });
      } catch (_e) {}

      // Supabase signout with timeout and global scope (revoke across devices)
      console.log('Calling supabase.auth.signOut({ scope: \"global\" }) with timeout...');
      const signOutPromise = supabase.auth.signOut({ scope: 'global' } as any);
      const timeoutPromise = new Promise<{ error: any }>((resolve) => {
        setTimeout(() => resolve({ error: null }), 5000);
      });
      const { error } = await Promise.race([signOutPromise, timeoutPromise]);
      console.log('Supabase signout response (or timed out):', { error });

      if (error) {
        console.error('Supabase signout error details:', { message: error.message });
      }

      // Reset state regardless of network outcome
      console.log('Resetting user state...');
      setUser(null);
      setLastActivity(Date.now());

      // Broadcast logout to other tabs
      try {
        localStorage.setItem('forceLogout', String(Date.now()));
        // Clean up the signal shortly after
        setTimeout(() => localStorage.removeItem('forceLogout'), 1000);
      } catch (_e) {}

      console.log('User signed out (client state cleared). Redirecting...');
      // Hard redirect to ensure session cookies are not lingering in SPA state
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    } catch (error) {
      console.error('Error during logout - full error:', error);
      console.error('Error type:', typeof error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      } else if (typeof error === 'object' && error !== null && 'message' in (error as any)) {
        console.error('Error message:', (error as any).message);
      } else {
        console.error('Error message:', String(error));
      }

      // Force clear user state even if signout fails
      console.log('Force clearing user state...');
      setUser(null);
      setLastActivity(Date.now());

      // Hard redirect fallback
      console.log('Force navigating to home page...');
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    }
  };

  const signup = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (!error) {
        setLastActivity(Date.now());
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    lastActivity,
    updateActivity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
