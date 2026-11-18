import type { Request, Response, NextFunction } from "express";
import * as workoutService from "../services/workout_services";

export const verifyApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const apiKey = req.query.api_key;
        const validKey = await workoutService.loadApi();

        if (!apiKey || apiKey !== validKey) {
            res.status(401).send({
                status: "FAILED",
                data: { error: "No autorizado: API Key incorrecta o faltante" }
            });
            return;
        }
        next();
    } catch (error: any) {
        res.status(500).send({
            status: "FAILED",
            data: { error: "Error al verificar API Key: " + error.message }
        });
    }
};
