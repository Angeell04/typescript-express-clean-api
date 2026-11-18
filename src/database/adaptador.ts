import sql from "mssql";
import { env } from "../config/env";
import type { Database, Workout, WorkoutRecord } from "../types/workout-interface";
import { toHttpError } from '../utils/http_error';

const getConnection = async () => {
    return await sql.connect(env.db);
};


export const loadDB = async (): Promise<Database> => {
    try {
        const pool = await getConnection();
        const workoutsRes = await pool.request().query("SELECT * FROM Workouts");
        const recordsRes = await pool.request().query("SELECT * FROM Records");
        const membersRes = await pool.request().query("SELECT * FROM Members");
        const configRes = await pool.request().query("SELECT valor FROM Config WHERE clave = 'api'");

        const workouts: Workout[] = workoutsRes.recordset.map((row) => ({
            ...row,
            equipment: JSON.parse(row.equipment),
            exercises: JSON.parse(row.exercises),
            trainerTips: JSON.parse(row.trainerTips)
        }));

        return {
            api: configRes.recordset[0]?.valor || "angel",
            workouts,
            member: membersRes.recordset,
            records: recordsRes.recordset
        };
    } catch (error) {
        throw toHttpError(error);
    }
};

export const loadWorkout = async (id: string): Promise<Workout | undefined> => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", id)
            .query("SELECT * FROM Workouts WHERE id = @id");

        if (result.recordset.length === 0) return undefined;

        const row = result.recordset[0];
        return {
            ...row,
            equipment: JSON.parse(row.equipment),
            exercises: JSON.parse(row.exercises),
            trainerTips: JSON.parse(row.trainerTips)
        };
    } catch (error) {
        throw toHttpError(error);
    }
};

export const createWorkout = async (workout: Workout): Promise<boolean> => {
    try {
        const pool = await getConnection();
        await pool.request()
            .input("id", workout.id)
            .input("name", workout.name)
            .input("mode", workout.mode)
            .input("equipment", JSON.stringify(workout.equipment))
            .input("exercises", JSON.stringify(workout.exercises))
            .input("createdAt", workout.createdAt)
            .input("updatedAt", workout.updatedAt)
            .input("trainerTips", JSON.stringify(workout.trainerTips))
            .query(`
                INSERT INTO Workouts (id, name, mode, equipment, exercises, createdAt, updatedAt, trainerTips)
                VALUES (@id, @name, @mode, @equipment, @exercises, @createdAt, @updatedAt, @trainerTips)
            `);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const updateWorkout = async (id: string, workout: Workout): Promise<boolean> => {
    try {
        const current = await loadWorkout(id);
        if (!current) return false;

        const pool = await getConnection();
        const result = await pool.request()
            .input("id", id)
            .input("name", workout.name ?? current.name)
            .input("mode", workout.mode ?? current.mode)
            .input("equipment", JSON.stringify(workout.equipment ?? current.equipment))
            .input("exercises", JSON.stringify(workout.exercises ?? current.exercises))
            .input("updatedAt", new Date().toISOString())
            .input("trainerTips", JSON.stringify(workout.trainerTips ?? current.trainerTips))
            .query(`
                UPDATE Workouts 
                SET name = @name, mode = @mode, equipment = @equipment, exercises = @exercises,
                    updatedAt = @updatedAt, trainerTips = @trainerTips
                WHERE id = @id
            `);

        return (result.rowsAffected[0] ?? 0) > 0;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const deleteWorkout = async (id: string): Promise<boolean> => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", id)
            .query("DELETE FROM Workouts WHERE id = @id");

        return (result.rowsAffected[0] ?? 0) > 0;
    } catch (error) {
        throw toHttpError(error);
    }
};


export const loadRecord = async (id: string): Promise<WorkoutRecord | undefined> => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", id)
            .query("SELECT * FROM Records WHERE id = @id");

        if (result.recordset.length === 0) return undefined;
        return result.recordset[0];
    } catch (error) {
        throw toHttpError(error);
    }
};

export const createRecord = async (record: WorkoutRecord): Promise<boolean> => {
    try {
        const pool = await getConnection();
        const memberStr = typeof record.member === "string" ? record.member : (record.member as any)?.name ?? "";

        await pool.request()
            .input("id", record.id)
            .input("workout", record.workout)
            .input("record", record.record)
            .input("memberId", record.memberId ?? null)
            .input("member", memberStr)
            .query(`
                INSERT INTO Records (id, workout, record, memberId, member)
                VALUES (@id, @workout, @record, @memberId, @member)
            `);
        return true;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const updateRecord = async (id: string, record: WorkoutRecord): Promise<boolean> => {
    try {
        const current = await loadRecord(id);
        if (!current) return false;

        const pool = await getConnection();
        const memberStr = record.member 
            ? (typeof record.member === "string" ? record.member : (record.member as any)?.name ?? "")
            : current.member;

        const result = await pool.request()
            .input("id", id)
            .input("workout", record.workout ?? current.workout)
            .input("record", record.record ?? current.record)
            .input("memberId", record.memberId ?? current.memberId ?? null)
            .input("member", memberStr)
            .query(`
                UPDATE Records
                SET workout = @workout, record = @record, memberId = @memberId, member = @member
                WHERE id = @id
            `);

        return (result.rowsAffected[0] ?? 0) > 0;
    } catch (error) {
        throw toHttpError(error);
    }
};

export const deleteRecord = async (id: string): Promise<boolean> => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("id", id)
            .query("DELETE FROM Records WHERE id = @id");

        return (result.rowsAffected[0] ?? 0) > 0;
    } catch (error) {
        throw toHttpError(error);
    }
};



export const traeApi = async (): Promise<string> => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query("SELECT valor FROM Config WHERE clave = 'api'");

        return result.recordset[0]?.valor || "angel";
    } catch (error) {
        throw toHttpError(error);
    }
};
