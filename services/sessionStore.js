import { RedisSessionStore } from './sessionStore.redis.js';

class MemorySessionStore {
  constructor(ttlMs = 30 * 60 * 1000) {
    this.sessions = new Map();
    this.ttlMs = ttlMs;
  }

  createSession(sessionId, keyBuffer) {
    this.sessions.set(sessionId, { 
      key: keyBuffer, 
      created: Date.now(),
      timeout: setTimeout(() => this.sessions.delete(sessionId), this.ttlMs)
    });
  }

  getSessionKey(sessionId) {
    const s = this.sessions.get(sessionId);
    return s ? s.key : null;
  }

  deleteSession(sessionId) {
    const s = this.sessions.get(sessionId);
    if (s?.timeout) clearTimeout(s.timeout);
    this.sessions.delete(sessionId);
  }
}

let sessionStore;

export function initSessionStore() {
  if (sessionStore) return sessionStore;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('Using Redis session store');
    sessionStore = new RedisSessionStore(redisUrl);
  } else {
    console.log('Using in-memory session store');
    sessionStore = new MemorySessionStore();
  }

  return sessionStore;
}

// Inicializar store
initSessionStore();

// Exportar métodos del store
export const createSession = (sessionId, keyBuffer) => sessionStore.createSession(sessionId, keyBuffer);
export const getSessionKey = (sessionId) => sessionStore.getSessionKey(sessionId);
export const deleteSession = (sessionId) => sessionStore.deleteSession(sessionId);
