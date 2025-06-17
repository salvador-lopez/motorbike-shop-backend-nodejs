import { Express } from "express";
import {DataSource} from "typeorm";
import healthzRouter from "./healthz";
import customerRouter from "./customer";
import {CustomerCache} from "../services/cache/customer-cache";
import {AppCache} from "../app";

export function loadRoutes(app: Express,dataSource:DataSource,cache: AppCache) {
    app.use("/api", healthzRouter);
    app.use("/api", customerRouter(dataSource,cache.customerCache));
}