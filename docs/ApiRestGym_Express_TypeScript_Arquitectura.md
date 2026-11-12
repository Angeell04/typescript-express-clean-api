# ApiRestGym - API REST con Express y TypeScript (En Proceso)

> **Estado:** 🟡 **En desarrollo / En proceso**  
> **Fecha:** 26/10/2026  
> **Tecnologías:** Node.js, Express, TypeScript, TSX, UUID, FS (persistencia en JSON local).

---

## 1. Visión General del Proyecto

`ApiRestGym` es una API REST construida con Express y TypeScript para la gestión de entrenamientos de gimnasio (*workouts*). La persistencia de datos se realiza de forma local mediante un fichero JSON simulando una base de datos (`db.json`).

### Arquitectura en 3 Capas
1. **Rutas (`src/v1/routes/index.ts`)**: Define los endpoints HTTP de la versión 1 y mapea cada verbo (`GET`, `POST`, `PATCH`, `DELETE`) a su respectivo controlador.
2. **Controladores (`src/controllers/workout._controller.ts`)**: Gestiona las solicitudes y respuestas HTTP (`req`, `res`), valida parámetros y datos de entrada, y envía los códigos de estado apropiados (200, 201, 204, 400, 404).
3. **Servicios (`src/services/workout_services.ts`)**: Contiene la lógica de negocio (generación de UUID, timestamps de creación y actualización) e interactúa con la capa de datos.
4. **Adaptador / Base de Datos (`src/database/adaptador.ts`)**: Encargado de leer (`fs.readFileSync`) y escribir (`fs.writeFileSync`) en el archivo `db.json`.

---

## 2. Estructura de Ficheros

```text
ApiRestGym/
├── data/
│   └── db.json                         # Base de datos simulada en JSON
├── src/
│   ├── api/
│   │   └── api.ts                      # Middleware de validación de API Key
│   ├── config/
│   │   ├── .env                        # Variables de entorno (PORT=8001)
│   │   └── env.ts                      # Configuración tipada del entorno
│   ├── controllers/
│   │   ├── record._controller.ts       # Manejadores HTTP para récords
│   │   └── workout._controller.ts      # Manejadores HTTP para entrenamientos y API Key
│   ├── database/
│   │   └── adaptador.ts                # Operaciones de lectura/escritura en db.json
│   ├── services/
│   │   ├── records_services.ts         # Lógica de negocio de récords
│   │   └── workout_services.ts         # Lógica de negocio de entrenamientos
│   ├── types/
│   │   └── workout-interface.ts        # Interfaces TypeScript y esquemas OpenAPI
│   ├── utils/
│   │   └── http_error.ts               # Manejo tipado de errores HTTP
│   ├── v1/
│   │   ├── routes/
│   │   │   └── index.ts                # Router Express v1 con anotaciones @openapi
│   │   └── swagger.ts                  # Configuración y servidor de Swagger UI (OpenAPI 3.0)
│   └── index.ts                        # Punto de entrada de la aplicación
├── package.json
└── tsconfig.json
```

---

## 3. Modelos de Datos (`workout-interface.ts`)

```typescript
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
    member?: Miembro;
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
}
```

---

## 4. Endpoints y Operaciones CRUD

Base URL: `http://localhost:3002/api/v1/workout`

| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Devuelve la lista de todos los entrenamientos | `200 OK` |
| `GET` | `/:id` | Devuelve un entrenamiento específico por ID | `200 OK` / `404 Not Found` |
| `POST` | `/` | Crea un nuevo entrenamiento | `201 Created` / `400 Bad Request` |
| `PATCH` | `/:id` | Actualiza un entrenamiento existente | `200 OK` |
| `DELETE` | `/:id` | Elimina un entrenamiento por ID | `204 No Content` |

---

## 5. Implementación del Código

