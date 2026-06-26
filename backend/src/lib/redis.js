import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        return new Error('Redis connection failed permanently');
      }
      return 1000;
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

let isRedisConnected = false;

export async function connectRedis() {
  if (isRedisConnected) return;
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log('Successfully connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis. Running without caching:', err);
    isRedisConnected = false;
  }
}

export async function getCache(key) {
  if (!isRedisConnected) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error(`Failed to get cache key "${key}":`, err);
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = 300) {
  if (!isRedisConnected) return;
  try {
    await redisClient.set(key, value, {
      EX: ttlSeconds,
    });
  } catch (err) {
    console.error(`Failed to set cache key "${key}":`, err);
  }
}

export async function clearProductsCache() {
  if (!isRedisConnected) return;
  try {
    const keys = await redisClient.keys('products:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} product cache keys from Redis`);
    }
  } catch (err) {
    console.error('Failed to clear products cache:', err);
    try {
      await redisClient.flushDb();
      console.log('Flushed entire Redis cache database as fallback');
    } catch (e) {
      console.error('Redis flush failed:', e);
    }
  }
}
