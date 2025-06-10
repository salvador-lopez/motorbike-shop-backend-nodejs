import { Express } from "express";
import { readdirSync } from "fs";
import { join } from "path";
import {DataSource} from "typeorm";

export function loadRoutes(app: Express,dataSource:DataSource) {
    const routesPath = join(__dirname);
    readdirSync(routesPath).forEach(async (file) => {
        if (file !== "index.ts" && file.endsWith(".ts") && !file.endsWith(".test.ts")) {
            const route = await import(`./${file}`);

            if (route.default?.constructor?.name === 'Router') {
                app.use("/api", route.default);
            } else if (typeof route.default === 'function') {
                if (route.default.length < 2) {
                    app.use("/api", route.default(dataSource));
                } else {
                    app.use("/api", route.default);
                }
            } else {
              throw new Error('Invalid route handler')
            }

        }
    });
}