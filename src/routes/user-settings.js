const express = require('express');
const router = express.Router();
const { setUserContext } = require('../utils/database');
const { supabaseClient } = require('../database/supabaseClient');
const { optionalAuth, authenticate } = require('../middleware/auth');
const {
  optimizePaginatedQuery,
  optimizeFilteredQuery,
  optimizeRelationQuery,
  optimizeCountQuery
} = require('../utils/queryOptimizer');

// Middleware para establecer contexto de usuario
const setUserContextMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await setUserContext(req.user.id);
    }
    next();
  } catch (error) {
    console.error('Error setting user context:', error);
    next();
  }
};

// Obtener configuración de usuario
router.get('/settings', optionalAuth, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Obtener configuración de user_preferences
    const { data: preferences, error: preferencesError } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_int_id', userId)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', preferencesError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener preferencias del usuario'
      });
    }

    // Obtener configuración de user_profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_int_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener perfil del usuario'
      });
    }

    // Obtener configuración de API
    const { data: apiConfig, error: apiConfigError } = await supabaseClient
      .from('user_api_configs')
      .select('*')
      .eq('user_int_id', userId);

    if (apiConfigError) {
      console.error('Error fetching API config:', apiConfigError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener configuración de API'
      });
    }

    const settings = {
      preferences: preferences || {},
      profile: profile || {},
      apiConfig: apiConfig || []
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error in GET /api/user/settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Guardar configuración de usuario
router.post('/settings', authenticate, setUserContextMiddleware, async (req, res) => {
  // Invalidar caché de configuración de usuario
  invalidateCache(CACHE_TYPES.USER_CONFIG);
  try {
    const userId = req.user.id;
    const { preferences, profile, apiConfig } = req.body;

    // Guardar preferencias
    if (preferences) {
      const { error: preferencesError } = await supabaseClient
        .from('user_preferences')
        .upsert({
          user_int_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (preferencesError) {
        console.error('Error saving user preferences:', preferencesError);
        return res.status(500).json({
          success: false,
          error: 'Error al guardar preferencias del usuario'
        });
      }
    }

    // Guardar perfil
    if (profile) {
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .upsert({
          user_int_id: userId,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error saving user profile:', profileError);
        return res.status(500).json({
          success: false,
          error: 'Error al guardar perfil del usuario'
        });
      }
    }

    // Guardar configuración de API
    if (apiConfig && Array.isArray(apiConfig)) {
      for (const config of apiConfig) {
        const { error: apiConfigError } = await supabaseClient
          .from('user_api_configs')
          .upsert({
            user_int_id: userId,
            provider: config.provider,
            api_key_encrypted: config.api_key_encrypted,
            is_active: config.is_active !== undefined ? config.is_active : true,
            usage_count: config.usage_count || 0,
            last_used: config.last_used || null,
            updated_at: new Date().toISOString()
          });

        if (apiConfigError) {
          console.error('Error saving API config:', apiConfigError);
          return res.status(500).json({
            success: false,
            error: 'Error al guardar configuración de API'
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Configuración guardada exitosamente'
    });

  } catch (error) {
    console.error('Error in POST /api/user/settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Actualizar configuración de usuario
router.put('/settings', authenticate, setUserContextMiddleware, async (req, res) => {
  // Invalidar caché de configuración de usuario
  invalidateCache(CACHE_TYPES.USER_CONFIG);
  try {
    const userId = req.user.id;
    const { preferences, profile, apiConfig } = req.body;

    // Actualizar preferencias
    if (preferences) {
      const { error: preferencesError } = await supabaseClient
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_int_id', userId);

      if (preferencesError) {
        console.error('Error updating user preferences:', preferencesError);
        return res.status(500).json({
          success: false,
          error: 'Error al actualizar preferencias del usuario'
        });
      }
    }

    // Actualizar perfil
    if (profile) {
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_int_id', userId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        return res.status(500).json({
          success: false,
          error: 'Error al actualizar perfil del usuario'
        });
      }
    }

    // Actualizar configuración de API
    if (apiConfig && Array.isArray(apiConfig)) {
      for (const config of apiConfig) {
        const { error: apiConfigError } = await supabaseClient
          .from('user_api_configs')
          .update({
            provider: config.provider,
            api_key_encrypted: config.api_key_encrypted,
            is_active: config.is_active !== undefined ? config.is_active : true,
            usage_count: config.usage_count || 0,
            last_used: config.last_used || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_int_id', userId)
          .eq('provider', config.provider);

        if (apiConfigError) {
          console.error('Error updating API config:', apiConfigError);
          return res.status(500).json({
            success: false,
            error: 'Error al actualizar configuración de API'
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error in PUT /api/user/settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;