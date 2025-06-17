import request from 'supertest';
import {testDataSource} from "../database/typeorm/data-source";
import {TypeOrmCustomer} from "../database/typeorm/data-model";
import {Express} from "express";
import createApp, {AppCache} from "../app";
import {v4 as UUID} from "uuid";
import {BillingAddressDTO, CustomerDTO} from "../services/customer";
import {InMemoryCustomerCacheClearer} from "../testutils/cache/inMemory/customer-cache-clearer";
import {RedisCustomerCacheClearer} from "../testutils/cache/redis/customer-cache-clearer";
import {CustomerCacheClearerFactory} from "../testutils/cache/customer-cache-clearer-factory";
import {CustomerCacheClearer} from "../testutils/cache/customer-cache-clearer";
import {createClient, RedisClientType} from "redis";
import {InMemoryCustomerCache} from "../services/cache/inMemory/customer-in-memory";
import {RedisCustomerCache} from "../services/cache/redis/customer-redis";

let app: Express;

let cacheClearer: CustomerCacheClearer

afterEach(async () => {
    await testDataSource.getRepository(TypeOrmCustomer).clear();
    await cacheClearer.clear();
});

beforeAll(async () => {
    const cacheImpl = process.env.CACHE_IMPL || 'inMemory';
    const redisClient:RedisClientType = createClient({
        url:'redis://localhost:6379',
    })

    const inMemory = new Map<string, CustomerDTO>();

    if( cacheImpl === 'redis' ){
        await redisClient.connect()
    }

    const cache:AppCache = {
        customerCache: cacheImpl === 'redis' ? new RedisCustomerCache(redisClient) : new InMemoryCustomerCache(inMemory)
    }

    app = await createApp(testDataSource,cache);

    const cacheClearerFactory = new CustomerCacheClearerFactory(
        new InMemoryCustomerCacheClearer(inMemory),
        new RedisCustomerCacheClearer(redisClient)
    );
    cacheClearer = cacheClearerFactory.create(cacheImpl);
});

afterAll(async () => {
    await testDataSource.destroy();
    await cacheClearer.disconnect();
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

    it('should respond with 201 resource created', async () => {
        const response = await request(app)
            .post(customersApiPath)
            .send({ id: UUID(), email: 'customer_withBillingAddress@example.com', billing_address:new BillingAddressDTO("Montevideo","Parana","Entre Rios","3000","Argentina") });
        expect(response.status).toBe(201);
        expect(response.text).toBe('');
    });

    describe('BillingAddressDto validation', () => {
        const id = UUID();
        const email = "email@example.com";
        const baseBillingAddressDto:BillingAddressDTO = {
            street: 'Carrer de Llepant',
            city: 'Barcelona',
            state: 'Cataluña',
            zipCode: '08032',
            country: 'Spain',
        };

        it('should respond with 400 bad request', async () => {
            const invalidKey= "invalid_key"
                const invalidAddress = {...baseBillingAddressDto, [invalidKey]:"invalid"}

            const response = await request(app)
                .post(customersApiPath)
                .send({ id: id, email: email, billing_address: invalidAddress });
            expect(response.status).toBe(400)
            expect(response.text).toEqual(`the field {${invalidKey}} is invalid.\n`);
        });

        it.each<[keyof BillingAddressDTO]>([['street'], ['city'], ['state'], ['zipCode'], ['country']])(
            "should respond with 400 bad request",
            async (field) => {
                const {[field]:_,...invalidAddress} = baseBillingAddressDto

                const response = await request(app)
                    .post(customersApiPath)
                    .send({ id: UUID(), email: 'customer_withBillingAddress@example.com', billing_address:invalidAddress})
                expect(response.status).toBe(400);
                expect(response.text).toEqual(`the field {${field}} is required.\n`);
            }
        );
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
        expect(response.text).toEqual(
            `Entity with id ${id} already exists.`
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
        expect(response.text).toEqual(
            `Entity with email ${email} already exists.`
        );
    });
});

describe('GET /api/customers/:id', () => {
    it('should respond with 200 ok with the customer resource', async () => {
        const id = UUID();
        const email = 'customer@example.com';
        const availableCredit = 0;
        await request(app).post(customersApiPath).send({ id: id, email: email });

        const response = await request(app).get(`${customersApiPath}/${id}`).send();
        expect(response.status).toBe(200);

        const expectedResponseText = JSON.stringify({ id: id, email: email, available_credit: availableCredit });

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