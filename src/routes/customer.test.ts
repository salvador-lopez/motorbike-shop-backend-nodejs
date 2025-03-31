import request from 'supertest';
import {getDataSource, testDataSource} from "../database/typeorm/data-source";
import {TypeOrmCustomer} from "../database/typeorm/data-model";
import {Express} from "express";
import createApp from "../app";

let app: Express;

beforeEach(async () => {
    await getDataSource().getRepository(TypeOrmCustomer).clear();
});

beforeAll(async () => {
    app = await createApp(testDataSource);
});

afterAll(async () => {
    await testDataSource.destroy();
});

describe('POST /api/customers', () => {
    it('should respond with 201 resource created', async () => {
        const response = await request(app)
            .post('/api/customers')
            .send({ id: 'ffc63590-81f8-4bbe-8b44-90d2d02a4098', email: 'customer@example.com' });
        expect(response.status).toBe(201);
        expect(response.text).toBe('');
    });
    it('should respond with 409 domain conflict', async () => {
        const responsePromise = await request(app)
            .post('/api/customers')
            .send({ id: 'ffc63590-81f8-4bbe-8b44-90d2d02a4098', email: 'invalid-email-example.com' });
        expect(responsePromise.status).toBe(400);
        expect(responsePromise.text).toBe("Invalid email: invalid-email-example.com");
    });
});