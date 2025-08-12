import {EntityId} from "./common";

export interface PurchaseOrderRepository {
    create(purchaseOrder: PurchaseOrder): Promise<void>;
}

export class PurchaseOrder {
    readonly id: EntityId;
    readonly customerId: EntityId;


    constructor(id: EntityId,customerId: EntityId) {
        this.id = id;
        this.customerId = customerId;
    }
}