### A. Controlador (`src/controllers/workout._controller.ts`)
```typescript
import type { Request, Response } from "express";
import * as workoutServices from '../services/workout_services';
import { Workout } from "../types/workout-interface";

const getAllWorkout = (request: Request, response: Response) => {
    const allWorkouts = workoutServices.getAllWorkout();
    response.send({ status: 'OK', data: allWorkouts });
};

const getOneWorkout = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    const workout = workoutServices.getOneWorkout(id);
    if (!workout) {
        response.status(404).send({ status: 'FAILED', data: { error: 'Entrenamiento no encontrado' } });
        return;
    }
    response.send({ status: 'OK', data: workout });
};

const createOneWorkout = (request: Request, response: Response) => {
    const body: Workout = request.body ?? {};
    if (
        !body.exercises ||
        !body.name ||
        !body.mode ||
        !body.equipment ||
        !body.trainerTips
    ) {
        response.status(400).send({ status: 'FAILED', data: { error: 'Faltan campos obligatorios' } });
        return;
    }

    const createdWorkout = workoutServices.createOneWorkout(body);
    response.status(201).send({ status: 'OK', data: createdWorkout });
};

const updateOneWorkout = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    const body: Workout = request.body;

    const updatedWorkout = workoutServices.updateOneWorkout(id, body);
    response.send({ status: 'OK', data: updatedWorkout });
};

const deleteOneWorkout = (request: Request, response: Response) => {
    const id: string = request.params.id as string;
    workoutServices.deleteOneWorkout(id);
    response.status(204).send({ status: 'OK' });
};

export {
    getAllWorkout,
    getOneWorkout,
    createOneWorkout,
    updateOneWorkout,
    deleteOneWorkout
};
```

### B. Servicio (`src/services/workout_services.ts`)
```typescript
import { createWorkout, loadDB, loadWorkout, updateWorkout, deleteWorkout } from "../database/adaptador";
import { Workout } from "../types/workout-interface";
import { v4 as uuid } from 'uuid';

const getAllWorkout = (): Workout[] => {
    return loadDB().workouts;
};

const getOneWorkout = (id: string) => {
    return loadWorkout(id);
};

const createOneWorkout = (workout: Workout) => {
    const id: string = uuid();
    const fechaCreacion = new Date().toISOString();
    const fechaActualizacion = new Date().toISOString();
    
    workout.id = id;
    workout.createdAt = fechaCreacion;
    workout.updatedAt = fechaActualizacion;
    
    createWorkout(workout);
    return workout;
};

const updateOneWorkout = (id: string, workout: Workout) => {
    updateWorkout(id, workout);
    return true;
};

const deleteOneWorkout = (id: string) => {
    deleteWorkout(id);
};

export {
    getAllWorkout,
    getOneWorkout,
    createOneWorkout,
    updateOneWorkout,
    deleteOneWorkout
};
```

### C. Persistencia (`src/database/adaptador.ts`)
```typescript
import { readFileSync, writeFileSync } from 'fs';
import path from "node:path";
import type { Database, Workout } from "../types/workout-interface";

const DB_PATH: string = path.resolve(import.meta.dirname, "../../data/db.json");

export const loadDB = (): Database => JSON.parse(readFileSync(DB_PATH, "utf-8")) as Database;

export const saveToDatabase = (db: Database): void => {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
};

export const createWorkout = (workout: Workout): boolean => {
    let dataBase: Database = loadDB();
    dataBase.workouts.push(workout);
    saveToDatabase(dataBase);
    return true;
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
```

---

## 6. Errores y Puntos Clave Aprendidos Hoy

1. **`ERR_INVALID_ARG_TYPE` al pasar funciones a `res.send()`**:
   * *Causa:* Se pasó `response.send(workoutServices.getAllWorkout)` sin paréntesis en lugar de invocar la función `getAllWorkout()`.
2. **`ERR_HTTP_HEADERS_SENT` por múltiples respuestas**:
   * *Causa:* En `createOneWorkout` se llamaba a `response.send()` dos veces seguidas en la misma petición.
3. **Peticiones colgadas por `return` sin respuesta**:
   * *Causa:* Si fallaba la validación de campos obligatorios en el `POST`, se ejecutaba `return;` sin enviar código de error `400`, dejando al cliente esperando indefinidamente.
4. **Lectura errónea de parámetros en URL**:
   * *Causa:* `request.params.id[0]` tomaba el primer carácter del identificador en lugar del string completo.
5. **Inconsistencia tipográfica `equipment` vs `equipament`**:
   * *Causa:* En `db.json` y el body de Postman venía `equipment` (inglés), mientras que en el código se validaba `equipament` (con 'a'), provocando que el validador creyera que faltaba el campo.
6. **Manejo de colecciones para eliminar**:
   * *Concepto:* Uso de `filter()` para exclusión funcional sin mutar el array original directamente, o `findIndex()` + `splice()` para mutación in situ.

---

## 7. Próximos Pasos (Pendiente de Implementar)
- [x] Completar la respuesta de `updateOneWorkout` para devolver el objeto modificado con su `updatedAt` actualizado.
- [x] Validar en `deleteWorkout` y `updateWorkout` si el ID existe antes de retornar éxito (o devolver 404).
- [x] Implementar los endpoints y servicios para `records` y autenticación por API Key.
- [x] Diseñar la especificación y tarea de Swagger (`swagger-ui-express` y `swagger-jsdoc`) detallada en la Sección 8.
- [ ] Integrar seguridad completa con `helmet` y validación estricta de esquemas de entrada.

