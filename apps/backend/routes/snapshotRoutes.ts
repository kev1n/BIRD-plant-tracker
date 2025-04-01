import express, { Router } from 'express';
import * as snapshotController from '../controllers/snapshotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const snapshotRoutes: Router = express.Router();

snapshotRoutes.post('/', authMiddleware, snapshotController.newSnapshot);
snapshotRoutes.delete('/:snapshotID', authMiddleware, snapshotController.delSnapshot);
snapshotRoutes.put('/:snapshotID', authMiddleware, snapshotController.updateSnapshot);
snapshotRoutes.get('/:snapshotID', snapshotController.getSnapshot);
snapshotRoutes.get('/patch/:patchID',snapshotController.getLatestPatchSnapshot)
snapshotRoutes.get('/', snapshotController.getAllSnapshots)

export default snapshotRoutes;