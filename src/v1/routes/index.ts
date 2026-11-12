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
