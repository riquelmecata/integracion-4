import { Router } from 'express';
import { getCurrentSessionUser} from "../../controller/sessions.controller.js"


// Importar todos los routers;
export const router = Router();

router.get('/current', getCurrentSessionUser)