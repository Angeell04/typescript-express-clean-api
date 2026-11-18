import sql from "mssql";
import { env } from "../config/env";
import type { Workout, WorkoutRecord } from "../types/workout-interface";

export const initDB = async (): Promise<void> => {
    const masterPool = await new sql.ConnectionPool({
        ...env.db,
        database: "master"
    }).connect();

    await masterPool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${env.db.database}')
        BEGIN
            CREATE DATABASE [${env.db.database}];
        END
    `);
    await masterPool.close();

    const pool = await sql.connect(env.db);

    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Config')
        BEGIN
            CREATE TABLE Config (
                clave VARCHAR(50) PRIMARY KEY,
                valor NVARCHAR(255) NOT NULL
            );
        END;

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Workouts')
        BEGIN
            CREATE TABLE Workouts (
                id VARCHAR(50) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL,
                mode NVARCHAR(50) NOT NULL,
                equipment NVARCHAR(MAX) NOT NULL,
                exercises NVARCHAR(MAX) NOT NULL,
                createdAt NVARCHAR(50) NOT NULL,
                updatedAt NVARCHAR(50) NOT NULL,
                trainerTips NVARCHAR(MAX) NOT NULL
            );
        END;

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Members')
        BEGIN
            CREATE TABLE Members (
                id VARCHAR(50) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL,
                gender NVARCHAR(20) NOT NULL,
                dateOfBirth NVARCHAR(50) NOT NULL,
                email NVARCHAR(100) NOT NULL,
                password NVARCHAR(255) NOT NULL
            );
        END;

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Records')
        BEGIN
            CREATE TABLE Records (
                id VARCHAR(50) PRIMARY KEY,
                workout VARCHAR(50) NOT NULL,
                record NVARCHAR(50) NOT NULL,
                memberId VARCHAR(50) NULL,
                member NVARCHAR(100) NOT NULL
            );
        END;
    `);


    await seedData(pool);
};

