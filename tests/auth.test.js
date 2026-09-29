const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Authentication API Endpoints', () => {
  const validUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject registration if email already exists (409 Conflict)', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should fail with 400 when required fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should authenticate user and return token with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should fail with 401 when password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should fail with 401 when email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should retrieve current user profile when valid token is provided', async () => {
      const regRes = await request(app).post('/api/auth/register').send(validUser);
      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject request with 401 when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken12345');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
