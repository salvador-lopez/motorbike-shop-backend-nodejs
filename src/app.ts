import express from 'express';
import {loadRoutes} from "./routes";
import {setupSwagger} from "./swagger";

const app = express();

setupSwagger(app);
loadRoutes(app)

export default app;