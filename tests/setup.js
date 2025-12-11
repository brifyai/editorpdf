// Configuración global para las pruebas
// Este archivo se ejecuta antes de cada test

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.GROQ_API_KEY = 'test-groq-api-key'
process.env.CHUTES_API_KEY = 'test-chutes-api-key'

// Configurar timeout global para las pruebas
jest.setTimeout(30000)

// Mock de console.log para reducir ruido en las pruebas
const originalConsoleLog = console.log
const originalConsoleError = console.error

beforeAll(() => {
  // Suprimir logs durante las pruebas excepto errores críticos
  console.log = jest.fn()
  console.error = jest.fn((...args) => {
    // Solo mostrar errores reales, no warnings de Jest
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return
    }
    originalConsoleError(...args)
  })
})

afterAll(() => {
  // Restaurar console.log después de las pruebas
  console.log = originalConsoleLog
  console.error = originalConsoleError
})

// Cleanup después de cada test
afterEach(() => {
  // Limpiar todos los mocks
  jest.clearAllMocks()
  
  // Limpiar módulos cacheados que podrían afectar las pruebas
  Object.keys(require.cache).forEach(key => {
    if (key.includes('/src/') || key.includes('/tests/')) {
      delete require.cache[key]
    }
  })
})

// Configuración global para tests de API
global.request = (app) => {
  const supertest = require('supertest')
  return supertest(app)
}

// Utilidades para tests
global.testUtils = {
  // Generar datos de prueba
  generateTestUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  }),
  
  // Generar token JWT de prueba
  generateTestToken: (userId = 'test-user-id') => {
    const jwt = require('jsonwebtoken')
    return jwt.sign(
      { userId, email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
  },
  
  // Mock de respuesta de API
  mockApiResponse: (data = {}, status = 200) => ({
    status,
    data,
    success: status < 400
  })
}

// Configuración de Supabase mock
jest.mock('../src/database/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          maybeSingle: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    })
  }
}))

// Configuración de Groq mock
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Test response from Groq'
            }
          }]
        })
      }
    }
  }))
})

console.log('🧪 Configuración de pruebas cargada')