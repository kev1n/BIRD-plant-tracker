import express, { Router } from 'express';
import * as obsController from '../controllers/obsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const obsRoutes: Router = express.Router();

obsRoutes.post('/', authMiddleware, obsController.newObservation);
obsRoutes.delete('/:obsID', authMiddleware, obsController.delObservation);
obsRoutes.put('/:obsID', authMiddleware, obsController.updateObservation);
obsRoutes.get('/:obsID', obsController.getObservation);
obsRoutes.get('/all/:snapshotID', obsController.getAllFromSnapshot);
obsRoutes.get('/detailed-all/:snapshotID', obsController.getAllFromSnapshotDetailed);
obsRoutes.get('/', obsController.getAllObservation)

export default obsRoutes;
