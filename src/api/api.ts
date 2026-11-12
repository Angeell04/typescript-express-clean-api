import { Request, Response} from "express";
import * as workoutService from "../services/workout_services";

export const verifyApiKey = (req: Request, res: Response) => {
    const apiKey = req.query.api_key;
    const validKey = workoutService.loadApi();

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).send({
            status: "FAILED",
            data: { error: "No autorizado: API Key incorrecta o faltante" }
        });
    }
};
