import express from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";
import {defaultDataSource} from "./database/typeorm/data-source";
import {DataSource} from "typeorm";
import {CustomerDTO} from "./services/customer";
import {CustomerCache} from "./services/cache/customer-cache";
import {InMemoryCustomerCache} from "./services/cache/inMemory/customer-in-memory";

export interface AppCache {
    customerCache:CustomerCache;
}
const memory = new Map<string, CustomerDTO>();

const createApp = async (dataSource: DataSource = defaultDataSource, cache: AppCache = {customerCache:new InMemoryCustomerCache(memory)}) => {
    const app = express();

    await dataSource.initialize();

    setupSwagger(app);
    app.use(express.json());

    loadRoutes(app, dataSource, cache);

    return app;
}

export default createApp;