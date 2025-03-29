import request from 'supertest';
import app from '../app';

describe('GET /api/healthz', () => {
    it('should respond with "ok"', async () => {
        const response = await request(app).get('/api/healthz');
        expect(response.status).toBe(200);
        expect(response.text).toBe('ok');
    });
});