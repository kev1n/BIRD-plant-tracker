import express, { Router } from 'express';
import * as filterController from '../controllers/filterController.js';

const filterRoutes: Router = express.Router();

filterRoutes.get('/', filterController.getFromFilter);

export default filterRoutes;
