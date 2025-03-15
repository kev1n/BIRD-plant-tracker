import express, { Router } from 'express';
import * as obsController from '../controllers/obsController.js';

const getObsRoutes: Router = express.Router();

getObsRoutes.get('/:obsID', obsController.getObservation);
getObsRoutes.get('/all/:snapshotID', obsController.getAllFromSnapshot);
getObsRoutes.get('/', obsController.getAllObservation)

export default getObsRoutes;
