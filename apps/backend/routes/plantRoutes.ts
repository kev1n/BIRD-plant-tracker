import express, { Router } from 'express';
import * as plantController from '../controllers/plantController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const plantRoutes: Router = express.Router();

plantRoutes.post('/', authMiddleware, plantController.postPlant);
plantRoutes.delete('/:plantID', authMiddleware, plantController.deletePlant);
plantRoutes.put('/:plantID', authMiddleware, plantController.updatePlant);
plantRoutes.get('/:plantID', plantController.getPlant);
//  plants?name=partialName
//  search string is query param
plantRoutes.get('/', plantController.getPlants);

export default plantRoutes;