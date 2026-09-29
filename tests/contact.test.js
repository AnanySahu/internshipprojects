const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Contact Management API Endpoints', () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;

  const sampleContactA = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1-555-123-4567',
    address: {
      street: '123 Market St',
      city: 'San Francisco',
      state: 'CA',
      pincode: '94105',
    },
    company: {
      name: 'Acme Corp',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
    },
  };

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'password123',
    });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'password123',
    });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;
  });

  describe('POST /api/contacts', () => {
    it('should create a new contact with nested fields', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe(sampleContactA.name);
      expect(res.body.data.email).toBe(sampleContactA.email);
      expect(res.body.data.address.city).toBe('San Francisco');
      expect(res.body.data.company.name).toBe('Acme Corp');
      expect(res.body.data.user).toBe(userAId);
    });

    it('should reject creating duplicate contact with same email for the same user (409 Conflict)', async () => {
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should allow different users to store a contact with the same email', async () => {
      const resA = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const resB = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userBToken}`)
        .send(sampleContactA);

      expect(resA.status).toBe(201);
      expect(resB.status).toBe(201);
      expect(resA.body.data._id).not.toBe(resB.body.data._id);
    });

    it('should fail with 400 when required fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: '',
          email: 'invalid-email',
          phone: 'abc',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should retrieve a contact by ID for the owner', async () => {
      const created = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const contactId = created.body.data._id;

      const res = await request(app)
        .get(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(contactId);
      expect(res.body.data.name).toBe(sampleContactA.name);
    });

    it('should prevent User B from retrieving User A contact (404 Not Found)', async () => {
      const created = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const contactId = created.body.data._id;

      const res = await request(app)
        .get(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should return 400 if contact ID format is invalid', async () => {
      const res = await request(app)
        .get('/api/contacts/invalid-id-format')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/contacts/:id', () => {
    it('should update specific fields including nested address and company', async () => {
      const created = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const contactId = created.body.data._id;

      const res = await request(app)
        .patch(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Alice Johnson Updated',
          company: {
            jobTitle: 'Principal Engineer',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Alice Johnson Updated');
      expect(res.body.data.company.jobTitle).toBe('Principal Engineer');
      expect(res.body.data.company.name).toBe('Acme Corp'); // Existing nested property preserved
    });

    it('should prevent User B from updating User A contact (404 Not Found)', async () => {
      const created = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const contactId = created.body.data._id;

      const res = await request(app)
        .patch(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete contact successfully for owner', async () => {
      const created = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const contactId = created.body.data._id;

      const res = await request(app)
        .delete(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it no longer exists
      const fetchRes = await request(app)
        .get(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(fetchRes.status).toBe(404);
    });

    it('should prevent User B from deleting User A contact (404 Not Found)', async () => {
      const created = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleContactA);

      const contactId = created.body.data._id;

      const res = await request(app)
        .delete(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);

      // Verify contact is still intact
      const fetchRes = await request(app)
        .get(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(fetchRes.status).toBe(200);
    });
  });

  describe('Search, Sorting, and Pagination (GET /api/contacts)', () => {
    beforeEach(async () => {
      // Seed contacts for User A
      const contacts = [
        { name: 'Charlie Brown', email: 'charlie@peanuts.com', phone: '+1111111111', company: { name: 'Peanuts Inc' } },
        { name: 'Bob Smith', email: 'bob@apple.com', phone: '+2222222222', company: { name: 'Apple' } },
        { name: 'Alice Walker', email: 'alice@google.com', phone: '+3333333333', company: { name: 'Google' } },
        { name: 'David Miller', email: 'david@microsoft.com', phone: '+4444444444', company: { name: 'Microsoft' } },
        { name: 'Eve Adams', email: 'eve@amazon.com', phone: '+5555555555', company: { name: 'Amazon' } },
      ];

      for (const c of contacts) {
        await request(app)
          .post('/api/contacts')
          .set('Authorization', `Bearer ${userAToken}`)
          .send(c);
      }

      // Seed 1 contact for User B to guarantee isolation in listing
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          name: 'Zack Isolated',
          email: 'zack@isolated.com',
          phone: '+9999999999',
          company: { name: 'Isolated Corp' },
        });
    });

    it('should list all contacts for User A without exposing User B contacts', async () => {
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contacts.length).toBe(5);
      expect(res.body.data.pagination.totalContacts).toBe(5);
      const names = res.body.data.contacts.map((c) => c.name);
      expect(names).not.toContain('Zack Isolated');
    });

    it('should search contacts across name, email, or phone', async () => {
      // Search by partial name
      const resName = await request(app)
        .get('/api/contacts?search=bob')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(resName.body.data.contacts.length).toBe(1);
      expect(resName.body.data.contacts[0].name).toBe('Bob Smith');

      // Search by partial email
      const resEmail = await request(app)
        .get('/api/contacts?search=@peanuts.com')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(resEmail.body.data.contacts.length).toBe(1);
      expect(resEmail.body.data.contacts[0].email).toBe('charlie@peanuts.com');

      // Search by phone
      const resPhone = await request(app)
        .get('/api/contacts?search=333333')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(resPhone.body.data.contacts.length).toBe(1);
      expect(resPhone.body.data.contacts[0].name).toBe('Alice Walker');
    });

    it('should sort contacts dynamically by allowed fields', async () => {
      // Sort by name ascending
      const resAsc = await request(app)
        .get('/api/contacts?sortBy=name&order=asc')
        .set('Authorization', `Bearer ${userAToken}`);

      const namesAsc = resAsc.body.data.contacts.map((c) => c.name);
      expect(namesAsc).toEqual(['Alice Walker', 'Bob Smith', 'Charlie Brown', 'David Miller', 'Eve Adams']);

      // Sort by company ascending
      const resCompany = await request(app)
        .get('/api/contacts?sortBy=company&order=asc')
        .set('Authorization', `Bearer ${userAToken}`);

      const companiesAsc = resCompany.body.data.contacts.map((c) => c.company.name);
      expect(companiesAsc).toEqual(['Amazon', 'Apple', 'Google', 'Microsoft', 'Peanuts Inc']);
    });

    it('should reject invalid sort fields with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/contacts?sortBy=password&order=asc')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should paginate contacts correctly and return metadata', async () => {
      const res = await request(app)
        .get('/api/contacts?page=1&limit=2&sortBy=name&order=asc')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.contacts.length).toBe(2);
      expect(res.body.data.pagination).toEqual({
        currentPage: 1,
        limit: 2,
        totalContacts: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      });

      // Page 2
      const resPage2 = await request(app)
        .get('/api/contacts?page=2&limit=2&sortBy=name&order=asc')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(resPage2.body.data.contacts.length).toBe(2);
      expect(resPage2.body.data.pagination.currentPage).toBe(2);
      expect(resPage2.body.data.pagination.hasNextPage).toBe(true);
      expect(resPage2.body.data.pagination.hasPrevPage).toBe(true);
    });

    it('should compose search, sort, and pagination together seamlessly', async () => {
      const res = await request(app)
        .get('/api/contacts?search=a&sortBy=name&order=asc&page=1&limit=2')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contacts.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination.currentPage).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
    });
  });
});
