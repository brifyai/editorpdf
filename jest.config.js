module.exports = {
  // Entorno de prueba
  testEnvironment: 'node',
  
  // Directorio de pruebas
  testMatch: [
    '**/tests/**/*.js',
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/uploads/',
    '/logs/',
    '/temp/'
  ],
  
  // Configuración de cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
    '/dist/',
    '/build/',
    '/uploads/',
    '/logs/',
    '/temp/',
    '/examples/',
    '/scripts/setup-',
    '/server-original-backup.js'
  ],
  
  // Configuración de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Configuración de setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Configuración de timeout
  testTimeout: 30000,
  
  // Configuración de verbose
  verbose: true,
  
  // Configuración de clear mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Configuración de transform
  transform: {},
  
  // Configuración de bail
  bail: false,
  
  // Configuración de force exit
  forceExit: true,
  detectOpenHandles: true
};