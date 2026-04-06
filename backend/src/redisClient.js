const Redis = require('ioredis');

// Connection priority:
//   1. REDIS_URL env var          — Railway managed Redis / any full connection string
//   2. redis://redis:6379         — Docker Compose service name (local dev)
//   3. redis://127.0.0.1:6379    — Manual local run (no Docker)
const resolveRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  if (process.env.REDIS_HOST) {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT || 6379;
    return `redis://${host}:${port}`;
  }
  // Running inside Docker Compose: try the service name first, then loopback
  return 'redis://redis:6379';
};

const redisUrl = resolveRedisUrl();
console.log(`Connecting to Redis at: ${redisUrl.replace(/\/\/.*@/, '//<credentials>@')}`);

const redis = new Redis(redisUrl, {
  // Retry with exponential back-off so the backend survives a slow Redis start
  retryStrategy: (times) => Math.min(times * 200, 5000),
  lazyConnect: false,
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis Error:', err));

module.exports = redis;
