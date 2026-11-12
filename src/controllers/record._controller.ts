import type { Request, Response } from "express";
import * as recordServices from '../services/records_services';
import { FiltrosRecord, WorkoutRecord } from "../types/workout-interface";

//records
const getAllRecord = (request: Request, response: Response) => {
    const { member } = request.query;
    let records: WorkoutRecord[] = recordServices.getAllRecords();
    let filtros: FiltrosRecord = { member } as FiltrosRecord;

    if (filtros.member != undefined && typeof filtros.member === 'string') {
        records = records.filter((record) => 
            typeof record.member === 'string' && 
            record.member.toLowerCase().includes(filtros.member.toLowerCase())
        );
    }

    response.send({ status: 'OK', data: records });
};

const getOneRecord = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    const record = recordServices.getOneRecord(id);
    if (!record) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
        return;
    }
    response.send({ status: 'OK', data: record });
};

const createOneRecord = (request: Request, response: Response) => {
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

const updateOneRecord = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    const body: WorkoutRecord = request.body ?? {};

    if (id == undefined) {
        response.status(400).send({ status: 'FAILED', data: { error: 'Record no actualizado' } });
        return;
    } else {
        if (body.id != null) {
            response.status(400).send({ status: 'FAILED', data: { error: 'No se puede modificar el id del record' } });
            return;
        }
    }

    const updateRecord = recordServices.updateOneRecord(id, body);
    if (!updateRecord) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Record no encontrado' } });
        return;
    }

    response.send({ status: 'OK', data: updateRecord });
};

const deleteOneRecord = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    if (id == undefined) {
        response.status(400).send({ status: 'FAILED', data: { error: 'Record no eliminado' } });
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
