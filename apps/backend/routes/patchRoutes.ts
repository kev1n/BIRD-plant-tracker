import express, { Router } from 'express';
import * as patchController from '../controllers/patchController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const patchRoutes: Router = express.Router();

patchRoutes.post('/', authMiddleware, patchController.newPatch);
patchRoutes.delete('/:patchID', authMiddleware, patchController.deletePatch);
patchRoutes.put('/:patchID', authMiddleware, patchController.updatePatch);
patchRoutes.get('/:patchID', patchController.getPatch);
patchRoutes.get('/', patchController.getAllPatches)

export default patchRoutes
