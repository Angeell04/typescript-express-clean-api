import { createWorkout, deleteWorkout, loadDB, loadWorkout, updateWorkout, traeApi } from "../database/adaptador";
import { Workout } from "../types/workout-interface";
import { v4 as uuid } from 'uuid';
import { toHttpError } from "../utils/http_error";

const getAllWorkout = (): Workout[] => {
    return loadDB().workouts;
};

const getOneWorkout = (id: string): Workout | undefined => {
    try {
        return loadWorkout(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const createOneWorkout = (workout: Workout): Workout => {
    try {
        const id: string = uuid();
        const fechaCreacion = new Date().toISOString();
        const fechaActualizacion = new Date().toISOString();
        
        workout.id = id;
        workout.createdAt = fechaCreacion;
        workout.updatedAt = fechaActualizacion;
        
        createWorkout(workout);
        return workout;
    } catch (error) {
        throw toHttpError(error);
    }
};

const updateOneWorkout = (id: string, workout: Workout): Workout | undefined => {
    try {
        const updated = updateWorkout(id, workout);
        if (!updated) return undefined;
        return loadWorkout(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const deleteOneWorkout = (id: string): boolean => {
    try {
        return deleteWorkout(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const loadApi = (): string => {
    try {
        return traeApi();
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
