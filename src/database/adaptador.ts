import { readFileSync, writeFileSync } from 'fs';
import path from "node:path";
import type { Database, Workout } from "../types/workout-interface";
import { toHttpError } from '../utils/http_error';

const DB_PATH: string = path.resolve(import.meta.dirname, "../../data/db.json");

export const loadDB = (): Database => JSON.parse(readFileSync(DB_PATH, "utf-8")) as Database;

export const saveToDatabase = (db: Database): void => {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
};

export const createWorkout = (workout: Workout): boolean => {
    try{
        let dataBase: Database = loadDB();
        dataBase.workouts.push(workout);
        saveToDatabase(dataBase);
        return true;
    }catch(error){
        throw toHttpError(error);
    }
    
};

export const loadWorkout = (id: string): Workout | undefined => {
    let dataBase: Database = loadDB();
    return dataBase.workouts.find((workout) => workout.id === id);
};

export const updateWorkout = (id: string, workout: Workout): boolean => {
    let dataBase: Database = loadDB();
    dataBase.workouts.map((work) => {
        if (work.id === id) {
            work.name = workout.name;
            work.mode = workout.mode;
            work.equipment = workout.equipment;
            work.exercises = workout.exercises;
            work.trainerTips = workout.trainerTips;
        }
    });
    saveToDatabase(dataBase);
    return true;
};

export const deleteWorkout = (id: string): boolean => {
    let dataBase: Database = loadDB();
    const workoutsActualizados = dataBase.workouts.filter(workout => workout.id !== id);
    dataBase.workouts = workoutsActualizados;
    saveToDatabase(dataBase);
    return true;
};
