import { Deck } from './deck';
import { redisClient } from '../utils/redisClient';
import { GAME_STATUS } from '../constants/gameConstants';

export class Game {
  private gameUid: string;
  private deck: Deck | null = null;

  constructor(gameUid: string) {
    this.gameUid = gameUid;
  }

  public async initializeGame(): Promise<void> {
    console.log(`Initializing game: ${this.gameUid}`);

    const userPlayerMapping = await redisClient.hGetAll(`game:${this.gameUid}:user_player_id_mapping`);
    const botIds = await redisClient.sMembers(`game:${this.gameUid}:bots`);

    const allPlayers = { ...userPlayerMapping, ...Object.fromEntries(botIds.map(botId => [botId, botId])) };

    this.deck = new Deck(1);

    const dealtCards = this.deck.dealCards(4, Object.keys(allPlayers));

    const gameInfo = {
      stage: GAME_STATUS.WAITING,
      rounds: 0,
      actions: [],
      players: Object.keys(allPlayers).reduce((acc: any, playerId: string) => {
        acc[playerId] = { hands: dealtCards[playerId], no_of_cards: 4, penalty_points: 0 };
        return acc;
      }, {})
    };

    await redisClient.multi()
      .json.set(`game:${this.gameUid}:info`, '.', gameInfo)
      .rPush(`game:${this.gameUid}:draw_pile`, this.deck.getRemainingCards())
      .rPush(`game:${this.gameUid}:discard_pile`, [])
      .exec();

    console.log(`Game ${this.gameUid} initialized!`);
  }
}