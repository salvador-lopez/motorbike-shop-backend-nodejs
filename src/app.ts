import express from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";
import {defaultDataSource} from "./database/typeorm/data-source";
import {DataSource} from "typeorm";

const createApp = async (dataSource: DataSource = defaultDataSource) => {
    const app = express();

    await dataSource.initialize();

    setupSwagger(app);
    app.use(express.json());

    loadRoutes(app, dataSource);


    return app;
}

export default createApp;