import { createRecord, deleteRecord, loadDB, loadRecord, updateRecord } from "../database/adaptador";
import { WorkoutRecord } from "../types/workout-interface";
import { v4 as uuid } from 'uuid';
import { toHttpError } from "../utils/http_error";

const getAllRecords = (): WorkoutRecord[] => {
    try {
        return loadDB().records;
    } catch (error) {
        throw toHttpError(error);
    }
};

const getOneRecord = (id: string): WorkoutRecord | undefined => {
    try {
        return loadRecord(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const createOneRecord = (record: WorkoutRecord): WorkoutRecord => {
    try {
        const id: string = uuid();
        record.id = id;
        createRecord(record);
        return record;
    } catch (error) {
        throw toHttpError(error);
    }
};

const updateOneRecord = (id: string, record: WorkoutRecord): WorkoutRecord | undefined => {
    try {
        const updated = updateRecord(id, record);
        if (!updated) return undefined;
        return loadRecord(id);
    } catch (error) {
        throw toHttpError(error);
    }
};

const deleteOneRecord = (id: string): boolean => {
    try {
        return deleteRecord(id);
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
