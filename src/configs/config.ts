import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL || 'bot_service_url';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'jwt_secret_key';

const BOT_SERVER_TOKEN = process.env.BOT_SERVER_TOKEN || 'bot_server_token';
const GAME_SERVER_TOKEN = process.env.GAME_SERVER_TOKEN || 'game_server_token';

export {REDIS_URL, JWT_SECRET_KEY, BOT_SERVICE_URL, BOT_SERVER_TOKEN, GAME_SERVER_TOKEN}