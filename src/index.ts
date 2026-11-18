import express from "express";
import type { Express } from "express";
import { env } from "./config/env";
import cors from "cors";
import { router1, router2, router3 } from "./v1/routes";
import { swaggerDocs as v1SwaggerDocs } from "./v1/swagger";
import { initDB } from "./database/init_db";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1/workout', router1);
app.use('/api/v1/records', router2);
app.use('/api/v1', router3);

const startServer = async (): Promise<void> => {
    try {
        console.log("Conectando con Microsoft SQL Server...");
        await initDB();
        console.log("Base de datos conectada e inicializada con exito.");

        app.listen(env.port, () => {
            console.log(`Servidor ejecutandose en el puerto (${env.port})`);
            v1SwaggerDocs(app, env.port);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor o conectar a la base de datos:", error);
    }
};

startServer();
