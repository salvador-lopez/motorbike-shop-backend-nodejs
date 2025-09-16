import {DataSource} from "typeorm";
import {TypeOrmCustomer} from "./datamodel/customer";
import { TypeOrmPurchaseOrder} from "./datamodel/purchase-order";
import {TypeOrmOrderItem} from "./datamodel/order-item";

export const defaultDataSource = new DataSource({
    type: "sqlite",
    database: "./src/database/sqlite/motorbike-shop.db",
    synchronize: true,
    entities: [TypeOrmCustomer, TypeOrmPurchaseOrder, TypeOrmOrderItem],
});

export const testDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true, // Auto-create tables for testing
    entities: [TypeOrmCustomer, TypeOrmPurchaseOrder, TypeOrmOrderItem],
});