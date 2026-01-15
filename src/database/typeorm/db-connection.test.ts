
import { testDataSource } from "./data-source";
import { v4 as UUID } from "uuid";
import { EntityId } from "../../domain/common";
import { OrderItem } from "../../domain/order-item";
import { PurchaseOrder } from "../../domain/purchase-order";
import { TypeOrmPurchaseOrderRepository } from "./purchase-order-repository";
import { QueryFailedError } from "typeorm";
import {TypeOrmConnection} from "./db-connection";
import {TypeOrmPurchaseOrder} from "./datamodel/purchase-order";
import {TypeOrmOrderItem} from "./datamodel/order-item";

describe("TypeOrmTransactionManager (integration)", () => {
  let dbConnection: TypeOrmConnection;
  let purchaseOrderRepository: TypeOrmPurchaseOrderRepository;

  beforeAll(async () => {
    await testDataSource.initialize();
    dbConnection = new TypeOrmConnection({ dataSource: testDataSource });

    purchaseOrderRepository = new TypeOrmPurchaseOrderRepository({ purchaseOrderRepositoryConn: dbConnection.entityManager().getRepository(TypeOrmPurchaseOrder), orderItemRepositoryConn: dbConnection.entityManager().getRepository(TypeOrmOrderItem) });
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  beforeEach(async () => {

  });

  it("commits on success: persists purchase order and items using repository.create inside a transaction", async () => {
    const poId = new EntityId(UUID());
    const customerId = new EntityId(UUID());
    const itemAId = new EntityId(UUID());
    const itemBId = new EntityId(UUID());
    const productA = new EntityId(UUID());
    const productB = new EntityId(UUID());

    const orderItems = [
      new OrderItem(itemAId, productA, 1, 100),
      new OrderItem(itemBId, productB, 2, 200),
    ];
    const purchaseOrder = new PurchaseOrder(poId, customerId, orderItems);

    await dbConnection.transaction(async () => {
      await purchaseOrderRepository.create(purchaseOrder);
    });

    const persisted = await purchaseOrderRepository.findById(poId);
    expect(persisted).not.toBeNull();
    if (persisted) {
      expect(persisted.customerId).toStrictEqual(customerId);
      expect(persisted.orderItems.length).toBe(2);
      const ids = persisted.orderItems.map((i) => i.id.value).sort();
      expect(ids).toEqual([itemAId.value, itemBId.value].sort());
    }
  });

  it("rolls back on failure: nothing is persisted when item insert fails using repository.create inside a transaction", async () => {
    const poId = new EntityId(UUID());
    const customerId = new EntityId(UUID());
    const duplicatedItemId = new EntityId(UUID());
    const productA = new EntityId(UUID());
    const productB = new EntityId(UUID());

    const orderItems = [
      new OrderItem(duplicatedItemId, productA, 1, 100),
      new OrderItem(duplicatedItemId, productB, 1, 100),
    ];
    const purchaseOrder = new PurchaseOrder(poId, customerId, orderItems);

    await expect(
        dbConnection.transaction(async () => {
        await purchaseOrderRepository.create(purchaseOrder);
      })
    ).rejects.toBeInstanceOf(QueryFailedError);

    const persisted = await purchaseOrderRepository.findById(poId);
    expect(persisted).toBeNull();
  });
});
