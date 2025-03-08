import express, { Router } from 'express';
import * as snapshotController from '../controllers/obsController.js';

const snapshotRoutes: Router = express.Router();

snapshotRoutes.post('/', snapshotController.newObservation);