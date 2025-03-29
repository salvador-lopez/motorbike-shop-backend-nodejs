import { Express } from "express";
import { readdirSync } from "fs";
import { join } from "path";

export function loadRoutes(app: Express) {
    const routesPath = join(__dirname);
    readdirSync(routesPath).forEach(async (file) => {
        if (file !== "index.ts" && file.endsWith(".ts")) {
            const route = await import(`./${file}`);
            app.use("/api", route.default);
        }
    });
}