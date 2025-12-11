module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Permitir require/import
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    
    // Permitir console en desarrollo
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Permitir variables no usadas en parámetros
    'no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_' 
    }],
    
    // Permitir async/await sin try/catch en casos específicos
    'no-useless-catch': 'off',
    
    // Permitir destructuring de objetos
    'dot-notation': 'off',
    
    // Permitir camelcase para variables específicas
    'camelcase': ['error', { 
      'properties': false,
      'ignoreDestructuring': false 
    }],
    
    // Permitir líneas en blanco
    'no-multiple-empty-lines': ['error', { max: 2 }],
    
    // Permitir punto y coma
    'semi': ['error', 'always'],
    
    // Permitir comillas simples
    'quotes': ['error', 'single'],
    
    // Permitir espaciado
    'space-before-function-paren': ['error', 'always'],
    'keyword-spacing': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never']
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'uploads/',
    'logs/',
    'temp/',
    '*.min.js'
  ]
};