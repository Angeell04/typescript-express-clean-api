import type { Request, Response } from "express";
import * as workoutServices from '../services/workout_services';
import { Filtros, Workout } from "../types/workout-interface";

const getAllWorkout = (request: Request, response: Response) => {
    const {mode} = request.query;
    const {equipment} = request.query;
    const {createdAt} = request.query;
    const {limit} = request.query;
    let workouts:Workout[] = workoutServices.getAllWorkout();
    let filtros:Filtros = {mode, equipment, createdAt, limit} as Filtros;

    if(filtros.mode != undefined) {
        workouts = workouts.filter((workout) => workout.mode.toLowerCase().includes(filtros.mode.toLowerCase()));
    }

    if(filtros.equipment != undefined) {
        workouts = workouts.filter((workout) => workout.equipment.includes(filtros.equipment.toLowerCase()));
    }

    if(filtros.createdAt != undefined) {
        workouts = workouts.filter((workout) => workout.createdAt.includes(filtros.createdAt));
    }
    
    if(filtros.limit != undefined) {
        workouts = workouts.slice(0, Number(filtros.limit));
    }

    response.send({ status: 'OK', data: workouts });
};

const getOneWorkout = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    const workout = workoutServices.getOneWorkout(id);
    if (!workout) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
        return;
    }
    response.send({ status: 'OK', data: workout });
};

const createOneWorkout = (request: Request, response: Response) => {
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

const updateOneWorkout = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    const body: Workout = request.body;

    if (id == undefined) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no actualizado' } });
        return;
    }else{
        if(body.id != null || body.createdAt != null){
            response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no actualizado' } });
            return;
        }
    }
    const updatedWorkout = workoutServices.updateOneWorkout(id, body);
    response.send({ status: 'OK', data: updatedWorkout });
};

const deleteOneWorkout = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    if (id == undefined) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no eliminado' } });
        return;
    }
    workoutServices.deleteOneWorkout(id);
    response.status(204).send({ status: 'OK' });
};

const getApiKey = (request: Request, response: Response) => {
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
