import { Express } from "express";
import {DataSource} from "typeorm";
import healthzRouter from "./healthz";
import customerRouter from "./customer";

export function loadRoutes(app: Express,dataSource:DataSource) {
    app.use("/api", healthzRouter);
    app.use("/api", customerRouter(dataSource));
}