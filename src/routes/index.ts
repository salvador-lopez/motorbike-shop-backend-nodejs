import { Express } from "express";
import healthzRouter from "./healthz";
import customerRouter from "./customer";

export function loadRoutes(app: Express) {
    app.use("/api", healthzRouter);
    app.use("/api", customerRouter);
}