---

## 8. Documentación con Swagger / OpenAPI 3.0 (Guía de Implementación para Agentes de IA)

> **Referencia de clase:** Proyecto en ZIP (`APIREST_NodeJS_2.zip`).  
> **Proyecto destino:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src`  
> **Diferencia técnica:** El ejemplo del profesor está en **JavaScript CommonJS (`require`)**, mientras que nuestro proyecto está en **TypeScript con ES Modules (`import`/`export`)** y se ejecuta con `tsx`.

---

### 8.1. Prompt Maestro para Agentes de IA

Si asignas esta tarea a un agente autónomo de IA (Cursor, Antigravity, Claude Code, Gemini CLI, etc.), pásale el siguiente bloque de instrucciones:

```text
Eres un desarrollador experto en TypeScript, Node.js y OpenAPI / Swagger.
Tu objetivo es implementar la documentación completa con Swagger en el proyecto ubicado en:
C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym

Debes seguir estrictamente las siguientes reglas:
1. El proyecto usa TypeScript con módulos ESM ("type": "module" en package.json) y se ejecuta con tsx. Usa siempre sintaxis `import ... from ...` y tipado estricto.
2. Crea el fichero `src/v1/swagger.ts` exportando la función `swaggerDocs(app: Express, port: number | string)`.
3. En `src/v1/swagger.ts`, configura la definición OpenAPI 3.0, el esquema de seguridad `ApiKeyAuth` (query param `api_key`) y la propiedad `apis` apuntando a `["./src/v1/routes/*.ts", "./src/types/*.ts"]`.
4. En `src/index.ts`, importa `swaggerDocs` y ejecútala al iniciar el servidor en `app.listen()`.
5. En `src/types/workout-interface.ts`, añade las anotaciones JSDoc `@openapi components schemas` para:
   - `Workout`
   - `WorkoutInput` (para POST)
   - `WorkoutUpdate` (para PATCH)
   - `WorkoutRecord`
   - `WorkoutRecordInput` (para POST)
   - `Miembro`
   - `ErrorResponse`
6. En `src/v1/routes/index.ts`, documenta con `@openapi` TODOS los endpoints de las rutas:
   - `/api/v1/workout` (GET con filtros, POST)
   - `/api/v1/workout/{id}` (GET, PATCH, DELETE)
   - `/api/v1/records` (GET con filtros, POST)
   - `/api/v1/records/{id}` (GET, PATCH, DELETE)
   - `/api/v1` (GET api key)
7. Verifica que no haya errores de compilación de TypeScript y que la documentación cargue correctamente en `http://localhost:8001/api/v1/docs` (o puerto de .env).
```

---

### 8.2. Checklist de Ejecución

- [ ] **Paso 1:** Crear `src/v1/swagger.ts` con tipado TypeScript y ESM.
- [ ] **Paso 2:** Registrar `swaggerDocs` en `src/index.ts`.
- [ ] **Paso 3:** Documentar esquemas de datos en `src/types/workout-interface.ts`.
- [ ] **Paso 4:** Documentar todas las rutas en `src/v1/routes/index.ts`.
- [ ] **Paso 5:** Probar con `npm run dev` y validar en navegador (`/api/v1/docs` y `/api/v1/docs.json`).

---

### 8.3. Desglose Fichero por Fichero

#### Fichero 1: `src/v1/swagger.ts` (NUEVO FICHERO)
* **Ruta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\v1\swagger.ts`
* **Propósito:** Configurar `swagger-jsdoc`, inicializar `swagger-ui-express` y exponer las rutas `/api/v1/docs` y `/api/v1/docs.json`.
* **Código a escribir:**

