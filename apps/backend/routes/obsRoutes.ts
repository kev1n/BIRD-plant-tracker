import express, { Router } from 'express';
import * as obsController from '../controllers/obsController.js';

const obsRoutes: Router = express.Router();

obsRoutes.post('/', obsController.newObservation);
obsRoutes.delete('/:obsID', obsController.delObservation);
obsRoutes.put('/:obsID', obsController.updateObservation);
obsRoutes.get('/:obsID', obsController.getObservation);
obsRoutes.get('/', obsController.getAllObservation)

export default obsRoutes;