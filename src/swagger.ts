import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Motorbike Shop Backend API",
            version: "1.0.0",
        },
        servers: [
            {
                url: "/api",
                description: "Base API path",
            },
        ],
    },
    apis: ["./src/routes/*.ts"], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}