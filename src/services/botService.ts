import { BOT_SERVICE_URL } from '../configs/config';
import redisClient from '../utils/redisClient';
import { ApiService } from './apiService';

export class BotService {
  public static async authenticateBot(botId: string, gameUid: string): Promise<boolean> {
    const isBotRegistered = await redisClient.sIsMember(`game:${gameUid}:bots`, botId);
    return isBotRegistered;
  }

  public static async createBots(numberOfBots: number): Promise<string[]> {
    try {
      const url = `${BOT_SERVICE_URL}/create-bots`;
      const payload = { number_of_bots: numberOfBots };

      // console.log(`Calling BotServer API: ${url} with payload:`, payload);
      const response = await ApiService.post(url, payload);

      if (!Array.isArray(response.bot_ids)) {
        throw new Error('Invalid response format from Bot Server');
      }

      // console.log(`Bot IDs received: ${response.botIds}`);
      return response.bot_ids;
    } catch (error: any) {
      console.error(`Failed to create bots: ${error?.message}`);
      throw error;
    }
  }
}