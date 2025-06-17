import express from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";
import {defaultDataSource} from "./database/typeorm/data-source";
import {DataSource} from "typeorm";
import {CustomerDTO} from "./services/customer";
import {CustomerCache} from "./services/cache/customer-cache";
import {InMemoryCustomerCache} from "./services/cache/inMemory/customer-in-memory";

const memory = new Map<string, CustomerDTO>();

const createApp = async (customerService: DataSource = defaultDataSource, customerCache: CustomerCache = new InMemoryCustomerCache(memory)) => {
    const app = express();

    await dataSource.initialize();

    setupSwagger(app);
    app.use(express.json());

    loadRoutes(app, dataSource, customerCache);

    return app;
}

export default createApp;