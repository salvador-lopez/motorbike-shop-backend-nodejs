import express from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";
import {defaultDataSource, initializeDataSource} from "./database/typeorm/data-source";
import {DataSource} from "typeorm";

const createApp = async (dataSource: DataSource = defaultDataSource) => {
    const app = express();

    await initializeDataSource(dataSource);

    setupSwagger(app);
    loadRoutes(app)

    app.use(express.json());

    return app;
}

export default createApp;