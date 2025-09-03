import {EntityId} from "./common";

export class OrderItem {
    readonly id: EntityId;
    readonly productId: EntityId;
    readonly quantity: number;
    readonly unitPrice: number;

    constructor(id:EntityId, productId:EntityId, quantity: number, unitPrice: number) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}