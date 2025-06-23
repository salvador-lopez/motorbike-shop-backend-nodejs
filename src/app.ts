import "reflect-metadata";
import express from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";
import {registerCustomerDI} from "./di/customer.di";

const createApp = async () => {
    await registerCustomerDI()

    const app = express();

    setupSwagger(app);
    app.use(express.json());

    loadRoutes(app);

    return app;
}

export default createApp;