import { createRecord, deleteRecord, loadDB, loadRecord, updateRecord } from "../database/adaptador";
import { WorkoutRecord } from "../types/workout-interface";
import { v4 as uuid } from 'uuid';
import { toHttpError } from "../utils/http_error";

const getAllRecords = async (): Promise<WorkoutRecord[]> => {
    try {
        const db = await loadDB();
        return db.records;
    } catch (error) {
        throw toHttpError(error);
    }
};

const getOneRecord = async (id: string): Promise<WorkoutRecord | undefined> => {
    try {
        return await loadRecord(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const createOneRecord = async (record: WorkoutRecord): Promise<WorkoutRecord> => {
    try {
        const id: string = uuid();
        record.id = id;
        await createRecord(record);
        return record;
    } catch (error) {
        throw toHttpError(error);
    }
};

const updateOneRecord = async (id: string, record: WorkoutRecord): Promise<WorkoutRecord | undefined> => {
    try {
        const updated = await updateRecord(id, record);
        if (!updated) return undefined;
        return await loadRecord(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const deleteOneRecord = async (id: string): Promise<boolean> => {
    try {
        return await deleteRecord(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

export {
    getAllRecords,
    getOneRecord,
    deleteOneRecord,
    updateOneRecord,
    createOneRecord
};
