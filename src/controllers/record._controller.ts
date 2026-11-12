import type { Request, Response } from "express";
import * as recordServices from '../services/records_services';
import { WorkoutRecord } from "../types/workout-interface";

const getAllRecord = (request: Request, response: Response): void => {
    const { member } = request.query;
    let records: WorkoutRecord[] = recordServices.getAllRecords();

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
};

const getOneRecord = (request: Request, response: Response): void => {
    const id: string = request.params.id as string;
    const record = recordServices.getOneRecord(id);
    if (!record) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
        return;
    }
    response.send({ status: 'OK', data: record });
};

const createOneRecord = (request: Request, response: Response): void => {
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

    const createdRecord = recordServices.createOneRecord(body);
    response.status(201).send({ status: 'OK', data: createdRecord });
};

const updateOneRecord = (request: Request, response: Response): void => {
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

    const updated = recordServices.updateOneRecord(id, body);
    if (!updated) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
        return;
    }

    response.send({ status: 'OK', data: updated });
};

const deleteOneRecord = (request: Request, response: Response): void => {
    const id: string = request.params.id as string;
    if (!id) {
        response.status(400).send({ status: 'FAILED', data: { error: 'ID de record no proporcionado' } });
        return;
    }

    const deleted = recordServices.deleteOneRecord(id);
    if (!deleted) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
        return;
    }

    response.status(204).send();
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
