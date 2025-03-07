import { v4 as uuidv4 } from 'uuid'
import redisClient from '../utils/redisClient'
import { GAME_STATUS } from '../constants/gameConstants';
import { BotService } from './botService';
import { Game } from '../game/game';

export class GameService {

  public static async createGame(userIds: string[], numberOfBots: number): Promise<string> {
    const gameUid = uuidv4();

    await redisClient.sAdd('active_games', gameUid)

    const userPlayerMapping: Record<string, string> = {};
    userIds.forEach(userId => {
        userPlayerMapping[userId] = uuidv4();
    });

    const botIds = await BotService.createBots(numberOfBots);

    await redisClient.multi()
        .hSet(`game:${gameUid}:user_player_id_mapping`, userPlayerMapping)
        .sAdd(`game:${gameUid}:users`, userIds)
        .sAdd(`game:${gameUid}:bots`, botIds)
        .exec();

    const game = new Game(gameUid);
    await game.initializeGame();

    return gameUid;
  }

  public static async getLiveGames(): Promise<string[]> {
    return await redisClient.sMembers('active_games')
  }

  public static async getPlayerIdForUser(userId: Number, gameUid: string): Promise<string | null> {
    const playerId = await redisClient.hGet(`game:${gameUid}:user_player_id_mapping`, String(userId));
    return playerId || null;
  }

}