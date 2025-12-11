/**
 * Simple Netlify Function Handler for Document Analyzer
 * This is a basic version that doesn't depend on external files
 */

// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// Middleware base
app.use(cors());
app.use(express.json());

// =====================================================
// SIMPLE ENDPOINTS
// =====================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Document Analyzer API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// AI status endpoint (simplified)
app.get('/api/ai-status', (req, res) => {
  res.json({
    success: true,
    data: {
      groq: {
        configured: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_api_key_here'),
        status: 'available'
      },
      chutes: {
        configured: !!(process.env.CHUTES_API_KEY && process.env.CHUTES_API_KEY !== 'your_chutes_api_key_here'),
        status: 'available'
      }
    }
  });
});

// Models endpoint (simplified)
app.get('/api/models', (req, res) => {
  res.json({
    success: true,
    data: {
      models: [
        {
          id: 'llama-3.3-70b-versatile',
          name: 'Llama 3.3 70B Versatile',
          provider: 'Groq',
          description: 'Modelo balanceado con alta precisión para análisis general'
        },
        {
          id: 'llama-3.1-8b-instant',
          name: 'Llama 3.1 8B Instant',
          provider: 'Groq',
          description: 'Modelo rápido para análisis básico y respuestas rápidas'
        }
      ]
    }
  });
});

// Test connections endpoint (simplified)
app.get('/api/test-connections', (req, res) => {
  res.json({
    success: true,
    data: {
      overall: {
        status: 'healthy',
        message: 'API is running correctly'
      },
      services: {
        api: { status: 'connected', message: 'API funcionando correctamente' }
      }
    }
  });
});

// =====================================================
// AUTH ENDPOINTS
// =====================================================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  // For demo purposes, accept any credentials
  // In production, you would validate against a database
  const user = {
    id: 'demo-user-123',
    email: email,
    name: 'Demo User',
    role: 'user'
  };
  
  res.json({
    success: true,
    data: {
      user: user,
      token: 'demo-token-' + Date.now(),
      message: 'Login successful'
    }
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Basic validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password and name are required'
    });
  }
  
  // For demo purposes, create a user
  const user = {
    id: 'demo-user-' + Date.now(),
    email: email,
    name: name,
    role: 'user'
  };
  
  res.json({
    success: true,
    data: {
      user: user,
      token: 'demo-token-' + Date.now(),
      message: 'Registration successful'
    }
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Logout successful'
    }
  });
});

// Get current user endpoint
app.get('/api/auth/me', (req, res) => {
  // For demo purposes, return a demo user
  // In production, you would validate the token and get user from database
  const user = {
    id: 'demo-user-123',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user'
  };
  
  res.json({
    success: true,
    data: {
      user: user
    }
  });
});

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// =====================================================
// EXPORTAR PARA NETLIFY FUNCTIONS
// =====================================================

module.exports.handler = serverless(app);