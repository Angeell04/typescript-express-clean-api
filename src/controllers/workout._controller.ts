import type { Request, Response } from "express";
import * as workoutServices from '../services/workout_services';
import { Workout } from "../types/workout-interface";

const getAllWorkout = async (request: Request, response: Response): Promise<void> => {
    try {
        const { mode, equipment, createdAt, limit } = request.query;
        let workouts: Workout[] = await workoutServices.getAllWorkout();

        if (mode != undefined && typeof mode === 'string') {
            workouts = workouts.filter((workout) => 
                workout.mode && workout.mode.toLowerCase().includes(mode.toLowerCase())
            );
        }

        if (equipment != undefined && typeof equipment === 'string') {
            workouts = workouts.filter((workout) => 
                workout.equipment && workout.equipment.some((eq) => eq.toLowerCase().includes(equipment.toLowerCase()))
            );
        }

        if (createdAt != undefined && typeof createdAt === 'string') {
            workouts = workouts.filter((workout) => 
                workout.createdAt && workout.createdAt.includes(createdAt)
            );
        }
        
        if (limit != undefined && !isNaN(Number(limit))) {
            workouts = workouts.slice(0, Number(limit));
        }

        response.send({ status: 'OK', data: workouts });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const getOneWorkout = async (request: Request, response: Response): Promise<void> => {
    try {
        const id: string = request.params.id as string;
        const workout = await workoutServices.getOneWorkout(id);
        if (!workout) {
            response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
            return;
        }
        response.send({ status: 'OK', data: workout });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const createOneWorkout = async (request: Request, response: Response): Promise<void> => {
    try {
        const body: Workout = request.body ?? {};
        if (
            !body.exercises ||
            !body.name ||
            !body.mode ||
            !body.equipment ||
            !body.trainerTips
        ) {
            response.status(400).send({ status: 'FAILED', data: { error: 'Faltan campos obligatorios' } });
            return;
        }

        const createdWorkout = await workoutServices.createOneWorkout(body);
        response.status(201).send({ status: 'OK', data: createdWorkout });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const updateOneWorkout = async (request: Request, response: Response): Promise<void> => {
    try {
        const id: string = request.params.id as string;
        const body: Workout = request.body ?? {};

        if (!id) {
            response.status(400).send({ status: 'FAILED', data: { error: 'ID de entrenamiento no proporcionado' } });
            return;
        }
        if (body.id != null || body.createdAt != null) {
            response.status(400).send({ status: 'FAILED', data: { error: 'No se puede modificar id ni fecha de creacion' } });
            return;
        }

        const updatedWorkout = await workoutServices.updateOneWorkout(id, body);
        if (!updatedWorkout) {
            response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
            return;
        }
        response.send({ status: 'OK', data: updatedWorkout });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const deleteOneWorkout = async (request: Request, response: Response): Promise<void> => {
    try {
        const id: string = request.params.id as string;
        if (!id) {
            response.status(400).send({ status: 'FAILED', data: { error: 'ID de entrenamiento no proporcionado' } });
            return;
        }
        const deleted = await workoutServices.deleteOneWorkout(id);
        if (!deleted) {
            response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
            return;
        }
        response.status(204).send();
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const getApiKey = async (_request: Request, response: Response): Promise<void> => {
    try {
        const api: string = await workoutServices.loadApi();
        response.send({ status: 'OK', data: api });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

export {
    getAllWorkout,
    getOneWorkout,
    createOneWorkout,
    updateOneWorkout,
    deleteOneWorkout,
    getApiKey
};
