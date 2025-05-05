import express, { Router } from 'express';
import * as importController from '../controllers/importController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const importRoutes: Router = express.Router();

importRoutes.use(express.text({ type: 'text/csv' }));

importRoutes.post('/', authMiddleware, importController.importPlants);

export default importRoutes;
