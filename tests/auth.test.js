const request = global.request

describe('Authentication Tests', () => {
  let app

  beforeAll(() => {
    // Importar la aplicación
    app = require('../server')
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user).toHaveProperty('email', userData.email)
    })

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'testpassword123',
        name: 'Test User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body.error).toContain('email')
    })

    it('should not register user with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body.error).toContain('password')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('user')
    })

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body.error).toContain('credenciales')
    })
  })

  describe('Protected Routes', () => {
    let authToken

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      
      authToken = loginResponse.body.data.token
    })

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
    })

    it('should not access protected route without token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
    })

    it('should not access protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
    })
  })
})

describe('API Health Check', () => {
  it('should return API status', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body.data).toHaveProperty('status', 'online')
    expect(response.body.data).toHaveProperty('timestamp')
  })
})