import {EntityId} from "./common";

export interface PurchaseOrderRepository {
    create(purchaseOrder: PurchaseOrder): Promise<void>;
}

export class PurchaseOrder {
    readonly id: EntityId;
    readonly customerId: EntityId;
    readonly orderItems: OrderItem[];

    constructor(id: EntityId,customerId: EntityId, orderItems:OrderItem[]) {
        this.id = id;
        this.customerId = customerId;
        this.orderItems = orderItems;
    }
}

export class OrderItem {
    readonly productId: EntityId;
    readonly quantity: number;
    readonly unitPrice: number;

    constructor(productId: EntityId, quantity: number, unitPrice: number) {
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}