import Redis from 'ioredis';

export class RedisSessionStore {
  constructor(redisUrl, ttlSeconds = 3600) {
    this.redis = new Redis(redisUrl);
    this.ttlSeconds = ttlSeconds;
    this.keyPrefix = 'session:';
  }

  async createSession(sessionId, aesKey) {
    const key = this.keyPrefix + sessionId;
    await this.redis.setex(key, this.ttlSeconds, aesKey.toString('base64'));
  }

  async getSessionKey(sessionId) {
    const key = this.keyPrefix + sessionId;
    const value = await this.redis.get(key);
    if (!value) return null;
    return Buffer.from(value, 'base64');
  }

  async deleteSession(sessionId) {
    const key = this.keyPrefix + sessionId;
    await this.redis.del(key);
  }

  async close() {
    await this.redis.quit();
  }
}