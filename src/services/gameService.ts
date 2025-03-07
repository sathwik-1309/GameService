import { v4 as uuidv4 } from 'uuid'
import { BotService } from './botService';
import { Game } from '../game/game';
import RedisService from './redisService';
import redisClient from '../utils/redisClient';

export class GameService {

  public static async createGame(userIds: string[], numberOfBots: number): Promise<string> {
    const gameUid = uuidv4();

    await RedisService.sAdd('active_games', gameUid);

    const userPlayerMapping: Record<string, string> = {};
    userIds.forEach(userId => {
        userPlayerMapping[userId] = uuidv4();
    });

    const botIds = await BotService.createBots(numberOfBots);

    const transaction = redisClient.multi();
    transaction.hSet(`game:${gameUid}:user_player_id_mapping`, userPlayerMapping);
    transaction.sAdd(`game:${gameUid}:bots`, botIds);

    await RedisService.execMulti(transaction);

    const game = new Game(gameUid);
    await game.initializeGame();

    return gameUid;
  }

  public static async getLiveGames(): Promise<string[] | null> {
    return await RedisService.sMembers('active_games')
  }

  public static async getPlayerIdForUser(userId: Number, gameUid: string): Promise<string | null> {
    const playerId = await redisClient.hGet(`game:${gameUid}:user_player_id_mapping`, String(userId));
    return playerId || null;
  }

}