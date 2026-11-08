import { Router } from "express";
import type{Express, Request, Response} from "express";
import { createOneWorkout, deleteOneWorkout, getAllWorkout, getOneWorkout, updateOneWorkout } from "../../controllers/workout._controller";
import apicache from "apicache";

const router:Router = Router();
const cache = apicache.middleware;
router.get('/', cache("1 minutes"),getAllWorkout);

// get por id
router.get('/:id', getOneWorkout)

// post
router.post('/',createOneWorkout);

// patch
router.patch('/:id',updateOneWorkout);

// delete
router.delete('/:id', deleteOneWorkout);


export default router;