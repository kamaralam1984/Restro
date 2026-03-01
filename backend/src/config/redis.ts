/**
 * Optional Redis client. If REDIS_URI is not set, getRedis() returns null and cache layer falls back to no-op or in-memory.
 */

import Redis from 'ioredis';

const REDIS_URI = process.env.REDIS_URI || '';

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!REDIS_URI) return null;
  if (!client) {
    try {
      client = new Redis(REDIS_URI, { maxRetriesPerRequest: 2 });
      client.on('error', (err) => {
        console.warn('Redis connection error:', err.message);
      });
    } catch (err) {
      console.warn('Redis init failed:', err);
      return null;
    }
  }
  return client;
}

export const CACHE_TTL = {
  MENU_SEC: 300,       // 5 min
  RESTAURANT_SEC: 300, // 5 min
  ANALYTICS_SEC: 120,  // 2 min
};
