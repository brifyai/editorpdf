import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

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
      // Buscar usuario en la tabla users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // NOTA: En producción, compara con hash
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Credenciales inválidas o usuario inactivo');

      // Actualizar last_login
      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      // Guardar sesión en localStorage
      const userSession = {
        id: data.id,
        email: data.email,
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        phone: data.phone,
        role: data.role,
        subscriptionTier: data.subscription_tier,
        apiUsageLimit: data.api_usage_limit,
        monthlyApiCount: data.monthly_api_count,
        storageQuotaMb: data.storage_quota_mb,
        storageUsedMb: data.storage_used_mb,
        preferences: data.preferences,
        isActive: data.is_active,
        emailVerified: data.email_verified,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userIntId: data.user_int_id,
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
      const { email, username, password, firstName, lastName } = userData;
      
      // Verificar si el email ya existe
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingEmail) {
        throw new Error('El email ya está registrado');
      }

      // Verificar si el username ya existe (si se proporciona)
      if (username) {
        const { data: existingUsername } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (existingUsername) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }

      // Generar user_int_id secuencial
      const { data: lastUser } = await supabase
        .from('users')
        .select('user_int_id')
        .order('user_int_id', { ascending: false })
        .limit(1)
        .single();

      const nextUserIntId = (lastUser?.user_int_id || 0) + 1;

      // Insertar nuevo usuario en la tabla users
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            username: username || null,
            password_hash: password, // NOTA: En producción, guarda el hash
            first_name: firstName || null,
            last_name: lastName || null,
            role: 'user',
            subscription_tier: 'free',
            api_usage_limit: 100,
            monthly_api_count: 0,
            storage_quota_mb: 100,
            storage_used_mb: 0,
            preferences: {},
            is_active: true,
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_int_id: nextUserIntId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Crear sesión
      const userSession = {
        id: data.id,
        email: data.email,
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        phone: data.phone,
        role: data.role,
        subscriptionTier: data.subscription_tier,
        apiUsageLimit: data.api_usage_limit,
        monthlyApiCount: data.monthly_api_count,
        storageQuotaMb: data.storage_quota_mb,
        storageUsedMb: data.storage_used_mb,
        preferences: data.preferences,
        isActive: data.is_active,
        emailVerified: data.email_verified,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userIntId: data.user_int_id,
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
