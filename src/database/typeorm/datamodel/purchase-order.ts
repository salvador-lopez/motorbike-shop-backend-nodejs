import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";

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
