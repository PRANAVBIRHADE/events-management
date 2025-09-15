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
          
          // If user exists, verify they still have a profile (not deleted)
          if (session?.user) {
            console.log('Checking if user profile exists for:', session.user.email);
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .single();
              
            console.log('Profile check result:', { profile, profileError });
            
            if (profileError || !profile) {
              console.log('User profile not found, signing out deleted user');
              try {
                await supabase.auth.signOut();
                setUser(null);
                console.log('Successfully signed out deleted user');
              } catch (signOutError) {
                console.error('Error signing out:', signOutError);
                // Force clear the user state even if signout fails
                setUser(null);
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
          
          // Verify user still has a profile (not deleted)
          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .single();
              
            if (profileError || !profile) {
              console.log('User profile not found during sign in, signing out deleted user');
              await supabase.auth.signOut();
              setUser(null);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
      
      // Clear stored data
      localStorage.removeItem('registrationData');
      console.log('Cleared localStorage');
      
      // Sign out from Supabase
      console.log('Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      console.log('Supabase signout response:', { error });
      
      if (error) {
        console.error('Supabase signout error details:', {
          message: error.message
        });
        throw error;
      }
      
      // Reset state
      console.log('Resetting user state...');
      setUser(null);
      setLastActivity(Date.now());
      
      console.log('User signed out successfully');
      
      // Navigate to home page instead of reload
      console.log('Navigating to home page...');
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout - full error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      
      // Force clear user state even if signout fails
      console.log('Force clearing user state...');
      setUser(null);
      setLastActivity(Date.now());
      
      // Navigate to home page
      console.log('Force navigating to home page...');
      window.location.href = '/';
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
