import express from 'express';
import { startRender } from '../controllers/renderController.js';

const router = express.Router();

router.post('/render', startRender);

export default router;
