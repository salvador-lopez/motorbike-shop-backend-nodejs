import {DataSource} from "typeorm";
import {TypeOrmBillingAddress, TypeOrmCustomer} from "./data-model";


let dataSource: DataSource;

export const initializeDataSource = async (source: DataSource) => {
    await source.initialize();
    dataSource = source;
};

export const getDataSource = (): DataSource => {
    if (!dataSource) {
        throw new Error("DataSource is not initialized!");
    }
    return dataSource;
};

export const defaultDataSource = new DataSource({
    type: "sqlite",
    database: "./src/database/sqlite/motorbike-shop.db",
    synchronize: true,
    entities: [TypeOrmCustomer,TypeOrmBillingAddress],
});

export const testDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true, // Auto-create tables for testing
    entities: [TypeOrmCustomer,TypeOrmBillingAddress],
});