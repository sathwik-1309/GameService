import redisClient from "../src/utils/redisClient";

// beforeAll(async () => {
//   if (!redisClient.isReady) {
//     await redisClient.connect();
//   }
// });

afterAll(async () => {
  await redisClient.flushDb(); // Clear test DB after tests
  await redisClient.quit(); // Properly close Redis connection
});