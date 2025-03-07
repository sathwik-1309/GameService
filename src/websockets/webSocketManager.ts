import { Server, Socket } from 'socket.io';
import { JwtHelper } from '../utils/jwtHelper';
import { GameService } from '../services/gameService';
import { BotService } from '../services/botService';
import redisClient from '../utils/redisClient';
import { BOT_SERVER_TOKEN } from '../configs/config';

export class WebSocketManager {
  private static io: Server;

  public static initialize(io: Server) {
    this.io = io;

    io.on('connection', async (socket: Socket) => {
      const { access_token, game_uid, bot_id, bot_server_token } = socket.handshake.query;

      if (!game_uid || typeof game_uid !== 'string') {
        socket.emit('error', { error: 'Invalid or missing game UID' });
        socket.disconnect(true);
        return;
      }

      const isGameActive = await redisClient.sIsMember('active_games', game_uid);
      if (!isGameActive) {
        socket.emit('error', { error: 'Game not found or inactive' });
        socket.disconnect(true);
        return;
      }

      let playerId: string | null = null;

      if (access_token && typeof access_token === 'string') {
        // **User Authentication**
        const decoded = JwtHelper.verifyToken(access_token);
        if (!decoded) {
          socket.emit('error', { error: 'Invalid access token' });
          socket.disconnect(true);
          return;
        }

        const userId = decoded.user_id;
        playerId = await GameService.getPlayerIdForUser(userId, game_uid);
        if (!playerId) {
          socket.emit('error', { error: 'Unauthorized: You are not part of this game' });
          socket.disconnect(true);
          return;
        }

      } else if (bot_id && typeof bot_id === 'string') {
        if (bot_server_token != BOT_SERVER_TOKEN) {
          socket.emit('error', { error: 'Unauthorized: Bot server token is invalid' });
          socket.disconnect(true);
          return;
        }
        // **Bot Authentication**
        const isValidBot = await BotService.authenticateBot(bot_id, game_uid);
        if (!isValidBot) {
          socket.emit('error', { error: 'Unauthorized: Invalid bot ID or bot not registered in this game' });
          socket.disconnect(true);
          return;
        }

        playerId = bot_id;
      } else {
        socket.emit('error', { error: 'Invalid connection request: Missing access_token or bot_id' });
        socket.disconnect(true);
        return;
      }

      socket.data.game_uid = game_uid;
      socket.data.player_id = playerId;

      socket.join(game_uid);
      console.log(`Player ${playerId} connected to game ${game_uid}`);

      socket.emit('connected', { message: 'Connected successfully', game_uid, playerId });

      socket.on('disconnect', () => {
        console.log(`Player ${playerId} disconnected from game ${game_uid}`);
      });
    });
  }
}