import express from 'express';
import { startRender } from '../controllers/renderController.js';
import { authenticateToken } from "../middleware/auth.js";


const router = express.Router();

router.post("/render", authenticateToken, startRender);


export default router;
