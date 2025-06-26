import request from 'supertest';
import createApp from '../app';
import { Express } from "express";
import {createAppTestContainer} from "../testutils/test-container";

let app: Express;
beforeAll(async () => {
    app = await createApp(await createAppTestContainer());
});

describe('GET /api/healthz', () => {
    it('should respond with "ok"', async () => {
        const response = await request(app).get('/api/healthz');
        expect(response.status).toBe(200);
        expect(response.text).toBe('ok');
    });
});