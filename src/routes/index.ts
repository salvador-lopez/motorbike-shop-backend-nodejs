import { Express } from "express";
import healthzRouter from "./healthz";
import customerRouter from "./customer";
import purchaseOrderRouter from "./purchase-order";

export function loadRoutes(app: Express) {
    app.use("/api", healthzRouter);
    app.use("/api", customerRouter);
    app.use("/api", purchaseOrderRouter)
}