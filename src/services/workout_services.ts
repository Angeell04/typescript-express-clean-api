import { createWorkout, deleteWorkout, loadDB, loadWorkout, updateWorkout, traeApi } from "../database/adaptador";
import { Workout } from "../types/workout-interface";
import { v4 as uuid } from 'uuid';
import { toHttpError } from "../utils/http_error";

const getAllWorkout = async (): Promise<Workout[]> => {
    try {
        const db = await loadDB();
        return db.workouts;
    } catch (error) {
        throw toHttpError(error);
    }
};

const getOneWorkout = async (id: string): Promise<Workout | undefined> => {
    try {
        return await loadWorkout(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const createOneWorkout = async (workout: Workout): Promise<Workout> => {
    try {
        const id: string = uuid();
        const fechaCreacion = new Date().toISOString();
        const fechaActualizacion = new Date().toISOString();
        
        workout.id = id;
        workout.createdAt = fechaCreacion;
        workout.updatedAt = fechaActualizacion;
        
        await createWorkout(workout);
        return workout;
    } catch (error) {
        throw toHttpError(error);
    }
};

const updateOneWorkout = async (id: string, workout: Workout): Promise<Workout | undefined> => {
    try {
        const updated = await updateWorkout(id, workout);
        if (!updated) return undefined;
        return await loadWorkout(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const deleteOneWorkout = async (id: string): Promise<boolean> => {
    try {
        return await deleteWorkout(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const loadApi = async (): Promise<string> => {
    try {
        return await traeApi();
    } catch (error) {
        throw toHttpError(error);
    }
};

export {
    getAllWorkout,
    getOneWorkout,
    createOneWorkout,
    updateOneWorkout,
    deleteOneWorkout,
    loadApi
};
