import request from 'supertest';
import createApp from '../app';
import { Express } from "express";

let app: Express;
beforeAll(async () => {
    app = await createApp();
});

describe('GET /api/healthz', () => {
    it('should respond with "ok"', async () => {
        const response = await request(app).get('/api/healthz');
        expect(response.status).toBe(200);
        expect(response.text).toBe('ok');
    });
});