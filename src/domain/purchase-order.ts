import {EntityId} from "./common";
import {OrderItem} from "./order-item";

export interface PurchaseOrderRepository {
    create(purchaseOrder: PurchaseOrder): Promise<void>;
    findById(id:EntityId):Promise<PurchaseOrder | null>
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
