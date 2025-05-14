import express, { Router } from 'express';
import multer from 'multer';
import * as importController from '../controllers/importController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const importRoutes: Router = express.Router();
const upload = multer();

importRoutes.post('/', authMiddleware, upload.single('file'), importController.importPlants);

export default importRoutes;
