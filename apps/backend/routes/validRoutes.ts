import express, { Router } from 'express';
import * as validController from '../controllers/validController.js';

const validRoutes: Router = express.Router();

validRoutes.get('/soil', validController.validSoil);
validRoutes.get('/roles', validController.validRoles);
validRoutes.get('/subcategories', validController.validSubcategories);

export default validRoutes;
