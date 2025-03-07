import express from 'express';
import { GameController } from '../controllers/gameController';

const router = express.Router();

router.post('/create', GameController.createGame);
router.get('/live', GameController.getLiveGames);

export default router;