import request from 'supertest';
import {Response} from 'supertest';
import {Express} from "express";
import createApp from "../app";
import {v4 as UUID} from "uuid";
import {BillingAddressDTO} from "../services/customer";
import {CustomerCacheClearerFactory} from "../testutils/cache/customer-cache-clearer-factory";
import {CustomerCacheClearer} from "../testutils/cache/customer-cache-clearer";
import {DataSource} from "typeorm";
import dotenv from "dotenv";
import {TypeOrmCustomer} from "../database/typeorm/data-model";



describe('customer api acceptance tests', () => {
    const customersApiPath = '/api/customers';
    let app: Express;
    let dataSource: DataSource;
    let cacheClearer: CustomerCacheClearer

    afterEach(async () => {
        await dataSource.getRepository(TypeOrmCustomer).clear();
        await cacheClearer.clear();
    });

    beforeAll(async () => {
        dotenv.config({path: '.env'})

        app = await createApp();
        const container = app.container;
        const cacheClearerFactory: CustomerCacheClearerFactory = container.resolve<CustomerCacheClearerFactory>('customerCacheClearerFactory');

        const cacheImpl = process.env.CACHE_IMPL || 'inMemory';
        cacheClearer = cacheClearerFactory.create(cacheImpl);
        dataSource = container.resolve<DataSource>('dataSource');
    });

    afterAll(async () => {
        await dataSource.destroy();
        await cacheClearer.disconnect();
    });

    async function waitAndAssertForCustomerCreation(id: string, email: string, billingAddress?: BillingAddressDTO): Promise<Response> {
        const timer = 2000
        const response = await request(app)
            .post(customersApiPath)
            .send({ id, email, billingAddress });
            expect(response.status).toBe(202);

        const start = Date.now();
        while (Date.now() - start < timer) {
            const customerResponse = await request(app).get(`${customersApiPath}/${id}`).send();

            if (customerResponse.status === 200) {
                return customerResponse;
            }
            await new Promise((r) => setTimeout(r, 15));
        }

        throw new Error(`Timeout: customer with ID ${id} not found after ${timer}ms`)
    }

    describe('POST /api/customers', () => {
        it('should respond with 202', async () => {
            await waitAndAssertForCustomerCreation(UUID(), 'customer@example.com')
        });



        it('should respond with 202', async () => {
            await waitAndAssertForCustomerCreation(
                UUID(),
                'customer@example.com',
                new BillingAddressDTO("Montevideo","Parana","Entre Rios","3000","Argentina")
            );
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
                .send({ id:UUID(), email: 'invalid-email-example.com' });
            expect(response.status).toBe(400);
            expect(response.text).toBe("Invalid email: invalid-email-example.com");
        });
    });

    describe('GET /api/customers/:id', () => {
        it('should respond with 200 ok with the customer resource', async () => {
            const id = UUID();
            const email = 'email@gmail.com'

            const response = await waitAndAssertForCustomerCreation(id, email)

            const expectedResponseText = JSON.stringify({ id, email , available_credit:0});

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
            const email = 'email@gmail.com'
            const available_credit = 0

            const otherId = UUID();
            const otherEmail = 'other-email@gmail.com'

            await waitAndAssertForCustomerCreation(id, email)
            await waitAndAssertForCustomerCreation(otherId, otherEmail)

            const response = await request(app).get(customersApiPath).send();
            expect(response.status).toBe(200);

            let customers;
            expect(() => {
                customers = JSON.parse(response.text);
            }).not.toThrow();

            expect(customers).toEqual(
                expect.arrayContaining([
                    { id, email, available_credit },
                    { id: otherId, email: otherEmail, available_credit },
                ])
            );

            expect(customers).toHaveLength(2);
        });
    });

    describe('DELETE /api/customers/:id', () => {
        it('should respond with 200 ok', async () => {
            const id = UUID();
            const email = 'email@gmail.com'

            await waitAndAssertForCustomerCreation(id, email)

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
            const credit = 10.5;
            const id = UUID();
            const email = 'email@gmail.com'

            await waitAndAssertForCustomerCreation(id, email)

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
})

