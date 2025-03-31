import request from 'supertest';
import {getDataSource, testDataSource} from "../database/typeorm/data-source";
import {TypeOrmCustomer} from "../database/typeorm/data-model";
import {Express} from "express";
import createApp from "../app";
import {v4 as UUID} from "uuid";

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
            .send({ id: UUID(), email: 'customer@example.com' });
        expect(response.status).toBe(201);
        expect(response.text).toBe('');
    });
    it('should respond with 409 domain conflict', async () => {
        const responsePromise = await request(app)
            .post('/api/customers')
            .send({ id: UUID(), email: 'invalid-email-example.com' });
        expect(responsePromise.status).toBe(400);
        expect(responsePromise.text).toBe("Invalid email: invalid-email-example.com");
    });
});

describe('GET /api/customers/:id', () => {
    it('should respond with 200 ok with the customer resource', async () => {
        const id = UUID();
        const email = 'customer@example.com';
        const availableCredit = 0;
        await request(app).post('/api/customers').send({ id: id, email: email });

        const response = await request(app).get(`/api/customers/${id}`).send();
        expect(response.status).toBe(200);

        const expectedResponseText = `{"id":"${id}","email":"${email}","available_credit":${availableCredit}}`;

        expect(response.text).toBe(expectedResponseText);
    });
    it('should respond with 404 not found', async () => {
        const id = UUID();

        const response = await request(app).get(`/api/customers/${id}`).send();
        expect(response.status).toBe(404);
    });
});