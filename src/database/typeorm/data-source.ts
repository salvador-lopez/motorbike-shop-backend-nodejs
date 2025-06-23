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

export async function getDefaultDataSource() {
    if(process.env.NODE_ENV === 'test'){
        await  testDataSource.initialize();
        return testDataSource;
    }
    await defaultDataSource.initialize()
    return defaultDataSource;
}