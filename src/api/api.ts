import type { Request, Response, NextFunction } from "express";
import * as workoutService from "../services/workout_services";

export const verifyApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.query.api_key;
    const validKey = workoutService.loadApi();

    if (!apiKey || apiKey !== validKey) {
        res.status(401).send({
            status: "FAILED",
            data: { error: "No autorizado: API Key incorrecta o faltante" }
        });
        return;
    }
    next();
};
