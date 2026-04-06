const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 
  (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null) || 
  'redis://127.0.0.1:6379';

const redis = new Redis(redisUrl, {
  // Retry strategy helps resolve ECONNREFUSED on local dev when Redis is still booting
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis Error:', err.message));

module.exports = redis;
