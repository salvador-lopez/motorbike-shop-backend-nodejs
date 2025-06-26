import express from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";
import {scopePerRequest} from "awilix-express";
import {AwilixContainer} from "awilix";

const createApp = async (container: AwilixContainer) => {
    const app = express();

    app.use(scopePerRequest(container));

    setupSwagger(app);
    app.use(express.json());

    loadRoutes(app);

    return app;
}

export default createApp;