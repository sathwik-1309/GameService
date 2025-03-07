import { createClient } from 'redis'
import { REDIS_URL } from '../configs/config';

export const redisClient = createClient({ url: process.env.NODE_ENV === "test" ? REDIS_URL : "redis://localhost:6379/15" })

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
});

(async () => {
  await redisClient.connect()
  console.log('Connected to Redis')
})()

export default redisClient;