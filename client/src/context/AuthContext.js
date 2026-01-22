import React, { createContext, useContext, useState, useEffect } from 'react';
import { authHelpers } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const initializeAuth = async () => {
      const { user } = await authHelpers.getCurrentUser();
      setUser(user);
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await authHelpers.signIn(email, password);
      if (error) {
        return { 
          success: false, 
          error: error.message || 'Login failed' 
        };
      }
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed' 
      };
    }
  };

  const register = async (email, password, username) => {
    try {
      const { data, error } = await authHelpers.signUp(email, password, username);
      if (error) {
        return { 
          success: false, 
          error: error.message || 'Registration failed' 
        };
      }
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      const { error } = await authHelpers.signOut();
      if (!error) {
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
