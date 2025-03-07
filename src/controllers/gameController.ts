import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/gameService';

export class GameController {
  public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user_ids, number_of_bots } = req.body;

      if (!Array.isArray(user_ids) || typeof number_of_bots !== 'number') {
        res.status(400).json({ error: 'Invalid input' });
        return
      }
      
      const userIds = user_ids.map((id: number) => id.toString());
      const gameUid = await GameService.createGame(userIds, number_of_bots);

      res.json({ game_uid: gameUid });
    } catch (error) {
      next(error);
    }
  }

  public static async getLiveGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    const liveGames = await GameService.getLiveGames();
    res.json({ live_games: liveGames });
  }
}