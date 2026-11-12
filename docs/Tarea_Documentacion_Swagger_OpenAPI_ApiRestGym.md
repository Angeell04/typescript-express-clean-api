---
asignatura: Desarrollo de Aplicaciones Multiplataforma (2DAM) - Backend
tema: Documentación de API REST con Swagger / OpenAPI 3.0 (Express + TypeScript)
referencia_zip: APIREST_NodeJS_2.zip
proyecto_destino: C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src
fecha: 2026-11-12
tags: [backend, nodejs, express, typescript, swagger, openapi, apirest, dam, tsx]
---

# Tarea: Documentación Integral de ApiRestGym con Swagger (OpenAPI 3.0)

> **Destino del Proyecto:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym`  
> **Tecnologías:** Node.js (ESM), Express 5, TypeScript, TSX, `swagger-jsdoc`, `swagger-ui-express`  
> **Estado:** 🟡 **Tarea para Agentes de IA / Alumno**

---

## 1. Contexto y Objetivos

El profesor ha proporcionado un proyecto de referencia (`APIREST_NodeJS_2.zip`) en JavaScript CommonJS (`require`), donde se introdujo Swagger en `src/v1/swagger.js` y se documentó como ejemplo el modelo `Workout` y el endpoint `GET /api/v1/workouts`.

En nuestro proyecto real (**`ApiRestGym`**):
1. Trabajamos con **TypeScript** y **ES Modules (`import`/`export`)**.
2. Nuestro servidor se arranca con `tsx` (`npm run dev`).
3. Tenemos endpoints para **Workouts**, **Records** y **API Key**.
4. La API utiliza un middleware de autenticación por API Key en la query (`?api_key=...`).
5. Las dependencias `swagger-jsdoc`, `swagger-ui-express` y sus respectivos `@types` **ya están instaladas** en el `package.json`.

**Objetivo de la tarea:**  
Implementar la documentación interactiva OpenAPI 3.0 completa, dejando accesibles:
* **Interfaz interactiva (Swagger UI):** `http://localhost:8001/api/v1/docs` (o puerto configurado)
* **Especificación JSON pura:** `http://localhost:8001/api/v1/docs.json`

---

## 2. Prompt Maestro para Agentes de IA

Si vas a encomendar esta tarea a un agente de IA (Cursor, Antigravity, Claude Code, Gemini CLI, etc.), cópiale el siguiente bloque:

```markdown
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
7. Verifica que no haya errores de compilación de TypeScript y que la documentación cargue correctamente en `http://localhost:8001/api/v1/docs`.
```

---

## 3. Plan de Acción y Checklist

- [ ] **Paso 1:** Crear `src/v1/swagger.ts` con tipado TypeScript y ESM.
- [ ] **Paso 2:** Registrar `swaggerDocs` en `src/index.ts`.
- [ ] **Paso 3:** Documentar esquemas de datos en `src/types/workout-interface.ts`.
- [ ] **Paso 4:** Documentar todas las rutas en `src/v1/routes/index.ts`.
- [ ] **Paso 5:** Probar con `npm run dev` y validar en navegador.

---

## 4. Desglose Fichero por Fichero

### Fichero 1: `src/v1/swagger.ts` (NUEVO FICHERO)
* **Ruta absoluta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\v1\swagger.ts`
* **Propósito:** Configurar `swagger-jsdoc`, inicializar `swagger-ui-express` y exponer las rutas `/api/v1/docs` y `/api/v1/docs.json`.
* **Código a escribir:**

```typescript
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express, Request, Response } from "express";

// Metadatos y opciones de configuración de OpenAPI
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

### Fichero 2: `src/index.ts` (MODIFICACIÓN)
* **Ruta absoluta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\index.ts`
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

### Fichero 3: `src/types/workout-interface.ts` (MODIFICACIÓN)
* **Ruta absoluta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\types\workout-interface.ts`
* **Propósito:** Añadir la sección `components.schemas` en formato JSDoc `@openapi` para que Swagger reconozca las entidades (`Workout`, `WorkoutRecord`, `Miembro`) y las estructuras de petición/respuesta.
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
 *       description: Formato unificado de error
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

### Fichero 4: `src/v1/routes/index.ts` (MODIFICACIÓN)
* **Ruta absoluta:** `C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym\src\v1\routes\index.ts`
* **Propósito:** Anotar con `@openapi` cada endpoint HTTP de los 3 routers (`router1` para workouts, `router2` para records, `router3` para API key).
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

## 5. Instrucciones de Ejecución y Verificación

Una vez que el agente de IA o el alumno aplique los cambios descritos en los 4 ficheros, debe realizar las siguientes pruebas:

1. **Arrancar el servidor en modo desarrollo:**
   ```bash
   cd C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym
   npm run dev
   ```
2. **Revisar la salida de la consola:**  
   Debe aparecer el mensaje del servidor y las URLs de Swagger:
   ```text
   Servidor ejecutandose en el puerto (8001)
   📓 [Swagger] Documentación v1 disponible en: http://localhost:8001/api/v1/docs
   📄 [Swagger] Especificación JSON en: http://localhost:8001/api/v1/docs.json
   ```
3. **Comprobar la UI en el navegador:**  
   Abrir: `http://localhost:8001/api/v1/docs` (o puerto `3002` si no se cargó el `.env`).
   - Verificar que aparecen las tres secciones de tags: **Workouts**, **Records**, **Auth / API Key**.
   - Probar el botón **Authorize** o introducir `?api_key=...` con la clave obtenida de `GET /api/v1`.
   - Ejecutar una prueba de `GET /api/v1/workout` y comprobar que responde `200 OK` con los datos del `db.json`.
4. **Comprobar la salida JSON:**  
   Abrir: `http://localhost:8001/api/v1/docs.json` y verificar que devuelve el objeto OpenAPI válido sin errores de sintaxis.

---

## 6. Resolución de Problemas Frecuentes (Troubleshooting)

| Problema | Causa habitual | Solución |
| :--- | :--- | :--- |
| **Error `Failed to parse YAML`** | Espacios o tabuladores erróneos dentro de los comentarios `/** @openapi ... */`. | Comprobar que la indentación dentro del bloque YAML sea con espacios uniformes (2 espacios) y no contenga caracteres inválidos. |
| **Swagger UI carga vacía (sin endpoints ni esquemas)** | La ruta en `apis: ["./src/v1/routes/*.ts", ...]` no encuentra los archivos al ejecutar desde otra carpeta. | Asegurarse de ejecutar el comando `npm run dev` desde la raíz del proyecto (`C:\Users\miran\Desktop\Cole\2DAM\Backend\ApiRestGym`). |
| **Error de TypeScript con `swagger-jsdoc` o `swagger-ui-express`** | Incompatibilidad de exportación default / named con ESM. | Usar `import swaggerJSDoc from "swagger-jsdoc";` y `import swaggerUi from "swagger-ui-express";`. Si persistiera problema de tipos, importar `import * as swaggerUi from "swagger-ui-express";`. |
| **Puerto no coincide (3002 vs 8001)** | `env.ts` usa `process.env.PORT || 3002`, pero `.env` tiene `PORT = 8001`. | Verificar que `dotenv` o el lanzador carguen las variables de `.env`. El log de consola indicará el puerto activo exacto. |
