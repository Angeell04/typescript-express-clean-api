/**
 * @openapi
 * components:
 *   schemas:
 *     Workout:
 *       type: object
 *       description: Entidad completa de entrenamiento
 *       properties:
 *         id:
 *           type: string
 *           example: "61dbae02-c147-4e28-863c-db7bd402b2d6"
 *         name:
 *           type: string
 *           example: "Tommy V"
 *         mode:
 *           type: string
 *           example: "For Time"
 *         equipment:
 *           type: array
 *           items:
 *             type: string
 *           example: ["barbell", "rope"]
 *         exercises:
 *           type: array
 *           items:
 *             type: string
 *           example: ["21 thrusters", "12 rope climbs, 15 ft", "15 thrusters", "9 rope climbs"]
 *         createdAt:
 *           type: string
 *           example: "4/20/2022, 2:21:56 PM"
 *         updatedAt:
 *           type: string
 *           example: "4/20/2022, 2:21:56 PM"
 *         trainerTips:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Divide las repeticiones según necesidad", "Ritmo constante"]
 * 
 *     WorkoutInput:
 *       type: object
 *       required:
 *         - name
 *         - mode
 *         - equipment
 *         - exercises
 *         - trainerTips
 *       description: Datos requeridos para registrar un nuevo entrenamiento
 *       properties:
 *         name:
 *           type: string
 *           example: "Murph"
 *         mode:
 *           type: string
 *           example: "For Time"
 *         equipment:
 *           type: array
 *           items:
 *             type: string
 *           example: ["pull-up bar"]
 *         exercises:
 *           type: array
 *           items:
 *             type: string
 *           example: ["1 mile run", "100 pull-ups", "200 push-ups", "300 air squats", "1 mile run"]
 *         trainerTips:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Usar chaleco lastrado de 20lb si es posible"]
 * 
 *     WorkoutUpdate:
 *       type: object
 *       description: Campos modificables de un entrenamiento existente (no incluye id ni createdAt)
 *       properties:
 *         name:
 *           type: string
 *           example: "Tommy V Modificado"
 *         mode:
 *           type: string
 *           example: "AMRAP"
 *         equipment:
 *           type: array
 *           items:
 *             type: string
 *           example: ["barbell"]
 *         exercises:
 *           type: array
 *           items:
 *             type: string
 *           example: ["15 thrusters", "5 rope climbs"]
 *         trainerTips:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Descanso controlado"]
 * 
 *     WorkoutRecord:
 *       type: object
 *       description: Récord alcanzado por un miembro en un entrenamiento
 *       properties:
 *         id:
 *           type: string
 *           example: "22d997f7-b080-40a2-94b2-29aa455589a1"
 *         workout:
 *           type: string
 *           example: "61dbae02-c147-4e28-863c-db7bd402b2d6"
 *         record:
 *           type: string
 *           example: "160 reps"
 *         memberId:
 *           type: string
 *           example: "7cb4e756-2713-480e-a0e6-a88636f87570"
 *         member:
 *           type: string
 *           example: "Juan Pérez"
 * 
 *     WorkoutRecordInput:
 *       type: object
 *       required:
 *         - workout
 *         - record
 *         - memberId
 *         - member
 *       description: Datos necesarios para crear un nuevo récord
 *       properties:
 *         workout:
 *           type: string
 *           example: "61dbae02-c147-4e28-863c-db7bd402b2d6"
 *         record:
 *           type: string
 *           example: "160 reps"
 *         memberId:
 *           type: string
 *           example: "7cb4e756-2713-480e-a0e6-a88636f87570"
 *         member:
 *           type: string
 *           example: "Juan Pérez"
 * 
 *     Miembro:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "7cb4e756-2713-480e-a0e6-a88636f87570"
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         gender:
 *           type: string
 *           example: "male"
 *         dateOfBirth:
 *           type: string
 *           example: "1995-05-12"
 *         email:
 *           type: string
 *           example: "juan@example.com"
 * 
 *     ErrorResponse:
 *       type: object
 *       description: Formato unificado de error devuelto por la API
 *       properties:
 *         status:
 *           type: string
 *           example: "FAILED"
 *         data:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               example: "Mensaje explicativo del error"
 */

export interface Workout {
    id: string;
    name: string;
    mode: string;
    equipment: string[];
    exercises: string[];
    createdAt: string;
    updatedAt: string;
    trainerTips: string[];
}

export interface WorkoutRecord {
    id: string;
    workout: string;
    record: string;
    memberId?: string;
    member?: string | Miembro;
}

export interface Miembro {
    id: string;
    name: string;
    gender: string;
    dateOfBirth: string;
    email: string;
    password: string;
}

export interface Database {
    workouts: Workout[];
    member: Miembro[];
    records: WorkoutRecord[];
    api: string;
}

export interface Filtros {
    mode: string;
    equipment: string;
    createdAt: string;
    limit: string;
}

export interface FiltrosRecord {
    member: string;
}
