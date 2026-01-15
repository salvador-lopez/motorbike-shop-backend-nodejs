import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {TypeOrmOrderItem} from "./order-item";

@Entity({ name: "purchase_orders" })
export class TypeOrmPurchaseOrder {
    @PrimaryColumn("uuid")
    readonly id: string;

    @Column("uuid")
    readonly customerId: string;

    @OneToMany(() => TypeOrmOrderItem, (item) => item.purchaseOrder, { cascade:true, eager: true }  )
    readonly orderItems: TypeOrmOrderItem[];

    constructor(id: string, customerId: string, orderItems: TypeOrmOrderItem[]) {
        this.id = id;
        this.customerId = customerId;
        this.orderItems = orderItems;
    }
}