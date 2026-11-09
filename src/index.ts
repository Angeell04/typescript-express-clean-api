import express from "express";
import type{Express, Request, Response} from "express";
import { env } from "./config/env";
import routes from "./v1/routes";
import apicache from "apicache";
import cors from "cors";


const app:Express = express();

app.use(cors())
app.use(express.json());
app.use('/api/v1/workout',routes);



app.listen(env.port, () => {
    console.log(`Servidor ejecutandose en el puerto (${env.port}))`)
})