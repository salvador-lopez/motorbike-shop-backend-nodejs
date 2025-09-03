import {testDataSource} from "./data-source";
import {EntityId} from "../../domain/common";
import { v4 as UUID} from 'uuid';
import {QueryFailedError} from "typeorm";
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmOrderItem, TypeOrmPurchaseOrder} from "./datamodel/purchase-order";
import {TypeOrmPurchaseOrderRepository} from "./purchase-order-repository";
import {PurchaseOrder} from "../../domain/purchase-order";
import {OrderItem} from "../../domain/order-item";

let purchaseOrderRepo: TypeOrmPurchaseOrderRepository;
const typeOrmRepo: Repository<TypeOrmPurchaseOrder> = testDataSource.getRepository(TypeOrmPurchaseOrder);

beforeEach(async () => {
    purchaseOrderRepo = new TypeOrmPurchaseOrderRepository({purchaseOrderRepositoryConn: typeOrmRepo});
    await typeOrmRepo.clear();
});

beforeAll(async () => {
    await testDataSource.initialize();
});

afterAll(async () => {
    await testDataSource.destroy();
});

describe("PurchaseOrder Repository Integration Test", () => {
    it("should create a new purchaseOrder", async () => {
        const entityId = new EntityId(UUID());
        const customerId = new EntityId(UUID());
        const orderItemId = new EntityId(UUID());
        const orderItemProductId = new EntityId(UUID());
        const orderItemQuantity = 1;
        const orderItemUnitPrice = 3000;
        const orderItems = [new OrderItem(orderItemId, orderItemProductId,orderItemQuantity,orderItemUnitPrice)]
        const purchaseOrder = new PurchaseOrder(entityId, customerId, orderItems)

        await purchaseOrderRepo.create(purchaseOrder);

        const purchaseOrderDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });
        expect(purchaseOrderDataModel).not.toBeNull();
        if (purchaseOrderDataModel !== null) {
            expect(purchaseOrderDataModel.id).toBe(entityId.value);
            expect(purchaseOrderDataModel.customerId).toBe(customerId.value);
            expect(purchaseOrder.orderItems[0].id).toBe(orderItemId);
            expect(purchaseOrder.orderItems[0].unitPrice).toBe(orderItemUnitPrice);
            expect(purchaseOrder.orderItems[0].quantity).toBe(orderItemQuantity);
            expect(purchaseOrder.orderItems[0].productId).toBe(orderItemProductId);
        }
    });

    it("should find a purchaseOrder by it´s id", async () => {
        const entityId = UUID();
        const customerId = UUID();
        const orderItemId = UUID();
        const orderItemProductId = UUID();
        const orderItemQuantity = 1;
        const orderItemUnitPrice = 3000;
        const orderItems = [new TypeOrmOrderItem(orderItemId, orderItemProductId, orderItemQuantity, orderItemUnitPrice)]
        const purchaseOrder = new TypeOrmPurchaseOrder(entityId, customerId, orderItems)

        await typeOrmRepo.save(purchaseOrder);

        const purchaseOrderResponse = await purchaseOrderRepo.findById(new EntityId(entityId))

        expect(purchaseOrderResponse).not.toBeUndefined();
        if (purchaseOrderResponse) {
            expect(purchaseOrderResponse.id.value).toEqual(entityId);
            expect(purchaseOrderResponse.customerId.value).toEqual(customerId);
            expect(purchaseOrderResponse.orderItems[0].id.value).toBe(orderItemId);
            expect(purchaseOrderResponse.orderItems[0].unitPrice).toBe(orderItemUnitPrice);
            expect(purchaseOrderResponse.orderItems[0].quantity).toBe(orderItemQuantity);
            expect(purchaseOrderResponse.orderItems[0].productId.value).toBe(orderItemProductId);
        }
    });

    it("should return void when find a purchaseOrder by it´s id but the customer not found", async () => {
        const entityId = new EntityId(UUID());

        const purchaseOrder = await purchaseOrderRepo.findById(entityId);
        expect(purchaseOrder).toBeNull();
    });
});