import express, { Router } from 'express';
import * as filterController from '../controllers/filterController.js';

const filterRoutes: Router = express.Router();

filterRoutes.get('/', filterController.getFromFilter);
filterRoutes.get('/latest-plant', filterController.getPatchesFilteredByLatestPlants);
filterRoutes.get('/date-range-plant', filterController.getPatchesFilteredByDateRangePlants);

export default filterRoutes;