```typescript
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express, Request, Response } from "express";

// Metadatos y opciones de configuración de OpenAPI 3.0
const options: swaggerJSDoc.OAS3Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ApiRestGym API - Documentación Oficial",
            version: "1.0.0",
            description: "API REST para la gestión de entrenamientos (Workouts), récords y miembros del gimnasio. Desarrollada con Express y TypeScript.",
            contact: {
                name: "Equipo de Desarrollo DAM",
            },
        },
        servers: [
            {
                url: "http://localhost:8001",
                description: "Servidor Local de Desarrollo (Puerto .env)",
            },
            {
                url: "http://localhost:3002",
                description: "Servidor Local de Respaldo",
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "query",
                    name: "api_key",
                    description: "Clave de API necesaria para consultar los endpoints protegidos. Obtén la tuya en /api/v1",
                },
            },
        },
    },
    // Ficheros donde swagger-jsdoc buscará bloques @openapi
    apis: [
        "./src/v1/routes/*.ts",
        "./src/types/*.ts"
    ],
};

// Generación de la especificación en formato JSON
const swaggerSpec = swaggerJSDoc(options);

/**
 * Función para inicializar Swagger UI y el endpoint JSON de la documentación
 * @param app Instancia de la aplicación Express
 * @param port Puerto en el que escucha el servidor
 */
export const swaggerDocs = (app: Express, port: number | string): void => {
    // Interfaz visual HTML de Swagger UI
    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Endpoint para obtener la especificación en formato JSON puro
    app.get("/api/v1/docs.json", (_req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`📓 [Swagger] Documentación v1 disponible en: http://localhost:${port}/api/v1/docs`);
    console.log(`📄 [Swagger] Especificación JSON en: http://localhost:${port}/api/v1/docs.json`);
};
```

---

#### Fichero 2: `src/index.ts` (MODIFICACIÓN)
* **Ruta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\index.ts`
* **Propósito:** Importar `swaggerDocs` y llamarla en el callback del `app.listen()`.
* **Código resultante:**

```typescript
import express from "express";
import type { Express } from "express";
import { env } from "./config/env";
import cors from "cors";
import { router1, router2, router3 } from "./v1/routes";
import { swaggerDocs as v1SwaggerDocs } from "./v1/swagger"; // <-- IMPORTACIÓN SWAGGER

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1/workout', router1);
app.use('/api/v1/records', router2);
app.use('/api/v1', router3);

app.listen(env.port, () => {
    console.log(`Servidor ejecutandose en el puerto (${env.port})`);
    v1SwaggerDocs(app, env.port); // <-- INICIALIZACIÓN SWAGGER
});
```

---

#### Fichero 3: `src/types/workout-interface.ts` (MODIFICACIÓN)
* **Ruta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\types\workout-interface.ts`
* **Propósito:** Añadir esquemas reutilizables en `components.schemas` mediante comentarios `@openapi` para que la UI de Swagger muestre modelos y payloads válidos.
* **Código resultante:**

```typescript
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
```

---

#### Fichero 4: `src/v1/routes/index.ts` (MODIFICACIÓN)
* **Ruta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\v1\routes\index.ts`
* **Propósito:** Documentar con OpenAPI todos los endpoints de `router1` (workouts), `router2` (records) y `router3` (API key).
* **Código resultante:**

