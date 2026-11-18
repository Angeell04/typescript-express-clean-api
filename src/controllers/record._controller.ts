import type { Request, Response } from "express";
import * as recordServices from '../services/records_services';
import { WorkoutRecord } from "../types/workout-interface";

const getAllRecord = async (request: Request, response: Response): Promise<void> => {
    try {
        const { member } = request.query;
        let records: WorkoutRecord[] = await recordServices.getAllRecords();

        if (member != undefined && typeof member === 'string') {
            records = records.filter((record) => {
                if (typeof record.member === 'string') {
                    return record.member.toLowerCase().includes(member.toLowerCase());
                } else if (record.member && typeof record.member === 'object' && 'name' in record.member) {
                    return record.member.name.toLowerCase().includes(member.toLowerCase());
                }
                return false;
            });
        }

        response.send({ status: 'OK', data: records });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const getOneRecord = async (request: Request, response: Response): Promise<void> => {
    try {
        const id: string = request.params.id as string;
        const record = await recordServices.getOneRecord(id);
        if (!record) {
            response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
            return;
        }
        response.send({ status: 'OK', data: record });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const createOneRecord = async (request: Request, response: Response): Promise<void> => {
    try {
        const body: WorkoutRecord = request.body ?? {};
        if (
            !body.memberId ||
            !body.member ||
            !body.record ||
            !body.workout
        ) {
            response.status(400).send({ status: 'FAILED', data: { error: 'Faltan campos obligatorios' } });
            return;
        }

        const createdRecord = await recordServices.createOneRecord(body);
        response.status(201).send({ status: 'OK', data: createdRecord });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const updateOneRecord = async (request: Request, response: Response): Promise<void> => {
    try {
        const id: string = request.params.id as string;
        const body: WorkoutRecord = request.body ?? {};

        if (!id) {
            response.status(400).send({ status: 'FAILED', data: { error: 'ID de record no proporcionado' } });
            return;
        }
        if (body.id != null) {
            response.status(400).send({ status: 'FAILED', data: { error: 'No se puede modificar el id del record' } });
            return;
        }

        const updated = await recordServices.updateOneRecord(id, body);
        if (!updated) {
            response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
            return;
        }

        response.send({ status: 'OK', data: updated });
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const deleteOneRecord = async (request: Request, response: Response): Promise<void> => {
    try {
        const id: string = request.params.id as string;
        if (!id) {
            response.status(400).send({ status: 'FAILED', data: { error: 'ID de record no proporcionado' } });
            return;
        }

        const deleted = await recordServices.deleteOneRecord(id);
        if (!deleted) {
            response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
            return;
        }

        response.status(204).send();
    } catch (error: any) {
        response.status(500).send({ status: 'FAILED', data: { error: error.message } });
    }
};

const deleteOnerecord = deleteOneRecord;

export {
    deleteOneRecord,
    deleteOnerecord,
    updateOneRecord,
    getAllRecord,
    getOneRecord,
    createOneRecord
};
