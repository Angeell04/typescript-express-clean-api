import express from "express";
import type { Express } from "express";
import { env } from "./config/env";
import cors from "cors";
import { router1, router2, router3 } from "./v1/routes";
import { swaggerDocs as v1SwaggerDocs } from "./v1/swagger";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1/workout', router1);
app.use('/api/v1/records', router2);
app.use('/api/v1', router3);

app.listen(env.port, () => {
    console.log(`Servidor ejecutandose en el puerto (${env.port})`);
    v1SwaggerDocs(app, env.port);
});