```typescript
import { Router } from "express";
import { 
    createOneWorkout, 
    deleteOneWorkout, 
    getAllWorkout, 
    getOneWorkout, 
    updateOneWorkout, 
    getApiKey 
} from "../../controllers/workout._controller";
import apicache from "apicache";
import { 
    createOneRecord, 
    deleteOneRecord, 
    getAllRecord, 
    getOneRecord, 
    updateOneRecord 
} from "../../controllers/record._controller";
import { verifyApiKey } from "../../api/api";

const router1: Router = Router();
const router2: Router = Router();
const router3: Router = Router();
const cache = apicache.middleware;

// ==========================================
// RUTAS: WORKOUT (/api/v1/workout)
// ==========================================

/**
 * @openapi
 * /api/v1/workout:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Obtener todos los entrenamientos
 *     description: Retorna la lista de entrenamientos. Permite filtrar por modo, equipamiento, fecha y límite. (Respuesta en caché de 1 minuto).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de autenticación válida
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *         description: Filtrar por tipo o modalidad de entrenamiento (ej. 'For Time')
 *       - in: query
 *         name: equipment
 *         schema:
 *           type: string
 *         description: Filtrar por equipamiento requerido (ej. 'barbell')
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *         description: Filtrar por fecha de creación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite máximo de resultados devueltos
 *     responses:
 *       200:
 *         description: Lista de entrenamientos obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workout'
 *       401:
 *         description: No autorizado (API Key inválida o faltante)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router1.get('/', verifyApiKey, cache("1 minutes"), getAllWorkout);

/**
 * @openapi
 * /api/v1/workout/{id}:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Obtener un entrenamiento por ID
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único UUID del entrenamiento
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de autenticación
 *     responses:
 *       200:
 *         description: Entrenamiento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Entrenamiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router1.get('/:id', verifyApiKey, getOneWorkout);

/**
 * @openapi
 * /api/v1/workout:
 *   post:
 *     tags:
 *       - Workouts
 *     summary: Crear un nuevo entrenamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkoutInput'
 *     responses:
 *       201:
 *         description: Entrenamiento creado satisfactoriamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       400:
 *         description: Faltan campos obligatorios en el cuerpo de la petición
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router1.post('/', createOneWorkout);

/**
 * @openapi
 * /api/v1/workout/{id}:
 *   patch:
 *     tags:
 *       - Workouts
 *     summary: Actualizar parcialmente un entrenamiento existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del entrenamiento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkoutUpdate'
 *     responses:
 *       200:
 *         description: Entrenamiento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       404:
 *         description: Entrenamiento no encontrado o intento de modificar id/createdAt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router1.patch('/:id', updateOneWorkout);

/**
 * @openapi
 * /api/v1/workout/{id}:
 *   delete:
 *     tags:
 *       - Workouts
 *     summary: Eliminar un entrenamiento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del entrenamiento a eliminar
 *     responses:
 *       204:
 *         description: Entrenamiento eliminado correctamente (Sin contenido)
 *       404:
 *         description: Error al eliminar el entrenamiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router1.delete('/:id', deleteOneWorkout);

// ==========================================
// RUTAS: RECORDS (/api/v1/records)
// ==========================================

/**
 * @openapi
 * /api/v1/records:
 *   get:
 *     tags:
 *       - Records
 *     summary: Obtener todos los récords
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de autenticación
 *       - in: query
 *         name: member
 *         schema:
 *           type: string
 *         description: Filtrar récords por nombre de miembro
 *     responses:
 *       200:
 *         description: Lista de récords
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkoutRecord'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router2.get('/', verifyApiKey, cache("1 minutes"), getAllRecord);

/**
 * @openapi
 * /api/v1/records/{id}:
 *   get:
 *     tags:
 *       - Records
 *     summary: Obtener un récord por ID
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del récord
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave de autenticación
 *     responses:
 *       200:
 *         description: Récord encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutRecord'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Récord no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router2.get('/:id', verifyApiKey, getOneRecord);

/**
 * @openapi
 * /api/v1/records:
 *   post:
 *     tags:
 *       - Records
 *     summary: Crear un nuevo récord
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkoutRecordInput'
 *     responses:
 *       201:
 *         description: Récord registrado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutRecord'
 *       400:
 *         description: Faltan campos obligatorios (memberId, member, record, workout)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router2.post('/', createOneRecord);

/**
 * @openapi
 * /api/v1/records/{id}:
 *   patch:
 *     tags:
 *       - Records
 *     summary: Actualizar un récord existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del récord a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               record:
 *                 type: string
 *                 example: "175 reps"
 *               member:
 *                 type: string
 *                 example: "Juan Pérez Modificado"
 *     responses:
 *       200:
 *         description: Récord actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutRecord'
 *       400:
 *         description: Petición inválida o intento de modificar el id del récord
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Récord no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router2.patch('/:id', updateOneRecord);

/**
 * @openapi
 * /api/v1/records/{id}:
 *   delete:
 *     tags:
 *       - Records
 *     summary: Eliminar un récord por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del récord a eliminar
 *     responses:
 *       204:
 *         description: Récord eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Récord no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router2.delete('/:id', deleteOneRecord);

// ==========================================
// RUTAS: API KEY (/api/v1)
// ==========================================

/**
 * @openapi
 * /api/v1:
 *   get:
 *     tags:
 *       - Auth / API Key
 *     summary: Obtener la clave API activa
 *     description: Devuelve la clave secreta configurada en la base de datos para autenticar peticiones en el parámetro `api_key`.
 *     responses:
 *       200:
 *         description: Clave obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: string
 *                   example: "tu_clave_api_secreta"
 */
router3.get('/', getApiKey);

export { router1, router2, router3 };
```

---

### 8.4. Pruebas y Validación en Navegador

1. **Arrancar el servidor:**
   ```bash
   cd C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym
   npm run dev
   ```
2. **URLs accesibles:**
   * **Swagger UI:** `http://localhost:8001/api/v1/docs` (o puerto `3002`)
   * **Swagger JSON:** `http://localhost:8001/api/v1/docs.json`
3. **Flujo de prueba interactivo:**
   * Ejecutar `GET /api/v1` en Swagger UI para copiar la clave API devuelta.
   * Introducir la clave en el botón `Authorize` o en el campo `api_key` de `GET /api/v1/workout`.
   * Comprobar que responde `200 OK` con los datos cargados desde `data/db.json`.

