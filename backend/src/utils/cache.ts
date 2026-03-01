/**
 * Cache layer: Redis if REDIS_URI set, else in-memory (server process only). TTL in seconds.
 */

import { getRedis } from '../config/redis';

const memory = new Map<string, string>();

function memoryGet(key: string): string | null {
  const v = memory.get(key);
  if (v === undefined || typeof v !== 'string') return null;
  const [exp, val] = v.split('\0');
  if (Date.now() > parseInt(exp, 10)) {
    memory.delete(key);
    return null;
  }
  return val ?? null;
}

function memorySet(key: string, value: string, ttlSec: number) {
  memory.set(key, `${Date.now() + ttlSec * 1000}\0${value}`);
}

function memoryDel(key: string) {
  memory.delete(key);
}

export async function cacheGet(key: string): Promise<string | null> {
  const redis = getRedis();
  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      return null;
    }
  }
  return memoryGet(key);
}

export async function cacheSet(key: string, value: string, ttlSec: number): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.setex(key, ttlSec, value);
    } catch (_) {}
    return;
  }
  memorySet(key, value, ttlSec);
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch (_) {}
    return;
  }
  memoryDel(key);
}

export function cacheKeyMenuByRestaurant(restaurantId: string): string {
  return `menu:${restaurantId}`;
}

export function cacheKeyRestaurant(slug: string): string {
  return `restaurant:slug:${slug}`;
}

export function cacheKeyAnalytics(restaurantId: string): string {
  return `analytics:dashboard:${restaurantId}`;
}
