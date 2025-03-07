import request from "supertest";
import { app } from "../../src/server";
import { BotService } from "../../src/services/botService";
import redisClient from "../../src/utils/redisClient";
import { GAME_STATUS } from "../../src/constants/gameConstants";
import { GameService } from "../../src/services/gameService";

describe("GameController - CreateGame API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should create a new game and store it in Redis", async () => {
    jest.spyOn(BotService, "createBots").mockResolvedValue(["bot-id-1", "bot-id-2"]);

    const gameData = {
      user_ids: [1, 2],
      number_of_bots: 2,
    };

    const response = await request(app).post("/games/create").send(gameData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("game_uid");
    expect(typeof response.body.game_uid).toBe("string");

    const gameUid = response.body.game_uid;

    // ✅ Check if game is added to live games
    const liveGames = await redisClient.sMembers("active_games");
    expect(liveGames).toContain(gameUid);

    // ✅ Check if bots are stored correctly
    const botIds = await redisClient.sMembers(`game:${gameUid}:bots`);
    expect(botIds).toEqual(expect.arrayContaining(["bot-id-1", "bot-id-2"]));

    // ✅ Check if user-player mapping is stored correctly
    const userPlayerMapping = await redisClient.hGetAll(`game:${gameUid}:user_player_id_mapping`);
    expect(Object.keys(userPlayerMapping)).toEqual(expect.arrayContaining(["1", "2"]));
    expect(typeof userPlayerMapping["1"]).toBe("string");
    expect(typeof userPlayerMapping["2"]).toBe("string");

    // ✅ Check if game info is stored correctly
    const gameInfo = await redisClient.json.get(`game:${gameUid}:info`) as any;
    expect(gameInfo).toMatchObject({
      stage: GAME_STATUS.WAITING,
      rounds: 0,
      actions: [],
    });

    // ✅ Check if player data is correctly stored
    expect(gameInfo.players).toBeDefined();
    expect(Object.keys(gameInfo.players)).toEqual(expect.arrayContaining([...Object.keys(userPlayerMapping), ...botIds]));

    Object.values(gameInfo!.players).forEach((player: any) => {
      expect(player).toHaveProperty("hands");
      expect(player.hands.length).toBe(4)
      expect(Array.isArray(player.hands)).toBe(true);
      expect(player).toHaveProperty("no_of_cards", 4);
      expect(player).toHaveProperty("penalty_points", 0);
    });

    // ✅ Check if draw pile has remaining cards
    const drawPile = await redisClient.lRange(`game:${gameUid}:draw_pile`, 0, -1);
    expect(drawPile.length).toBe(36);

    // ✅ Check if all cards in draw pile and player hands are unique
    const allCards = new Set(drawPile); // Add draw pile cards to the set

    Object.values(gameInfo.players).forEach((player: any) => {
      player.hands.forEach((card: string) => {
        allCards.add(card);
      });
    });

    expect(allCards.size).toBe(52);
  });

  it("should return 400 if user_ids is not an array", async () => {
    const response = await request(app).post("/games/create").send({ user_ids: "invalid", number_of_bots: 2 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid input" });
  });

  it("should return 400 if number_of_bots is not a number", async () => {
    const response = await request(app).post("/games/create").send({ user_ids: [1, 2], number_of_bots: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid input" });
  });

  it("should return 400 if user_ids is missing", async () => {
    const response = await request(app).post("/games/create").send({ number_of_bots: 2 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid input" });
  });

  it("should return 400 if number_of_bots is missing", async () => {
    const response = await request(app).post("/games/create").send({ user_ids: [1, 2] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid input" });
  });

  it("should return 500 if GameService.createGame fails", async () => {
    jest.spyOn(GameService, "createGame").mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/games/create").send({ user_ids: [1, 2], number_of_bots: 2 });

    expect(response.status).toBe(500);
  });

  it("should return 500 if BotService.createBots fails", async () => {
    jest.spyOn(BotService, "createBots").mockRejectedValue(new Error("Bot creation failed"));

    const response = await request(app).post("/games/create").send({ user_ids: [1, 2], number_of_bots: 2 });

    expect(response.status).toBe(500);
  });

  
  it("should return 500 if redisClient fails while storing game info", async () => {
    jest.spyOn(BotService, "createBots").mockResolvedValue(["bot-id-1", "bot-id-2"]);
    jest.spyOn(redisClient.json as any, "set").mockRejectedValue(new Error("Redis error"));

    const response = await request(app).post("/games/create").send({ user_ids: [1, 2], number_of_bots: 2 });

    expect(response.status).toBe(500);
  });

  it("should return 500 if redisClient fails while storing user-player mapping", async () => {
    jest.spyOn(BotService, "createBots").mockResolvedValue(["bot-id-1", "bot-id-2"]);
    jest.spyOn(redisClient, "hSet").mockRejectedValue(new Error("Redis error"));

    const response = await request(app).post("/games/create").send({ user_ids: [1, 2], number_of_bots: 2 });

    expect(response.status).toBe(500);
  });

  it("should return 500 if redisClient fails while storing bot data", async () => {
    // jest.spyOn(GameService, "createGame").mockResolvedValue("game-uid-123");
    jest.spyOn(BotService, "createBots").mockResolvedValue(["bot-id-1", "bot-id-2"]);
    jest.spyOn(redisClient, "sAdd").mockRejectedValue(new Error("Redis error"));

    const response = await request(app).post("/games/create").send({ user_ids: [1, 2], number_of_bots: 2 });

    expect(response.status).toBe(500);
  });

  it("should return 500 if an unknown error occurs", async () => {
    jest.spyOn(GameService, "createGame").mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    const response = await request(app).post("/games/create").send({ user_ids: [1, 2], number_of_bots: 2 });

    expect(response.status).toBe(500);
  });
});