import {DataSource} from "typeorm";
import {TypeOrmCustomer} from "./data-model";

export const defaultDataSource = new DataSource({
    type: "sqlite",
    database: "./src/database/sqlite/motorbike-shop.db",
    synchronize: true,
    entities: [TypeOrmCustomer],
});

export const testDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true, // Auto-create tables for testing
    entities: [TypeOrmCustomer],
});