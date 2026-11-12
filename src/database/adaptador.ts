import { readFileSync, writeFileSync } from 'fs';
import path from "node:path";
import type { Database, Workout, WorkoutRecord } from "../types/workout-interface";
import { toHttpError } from '../utils/http_error';

const DB_PATH: string = path.resolve(import.meta.dirname, "../../data/db.json");

export const loadDB = (): Database => {
    try {
        return JSON.parse(readFileSync(DB_PATH, "utf-8")) as Database;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const saveToDatabase = (db: Database): void => {
    try {
        writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    } catch (error) {
        throw toHttpError(error);
    }
};

export const createWorkout = (workout: Workout): boolean => {
    try {
        let dataBase: Database = loadDB();
        dataBase.workouts.push(workout);
        saveToDatabase(dataBase);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const loadWorkout = (id: string): Workout | undefined => {
    try {
        let dataBase: Database = loadDB();
        return dataBase.workouts.find((workout) => workout.id === id);
    } catch (error) {
        throw toHttpError(error);
    }
};

export const updateWorkout = (id: string, workout: Workout): boolean => {
    try {
        let dataBase: Database = loadDB();
        let updated = false;
        dataBase.workouts.forEach((work) => {
            if (work.id === id) {
                if (workout.name !== undefined) work.name = workout.name;
                if (workout.mode !== undefined) work.mode = workout.mode;
                if (workout.equipment !== undefined) work.equipment = workout.equipment;
                if (workout.exercises !== undefined) work.exercises = workout.exercises;
                if (workout.trainerTips !== undefined) work.trainerTips = workout.trainerTips;
                updated = true;
            }
        });
        if (!updated) {
            return false;
        }
        saveToDatabase(dataBase);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const deleteWorkout = (id: string): boolean => {
    try {
        let dataBase: Database = loadDB();
        const initialLength = dataBase.workouts.length;
        const workoutsActualizados = dataBase.workouts.filter(workout => workout.id !== id);
        if (workoutsActualizados.length === initialLength) {
            return false;
        }
        dataBase.workouts = workoutsActualizados;
        saveToDatabase(dataBase);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};

// records
export const loadRecord = (id: string): WorkoutRecord | undefined => {
    try {
        let datos: Database = loadDB();
        return datos.records.find((record) => record.id === id);
    } catch (error) {
        throw toHttpError(error);
    }
};

export const createRecord = (record: WorkoutRecord): boolean => {
    try {
        let dataBase: Database = loadDB();
        dataBase.records.push(record);
        saveToDatabase(dataBase);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const updateRecord = (id: string, record: WorkoutRecord): boolean => {
    try {
        let dataBase: Database = loadDB();
        let updated = false;
        dataBase.records.forEach((reco) => {
            if (reco.id === id) {
                if (record.member !== undefined) reco.member = record.member;
                if (record.record !== undefined) reco.record = record.record;
                if (record.memberId !== undefined) reco.memberId = record.memberId;
                if (record.workout !== undefined) reco.workout = record.workout;
                updated = true;
            }
        });
        if (!updated) {
            return false;
        }
        saveToDatabase(dataBase);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const deleteRecord = (id: string): boolean => {
    try {
        let dataBase: Database = loadDB();
        const initialLength = dataBase.records.length;
        const recordActualizados = dataBase.records.filter(record => record.id !== id);
        if (recordActualizados.length === initialLength) {
            return false;
        }
        dataBase.records = recordActualizados;
        saveToDatabase(dataBase);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};


export const traeApi = (): string => {
    try {
        return loadDB().api;
    } catch (error) {
        throw toHttpError(error);
    }
};

