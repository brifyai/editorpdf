import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseReal } from '../services/supabase-real';

const AuthContext = createContext({});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      // Usar autenticación real con Netlify Functions
      const { data, error } = await supabaseReal.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      if (!data || !data.user) throw new Error('Credenciales inválidas');

      // Guardar sesión en localStorage
      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email,
        role: data.user.role || 'user',
        token: data.token
      };
      
      localStorage.setItem('user', JSON.stringify(userSession));
      setUser(userSession);
      
      return { user: userSession };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (userData) => {
    try {
      const { email, password, name } = userData;
      
      // Usar autenticación real con Netlify Functions
      const { data, error } = await supabaseReal.auth.signUp({ email, password, name });
      
      if (error) throw error;
      if (!data || !data.user) throw new Error('Error al crear usuario');

      // Crear sesión
      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || name,
        role: data.user.role || 'user',
        token: data.token
      };
      
      localStorage.setItem('user', JSON.stringify(userSession));
      setUser(userSession);
      
      return { user: userSession };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Usar autenticación real con Netlify Functions
      await supabaseReal.auth.signOut();
      
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
