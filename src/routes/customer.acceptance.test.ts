import request from 'supertest';
import {TypeOrmCustomer} from "../database/typeorm/data-model";
import {Express} from "express";
import createApp from "../app";
import {v4 as UUID} from "uuid";
import {BillingAddressDTO} from "../services/customer";
import {CustomerCacheClearerFactory} from "../testutils/cache/customer-cache-clearer-factory";
import {CustomerCacheClearer} from "../testutils/cache/customer-cache-clearer";
import {DataSource} from "typeorm";
import dotenv from "dotenv";
import {TypeOrmCustomerRepository} from "../database/typeorm/customer-repository";
import {Customer, CustomerRepository} from "../domain/customer";
import {Email,EntityId} from "../domain/common";

describe('customer api acceptance tests', () => {
    const customersApiPath = '/api/customers';
    let app: Express;
    let dataSource: DataSource;
    let cacheClearer: CustomerCacheClearer
    let customerRepository:CustomerRepository

    // customers
    const customerId1 = UUID();
    const customerEmail1 ='email1@gmail.com'
    const customer1 = new Customer(new EntityId(customerId1),new Email(customerEmail1));

    const customerId2 = UUID();
    const customerEmail2 ='email2@gmail.com'
    const customer2 = new Customer(new EntityId(customerId2),new Email(customerEmail2));

    const customerToAddCreditId = UUID();
    const customerToAddCreditEmail ='email-to-patch@gmail.com'
    const customerToAddCredit = new Customer(new EntityId(customerToAddCreditId),new Email(customerToAddCreditEmail));

    const customerToDeleteId = UUID();
    const customerToDeleteEmail ='email-to-delete@gmail.com'
    const customerToDelete = new Customer(new EntityId(customerToDeleteId),new Email(customerToDeleteEmail));

    beforeEach(async () => {

        await customerRepository.save(customer1);
        await customerRepository.save(customer2);
        await customerRepository.save(customerToAddCredit);
        await customerRepository.save(customerToDelete);
    })

    afterEach(async () => {
        await dataSource.getRepository(TypeOrmCustomer).clear();
        await cacheClearer.clear();
    });

    beforeAll(async () => {
        dotenv.config({path:'.env'})

        app = await createApp();
        const container = app.container;
        const cacheClearerFactory: CustomerCacheClearerFactory = container.resolve<CustomerCacheClearerFactory>('customerCacheClearerFactory');

        const cacheImpl = process.env.CACHE_IMPL || 'inMemory';
        cacheClearer = cacheClearerFactory.create(cacheImpl);
        dataSource = container.resolve<DataSource>('dataSource');
        customerRepository = container.resolve<TypeOrmCustomerRepository>('customerRepository');
    });

    afterAll(async () => {
        await dataSource.destroy();
        await cacheClearer.disconnect();
    });

    describe('POST /api/customers', () => {
        it('should respond with 202', async () => {
            const response = await request(app)
                .post(customersApiPath)
                .send({ id: UUID(), email: 'customer@example.com' });
            expect(response.status).toBe(202);
            expect(response.text).toBe('');
        });

        it('should respond with 202', async () => {
            const response = await request(app)
                .post(customersApiPath)
                .send({ id: UUID(), email: 'customer_withBillingAddress@example.com', billing_address:new BillingAddressDTO("Montevideo","Parana","Entre Rios","3000","Argentina") });
            expect(response.status).toBe(202);
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
    });

    describe('GET /api/customers/:id', () => {
        it('should respond with 200 ok with the customer resource', async () => {
            const availableCredit = 0;

            const response = await request(app).get(`${customersApiPath}/${customerId1}`).send();
            expect(response.status).toBe(200);

            const expectedResponseText = JSON.stringify({ id: customerId1, email: customerEmail1, available_credit: availableCredit });

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
            const response = await request(app).get(customersApiPath).send();
            expect(response.status).toBe(200);

            const expectedResponseText = JSON.stringify([
                { id: customerId1, email: customerEmail1, available_credit: 0 },
                { id: customerId2, email: customerEmail2, available_credit: 0 },
                { id: customerToAddCreditId, email: customerToAddCreditEmail, available_credit: 0 },
                { id: customerToDeleteId, email: customerToDeleteEmail, available_credit: 0 },
            ]);

            expect(response.text).toBe(expectedResponseText);
        });
    });

    describe('DELETE /api/customers/:id', () => {
        it('should respond with 200 ok', async () => {
            const response = await request(app)
                .delete(`${customersApiPath}/${customerToDeleteId}`)
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

            const response = await request(app).patch(`${customersApiPath}/${customerToAddCreditId}/add-credit`).send({ credit: credit });

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