const seedData = async (pool: sql.ConnectionPool): Promise<void> => {
    const configCheck = await pool.request().query("SELECT COUNT(*) AS total FROM Config");
    if (configCheck.recordset[0].total === 0) {
        await pool.request()
            .input("clave", "api")
            .input("valor", "angel")
            .query("INSERT INTO Config (clave, valor) VALUES (@clave, @valor)");
    }

    const workoutsCheck = await pool.request().query("SELECT COUNT(*) AS total FROM Workouts");
    if (workoutsCheck.recordset[0].total === 0) {
        const workouts: Workout[] = [
            {
                id: "61dbae02-c147-4e28-863c-db7bd402b2d6",
                name: "Tommy V",
                mode: "For Time",
                equipment: ["barbell", "rope"],
                exercises: ["21 thrusters", "12 rope climbs, 15 ft", "15 thrusters", "9 rope climbs, 15 ft", "9 thrusters", "6 rope climbs, 15 ft"],
                createdAt: "4/20/2022, 2:21:56 PM",
                updatedAt: "4/20/2022, 2:21:56 PM",
                trainerTips: ["Split the 21 thrusters as needed", "Try to do the 9 and 6 thrusters unbroken", "RX Weights: 115lb/75lb"]
            },
            {
                id: "4a3d9aaa-608c-49a7-a004-66305ad4ab50",
                name: "Dead Push-Ups",
                mode: "AMRAP 10",
                equipment: ["barbell"],
                exercises: ["15 deadlifts", "15 hand-release push-ups"],
                createdAt: "1/25/2022, 1:15:44 PM",
                updatedAt: "3/10/2022, 8:21:56 AM",
                trainerTips: ["Deadlifts are meant to be light", "Keep a steady pace"]
            },
            {
                id: "d8be2362-7b68-4ea4-a1f4-c86c1dc2dc5e",
                name: "Heavy DT",
                mode: "For Time",
                equipment: ["barbell", "rope"],
                exercises: ["12 deadlifts", "9 hang power cleans", "6 push jerks"],
                createdAt: "11/20/2021, 9:11:22 AM",
                updatedAt: "11/20/2021, 9:11:22 AM",
                trainerTips: ["Heavy DT: 5 rounds for time", "RX Weights: 205lb/145lb"]
            },
            {
                id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                name: "Murph",
                mode: "For Time",
                equipment: ["pull-up bar"],
                exercises: ["1 mile run", "100 pull-ups", "200 push-ups", "300 air squats", "1 mile run"],
                createdAt: "10/12/2023, 10:00:00 AM",
                updatedAt: "10/12/2023, 10:00:00 AM",
                trainerTips: ["Partition the reps as 5-10-15", "Hydrate well"]
            },
            {
                id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
                name: "Cindy",
                mode: "AMRAP 20",
                equipment: ["pull-up bar"],
                exercises: ["5 pull-ups", "10 push-ups", "15 air squats"],
                createdAt: "11/05/2023, 4:15:30 PM",
                updatedAt: "11/05/2023, 4:15:30 PM",
                trainerTips: ["Find a sustainable pace early", "Keep form tight"]
            },
            {
                id: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
                name: "Fran",
                mode: "For Time",
                equipment: ["barbell", "pull-up bar"],
                exercises: ["21-15-9 Thrusters (95lb)", "21-15-9 Pull-ups"],
                createdAt: "01/15/2024, 6:30:00 PM",
                updatedAt: "01/15/2024, 6:30:00 PM",
                trainerTips: ["High intensity sprint", "Breathe at the top"]
            }
        ];

        for (const w of workouts) {
            await pool.request()
                .input("id", w.id)
                .input("name", w.name)
                .input("mode", w.mode)
                .input("equipment", JSON.stringify(w.equipment))
                .input("exercises", JSON.stringify(w.exercises))
                .input("createdAt", w.createdAt)
                .input("updatedAt", w.updatedAt)
                .input("trainerTips", JSON.stringify(w.trainerTips))
                .query(`
                    INSERT INTO Workouts (id, name, mode, equipment, exercises, createdAt, updatedAt, trainerTips)
                    VALUES (@id, @name, @mode, @equipment, @exercises, @createdAt, @updatedAt, @trainerTips)
                `);
        }
    }

    const membersCheck = await pool.request().query("SELECT COUNT(*) AS total FROM Members");
    if (membersCheck.recordset[0].total === 0) {
        const members = [
            { id: "12a410bc-849f-4e7e-bfc8-4ef283ee4b19", name: "Jason Miller", gender: "male", dateOfBirth: "23/04/1990", email: "jason@mail.com", password: "fakehashparaejemplo" },
            { id: "2dd5a2d0-4fe3-4b2c-8a2a-5a5b8f0d6a11", name: "Lisa Jenkins", gender: "female", dateOfBirth: "09/12/1998", email: "lisa@mail.com", password: "fakehashparaejemplo" },
            { id: "7cb4e756-2713-480e-a0e6-a88636f87570", name: "Carlos Santana", gender: "male", dateOfBirth: "15/07/1993", email: "carlos@mail.com", password: "fakehashparaejemplo" },
            { id: "89e1a2f4-90ab-4cde-8123-ef456789abcd", name: "Elena Morales", gender: "female", dateOfBirth: "28/11/1995", email: "elena@mail.com", password: "fakehashparaejemplo" }
        ];

        for (const m of members) {
            await pool.request()
                .input("id", m.id)
                .input("name", m.name)
                .input("gender", m.gender)
                .input("dateOfBirth", m.dateOfBirth)
                .input("email", m.email)
                .input("password", m.password)
                .query(`
                    INSERT INTO Members (id, name, gender, dateOfBirth, email, password)
                    VALUES (@id, @name, @gender, @dateOfBirth, @email, @password)
                `);
        }
    }

    const recordsCheck = await pool.request().query("SELECT COUNT(*) AS total FROM Records");
    if (recordsCheck.recordset[0].total === 0) {
        const records: WorkoutRecord[] = [
            { id: "0d5e1c1d-6a2a-4f1c-9f9e-3b1d7c4e8f02", workout: "4a3d9aaa-608c-49a7-a004-66305ad4ab50", record: "230 reps", memberId: "2dd5a2d0-4fe3-4b2c-8a2a-5a5b8f0d6a11", member: "Marcos" },
            { id: "3f9c7b6e-1a4d-4c3e-8d2b-7e6a5f4c3b21", workout: "d8be2362-7b68-4ea4-a1f4-c86c1dc2dc5e", record: "13:45", memberId: "12a410bc-849f-4e7e-bfc8-4ef283ee4b19", member: "Mario" },
            { id: "c12a2335-85a5-4e02-b0f8-6cff988b5a9b", workout: "61dbae02-c147-4e28-863c-db7bd402b2d6", record: "160 reps", memberId: "12a410bc-849f-4e7e-bfc8-4ef283ee4b19", member: "Manuel" },
            { id: "31f536f7-b0e5-418d-b919-8904dd338901", workout: "61dbae02-c147-4e28-863c-db7bd402b2d6", record: "160 reps", memberId: "12a410bc-849f-4e7e-bfc8-4ef283ee4b19", member: "Guille" },
            { id: "44e2b8a1-55c3-49d2-a7f1-88e9d0c1b2a3", workout: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", record: "38:42", memberId: "7cb4e756-2713-480e-a0e6-a88636f87570", member: "Carlos Santana" },
            { id: "55f3c9b2-66d4-40e3-b8a2-99f0e1d2c3b4", workout: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e", record: "24 rounds", memberId: "89e1a2f4-90ab-4cde-8123-ef456789abcd", member: "Elena Morales" },
            { id: "66a4d0c3-77e5-41f4-c9b3-00a1f2e3d4c5", workout: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f", record: "3:15", memberId: "12a410bc-849f-4e7e-bfc8-4ef283ee4b19", member: "Jason Miller" }
        ];

        for (const r of records) {
            await pool.request()
                .input("id", r.id)
                .input("workout", r.workout)
                .input("record", r.record)
                .input("memberId", r.memberId ?? null)
                .input("member", typeof r.member === "string" ? r.member : (r.member as any)?.name ?? "")
                .query(`
                    INSERT INTO Records (id, workout, record, memberId, member)
                    VALUES (@id, @workout, @record, @memberId, @member)
                `);
        }
    }
};
