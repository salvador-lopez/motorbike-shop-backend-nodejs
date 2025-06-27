import express, {Express} from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";
import {scopePerRequest} from "awilix-express";
import {createAppContainer} from "./container";
import {AwilixContainer} from "awilix";

const attachContainer = async (app: Express) => {
    const container: AwilixContainer = await createAppContainer();
    app.container = container;
    app.use(scopePerRequest(container));
};

const createApp = async () => {
    const app = express();
    await attachContainer(app);

    setupSwagger(app);
    app.use(express.json());

    loadRoutes(app);

    return app;
}

export default createApp;