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

const customersApiPath = '/api/customers';

describe('POST /api/customers', () => {
    it('should respond with 201 resource created', async () => {
        const response = await request(app)
            .post(customersApiPath)
            .send({ id: UUID(), email: 'customer@example.com' });
        expect(response.status).toBe(201);
        expect(response.text).toBe('');
    });
    it('should respond with 400 bad request', async () => {
        const response = await request(app)
            .post(customersApiPath)
            .send({ id: UUID(), email: 'invalid-email-example.com' });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Invalid email: invalid-email-example.com");
    });
    it('should respond with 400 bad request when execute the endpoint twice with same ID', async () => {
        const id = UUID();
        const email = 'customer@example.com';
        const anotherEmail = 'another-customer@example.com';
        let response = await request(app)
            .post(customersApiPath)
            .send({ id: id, email: email });
        expect(response.status).toBe(201);

        response = await request(app)
            .post(customersApiPath)
            .send({ id: id, email: anotherEmail });
        expect(response.status).toBe(400);
        expect(response.text).toBe(
            `Entity with id ${id} cannot be created because it already exists with same id and/or unique constraint.`
        );
    });
    it('should respond with 400 bad request when execute the endpoint twice with same email', async () => {
        const id = UUID();
        const anotherId = UUID();
        const email = 'customer@example.com';
        let response = await request(app)
            .post(customersApiPath)
            .send({ id: id, email: email });
        expect(response.status).toBe(201);

        response = await request(app)
            .post(customersApiPath)
            .send({ id: anotherId, email: email });
        expect(response.status).toBe(400);
        expect(response.text).toBe(
            `Entity with id ${anotherId} cannot be created because it already exists with same id and/or unique constraint.`
        );
    });
});

describe('GET /api/customers/:id', () => {
    it('should respond with 200 ok with the customer resource and billing addresses', async () => {
        const id = UUID();
        const email = 'customer@example.com';
        const availableCredit = 0;
        const billingAddress = {
            id : UUID(),
            street: "153 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA" ,
        };
        await request(app).post(customersApiPath).send({ id: id, email: email, billingAddress});

        const response = await request(app).get(`${customersApiPath}/${id}`).send();
        expect(response.status).toBe(200);

        const expectedResponseText = JSON.stringify({ id: id, email: email, available_credit: availableCredit,billing_address:[billingAddress] });

        expect(response.text).toBe(expectedResponseText);
    });
    it('should respond with 400 bad request', async () => {
        const id = "invalid-uuid";

        const response = await request(app).get(`${customersApiPath}/${id}`).send();
        expect(response.status).toBe(400);
        expect(response.text).toBe(`Invalid UUID: ${id}`);
    });
    it('should respond with 404 not found', async () => {
        const id = UUID();

        const response = await request(app).get(`${customersApiPath}/${id}`).send();
        expect(response.status).toBe(404);
        expect(response.text).toBe(`Entity not found with id ${id}`);
    });
});

describe('GET /api/customers', () => {
    it('should respond with 200 ok with all the customer resources', async () => {
        const id = UUID();
        const email = 'customer@example.com';
        const otherId = UUID();
        const otherEmail = 'other-customer@example.com';
        const credit = 0;
        const otherCredit = 10.4;

        await request(app).post(customersApiPath).send({ id: id, email: email });
        await request(app).post(customersApiPath).send({ id: otherId, email: otherEmail });
        await request(app).patch(`${customersApiPath}/${otherId}/add-credit`).send({ credit: 10.4 });

        const response = await request(app).get(customersApiPath).send();
        expect(response.status).toBe(200);

        const expectedResponseText = JSON.stringify([
            { id: otherId, email: otherEmail, available_credit: otherCredit },
            { id: id, email: email, available_credit: credit }
        ]);

        expect(response.text).toBe(expectedResponseText);
    });
});

describe('DELETE /api/customers/:id', () => {
    it('should respond with 200 ok', async () => {
        const id = UUID();
        await request(app).post(customersApiPath).send({ id: id, email: 'customer@example.com' });

        const response = await request(app)
            .delete(`${customersApiPath}/${id}`)
            .send();
        expect(response.status).toBe(200);
        expect(response.text).toBe('');
    });
    it('should respond with 404 not found', async () => {
        const id = UUID();

        const response = await request(app).delete(`${customersApiPath}/${id}`).send();
        expect(response.status).toBe(404);
        expect(response.text).toBe(`Entity not found with id ${id}`);
    });
});

describe('PATCH /api/customers/:id/add-credit', () => {
    it('should respond with 200 ok', async () => {
        const id = UUID();
        const credit = 10.5;
        const email = 'customer@example.com';

        await request(app).post(customersApiPath).send({ id: id, email: email });

        const response = await request(app).patch(`${customersApiPath}/${id}/add-credit`).send({ credit: credit });

        expect(response.status).toBe(200);
        expect(response.text).toBe('');
    });
    it('should respond with 404 not found', async () => {
        const id = UUID();
        const credit = 20;

        const response = await request(app).patch(`${customersApiPath}/${id}/add-credit`).send({ credit: credit });
        expect(response.status).toBe(404);
        expect(response.text).toBe(`Entity not found with id ${id}`);
    });
    it('should respond with 400 bad request', async () => {
        const id = UUID();
        const credit = -20;

        const response = await request(app).patch(`${customersApiPath}/${id}/add-credit`).send({ credit: credit });
        expect(response.status).toBe(400);
        expect(response.text).toBe("Credit cannot be negative");
    });
});

describe('POST /api/customers/:id/add-billing-address', () => {
    it('should respond with 500 when try to add duplicate billing address', async () => {
        const id = UUID();
        const email = 'customer@example.com';
        const billingAddress= ()=> ({
            id :UUID(),
            street: "153 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA" ,
        });

        await request(app).post(customersApiPath).send({ id: id, email: email, billingAddress:billingAddress()});


        const responseError = await request(app).post(`${customersApiPath}/${id}/add-billing-address`).send({billingAddress:billingAddress()});
        expect(responseError.status).toBe(400);
        expect(responseError.text).toBe("Billing address already exists");

    });
})