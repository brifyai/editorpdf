const express = require('express');
const router = express.Router();
const { setUserContext } = require('../utils/database');
const { supabaseClient } = require('../database/supabaseClient');
const { optionalAuth, authenticate } = require('../middleware/auth');
const {
  optimizePaginatedQuery,
  optimizeFilteredQuery,
  optimizeRelationQuery,
  optimizeCountQuery,
  optimizeTextSearchQuery
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

// Obtener todos los artículos de ayuda
router.get('/articles', optionalAuth, setUserContextMiddleware, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = supabaseClient
      .from('help_articles')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    // Filtrar por categoría si se proporciona
    if (category) {
      query = query.eq('category', category);
    }
    
    // Buscar por título o contenido si se proporciona término de búsqueda
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    const { data: articles, error } = await query;
    
    if (error) {
      console.error('Error fetching help articles:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener artículos de ayuda'
      });
    }
    
    res.json({
      success: true,
      data: articles
    });
    
  } catch (error) {
    console.error('Error in GET /api/help/articles:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener un artículo de ayuda específico
router.get('/articles/:id', optionalAuth, setUserContextMiddleware, async (req, res) => {
  try {
    const articleId = req.params.id;
    
    const { data: article, error } = await supabaseClient
      .from('help_articles')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (error) {
      console.error('Error fetching help article:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener artículo de ayuda'
      });
    }
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Artículo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: article
    });
    
  } catch (error) {
    console.error('Error in GET /api/help/articles/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Crear un nuevo ticket de soporte
router.post('/tickets', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, description, category, priority = 'medium' } = req.body;
    
    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Asunto y descripción son requeridos'
      });
    }
    
    const { data: ticket, error } = await supabaseClient
      .from('support_tickets')
      .insert({
        user_int_id: userId,
        subject,
        description,
        category: category || 'general',
        priority,
        status: 'open',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating support ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al crear ticket de soporte'
      });
    }
    
    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket de soporte creado exitosamente'
    });
    
  } catch (error) {
    console.error('Error in POST /api/help/tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener tickets de soporte del usuario
router.get('/tickets', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category } = req.query;
    
    let query = supabaseClient
      .from('support_tickets')
      .select('*')
      .eq('user_int_id', userId)
      .order('created_at', { ascending: false });
    
    // Filtrar por estado si se proporciona
    if (status) {
      query = query.eq('status', status);
    }
    
    // Filtrar por categoría si se proporciona
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data: tickets, error } = await query;
    
    if (error) {
      console.error('Error fetching support tickets:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener tickets de soporte'
      });
    }
    
    res.json({
      success: true,
      data: tickets
    });
    
  } catch (error) {
    console.error('Error in GET /api/help/tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener un ticket de soporte específico
router.get('/tickets/:id', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.id;
    
    const { data: ticket, error } = await supabaseClient
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_int_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching support ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener ticket de soporte'
      });
    }
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }
    
    // Obtener mensajes asociados al ticket
    const { data: messages, error: messagesError } = await supabaseClient
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching ticket messages:', messagesError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener mensajes del ticket'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...ticket,
        messages
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/help/tickets/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Agregar un mensaje a un ticket de soporte
router.post('/tickets/:id/messages', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensaje es requerido'
      });
    }
    
    // Verificar que el ticket exista y pertenezca al usuario
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_int_id', userId)
      .single();
    
    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }
    
    // Crear el mensaje
    const { data: newMessage, error: messageError } = await supabaseClient
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        user_int_id: userId,
        message,
        is_from_support: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Error creating ticket message:', messageError);
      return res.status(500).json({
        success: false,
        error: 'Error al crear mensaje'
      });
    }
    
    // Actualizar estado del ticket si estaba cerrado
    if (ticket.status === 'closed') {
      await supabaseClient
        .from('support_tickets')
        .update({ status: 'open' })
        .eq('id', ticketId);
    }
    
    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Mensaje agregado exitosamente'
    });
    
  } catch (error) {
    console.error('Error in POST /api/help/tickets/:id/messages:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Cerrar un ticket de soporte
router.patch('/tickets/:id/close', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.id;
    
    // Verificar que el ticket exista y pertenezca al usuario
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_int_id', userId)
      .single();
    
    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }
    
    // Actualizar estado del ticket
    const { data: updatedTicket, error: updateError } = await supabaseClient
      .from('support_tickets')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error closing support ticket:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error al cerrar ticket'
      });
    }
    
    res.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket cerrado exitosamente'
    });
    
  } catch (error) {
    console.error('Error in PATCH /api/help/tickets/:id/close:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener categorías de ayuda disponibles
router.get('/categories', optionalAuth, setUserContextMiddleware, async (req, res) => {
  try {
    // Obtener categorías únicas de artículos de ayuda
    const { data: articles, error: articlesError } = await supabaseClient
      .from('help_articles')
      .select('category')
      .eq('is_published', true);
    
    if (articlesError) {
      console.error('Error fetching help categories:', articlesError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener categorías de ayuda'
      });
    }
    
    // Extraer categorías únicas
    const categories = [...new Set(articles.map(article => article.category))];
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Error in GET /api/help/categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;