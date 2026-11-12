import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express, Request, Response } from "express";

// Metadatos y opciones de configuración de OpenAPI 3.0
const options: swaggerJSDoc.OAS3Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ApiRestGym API - Documentación Oficial",
            version: "1.0.0",
            description: "API REST para la gestión de entrenamientos (Workouts), récords y miembros del gimnasio. Desarrollada con Express y TypeScript.",
            contact: {
                name: "Equipo de Desarrollo DAM",
            },
        },
        servers: [
            {
                url: "https://typescript-express-clean-api-1.onrender.com",
                description: "Servidor de Producción (Render)",
            },
            {
                url: "http://localhost:8001",
                description: "Servidor Local de Desarrollo (Puerto .env)",
            },
            {
                url: "http://localhost:3002",
                description: "Servidor Local de Respaldo",
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "query",
                    name: "api_key",
                    description: "Clave de API necesaria para consultar los endpoints protegidos. Obtén la tuya en /api/v1",
                },
            },
        },
    },
    // Ficheros donde swagger-jsdoc buscará bloques @openapi
    apis: [
        "./src/v1/routes/*.ts",
        "./src/types/*.ts"
    ],
};

// Generación de la especificación en formato JSON
const swaggerSpec = swaggerJSDoc(options);

/**
 * Función para inicializar Swagger UI y el endpoint JSON de la documentación
 * @param app Instancia de la aplicación Express
 * @param port Puerto en el que escucha el servidor
 */
export const swaggerDocs = (app: Express, port: number | string): void => {
    // Interfaz visual HTML de Swagger UI
    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Endpoint para obtener la especificación en formato JSON puro
    app.get("/api/v1/docs.json", (_req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`📓 [Swagger] Documentación v1 disponible en: http://localhost:${port}/api/v1/docs`);
    console.log(`📄 [Swagger] Especificación JSON en: http://localhost:${port}/api/v1/docs.json`);
};
