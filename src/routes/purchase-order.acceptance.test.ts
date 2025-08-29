import request from 'supertest';
import {Response} from 'supertest';
import {Express} from "express";
import createApp from "../app";
import {v4 as UUID} from "uuid";
import {DataSource} from "typeorm";
import dotenv from "dotenv";
import {TypeOrmPurchaseOrder} from "../database/typeorm/datamodel/purchase-order";
import {OrderItemDTO} from "../services/purchase-order";

describe('purchase order api acceptance tests', () => {
    const purchaseOrdersApiPath = '/api/purchase-orders';
    let app: Express;
    let dataSource: DataSource;

    beforeAll(async () => {
        dotenv.config({path: '.env'})
        app = await createApp();
        dataSource = app.container.resolve<DataSource>('dataSource');
    });

    afterEach(async () => {
        await dataSource.getRepository(TypeOrmPurchaseOrder).clear();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    describe('POST /api/purchase-orders', () => {
        it('should create a new purchase order and respond with 201', async () => {
            const orderData = {
                id: UUID(),
                customer_id: UUID(),
                order_items: [
                    {
                        id: UUID(),
                        product_id: UUID(),
                        quantity: 2,
                        unit_price: 100.50
                    }
                ]
            };

            const response = await request(app)
                .post(purchaseOrdersApiPath)
                .send(orderData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({});
        });


        it.each([['id'],['product_id'],['quantity'],['unit_price']])('should return 400 for invalid order item data', async (field) => {

        const {[field]:_,...invalidOrderItem} = {id: UUID(),product_id: UUID(),quantity: 2,unit_price: 100.50} as any

            const invalidOrderData = {
                id: UUID(),
                customerId: UUID(),
                order_items: [
                    invalidOrderItem
                ]
            };

            const response = await request(app)
                .post(purchaseOrdersApiPath)
                .send(invalidOrderData);

            expect(response.status).toBe(400);
        });

        it('should return 400 for duplicate order ID', async () => {
            const orderData = {
                id: UUID(),
                customerId: UUID(),
                order_items: [
                    {
                        id: UUID(),
                        productId: UUID(),
                        quantity: 1,
                        unitPrice: 50.00
                    }
                ]
            };

            // First request should succeed
            await request(app)
                .post(purchaseOrdersApiPath)
                .send(orderData);

            // Second request with same order ID should fail
            const response = await request(app)
                .post(purchaseOrdersApiPath)
                .send(orderData);

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/purchase-orders/:id', () => {
        it('should retrieve an existing purchase order', async () => {
            const orderId = UUID();
            const customerId = UUID();
            const orderItemId = UUID();
            const productId = UUID();

            await request(app)
                .post(purchaseOrdersApiPath)
                .send({
                    id: orderId,
                    customer_id: customerId,
                    order_items: [{
                        id: orderItemId,
                        product_id: productId,
                        quantity: 3,
                        unit_price: 25.99
                    }]
                });


            const response = await request(app)
                .get(`${purchaseOrdersApiPath}/${orderId}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: orderId,
                customer_id: customerId,
                order_items: [{
                    id: orderItemId,
                    product_id: productId,
                    quantity: 3,
                    unit_price: 25.99
                }]
            });
        });

        it('should return 404 for non-existent order', async () => {
            const nonExistentId = UUID();
            const response = await request(app)
                .get(`${purchaseOrdersApiPath}/${nonExistentId}`)
                .send();

            expect(response.status).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const response = await request(app)
                .get(`${purchaseOrdersApiPath}/invalid-uuid`)
                .send();

            expect(response.status).toBe(400);
        });
    });
});
