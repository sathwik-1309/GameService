import { createClient } from 'redis'
import { REDIS_URL } from '../configs/config';

export const redisClient = createClient({ url: REDIS_URL })

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
});

(async () => {
  await redisClient.connect()
  console.log('Connected to Redis')
})()

export default redisClient;