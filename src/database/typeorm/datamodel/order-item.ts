import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {TypeOrmPurchaseOrder} from "./purchase-order";

@Entity({name:"order_items"})
export class TypeOrmOrderItem {
    @PrimaryColumn("uuid")
    readonly id: string;

    @Column("uuid")
    readonly productId: string;

    @Column("int")
    readonly quantity: number;

    @Column("decimal")
    readonly unitPrice: number;

    @ManyToOne(() => TypeOrmPurchaseOrder, (order) => order.orderItems,{onDelete:"CASCADE"})
    purchaseOrder!: TypeOrmPurchaseOrder

    constructor(id: string, productId: string, quantity: number, unitPrice: number) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}
