const request = require('supertest');
const app = require('../server-simple'); // Use the simple server for testing

describe('Health Endpoints', () => {
  describe('GET /v1/health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app)
        .get('/v1/health')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('should return environment and uptime information', async () => {
      const response = await request(app)
        .get('/v1/health')
        .expect(200);

      expect(response.body.environment).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /v1/health/live', () => {
    it('should return live status', async () => {
      const response = await request(app)
        .get('/v1/health/live')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('alive');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('ContextVault API');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.status).toBe('operational');
    });
  });
}); 