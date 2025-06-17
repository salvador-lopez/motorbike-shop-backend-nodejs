import { Express } from "express";
import {DataSource} from "typeorm";
import healthzRouter from "./healthz";
import customerRouter from "./customer";
import {CustomerCache} from "../services/cache/customer-cache";

export function loadRoutes(app: Express,dataSource:DataSource,customerCache: CustomerCache) {
    app.use("/api", healthzRouter);
    app.use("/api", customerRouter(dataSource,customerCache));
}