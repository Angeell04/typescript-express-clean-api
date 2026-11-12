import type { Request, Response } from "express";
import * as workoutServices from '../services/workout_services';
import { Filtros, Workout } from "../types/workout-interface";

const getAllWorkout = (request: Request, response: Response): void => {
    const { mode, equipment, createdAt, limit } = request.query;
    let workouts: Workout[] = workoutServices.getAllWorkout();

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
};

const getOneWorkout = (request: Request, response: Response): void => {
    const id: string = request.params.id as string;
    const workout = workoutServices.getOneWorkout(id);
    if (!workout) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
        return;
    }
    response.send({ status: 'OK', data: workout });
};

const createOneWorkout = (request: Request, response: Response): void => {
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

    const createdWorkout = workoutServices.createOneWorkout(body);
    response.status(201).send({ status: 'OK', data: createdWorkout });
};

const updateOneWorkout = (request: Request, response: Response): void => {
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

    const updatedWorkout = workoutServices.updateOneWorkout(id, body);
    if (!updatedWorkout) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
        return;
    }
    response.send({ status: 'OK', data: updatedWorkout });
};

const deleteOneWorkout = (request: Request, response: Response): void => {
    const id: string = request.params.id as string;
    if (!id) {
        response.status(400).send({ status: 'FAILED', data: { error: 'ID de entrenamiento no proporcionado' } });
        return;
    }
    const deleted = workoutServices.deleteOneWorkout(id);
    if (!deleted) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
        return;
    }
    response.status(204).send();
};

const getApiKey = (_request: Request, response: Response): void => {
    const api: string = workoutServices.loadApi();
    response.send({ status: 'OK', data: api });
};

export {
    getAllWorkout,
    getOneWorkout,
    createOneWorkout,
    updateOneWorkout,
    deleteOneWorkout,
    getApiKey
};
