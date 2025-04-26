import express, { Router } from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRoutes: Router = express.Router();

userRoutes.get('/id/:userid', authMiddleware, userController.getUserByID);
userRoutes.get('/email/:email', authMiddleware, userController.getUserByEmail);
userRoutes.put('/info', authMiddleware, userController.updateUserPersonalInfo);
userRoutes.put('/role/:email', authMiddleware, userController.updateUserRole);

export default userRoutes;