import { Express } from "express";
import healthzRouter from "./healthz";
import customerRouter from "./customer";
import customerTrpcRouter from "./customer.trpc"

export function loadRoutes(app: Express) {

    // REST
    app.use("/api", healthzRouter);
    app.use("/api", customerRouter);

    // tRPC
    app.use("/trpc", customerTrpcRouter);

}