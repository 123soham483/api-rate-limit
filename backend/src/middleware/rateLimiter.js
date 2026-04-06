const redis = require('../redisClient');

const luaScript = `
local current_time = tonumber(ARGV[1])
local window_size_in_seconds = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local window_start = current_time - (window_size_in_seconds * 1000)

-- Clean up old requests outside the sliding window
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, window_start)

-- Count current requests within the window
local current_requests = redis.call('ZCARD', KEYS[1])

if current_requests < limit then
  -- Allowed: Add the new request timestamp
  -- Assuming current_time is unique enough, but let's append a random number to avoid collisions
  -- Since we just need uniqueness, ARGV[4] can be a random string or counter. Let's pass a random string as ARGV[4]
  redis.call('ZADD', KEYS[1], current_time, ARGV[4])
  redis.call('EXPIRE', KEYS[1], window_size_in_seconds)
  return { 1, limit - current_requests - 1, 0 }
else
  -- Blocked: Find when the oldest request in the window expires
  local oldest_request = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local retry_after = 0
  if #oldest_request > 0 then
     -- Calculate seconds until the oldest request falls out of the window
     local oldest_time = tonumber(oldest_request[2])
     retry_after = math.ceil(((oldest_time / 1000) + window_size_in_seconds) - (current_time / 1000))
     if retry_after < 0 then retry_after = 0 end
  end
  return { 0, 0, retry_after }
end
`;

// Define the custom command on the Redis instance
redis.defineCommand('slidingWindowRateLimit', {
    numberOfKeys: 1,
    lua: luaScript,
});

/**
 * Higher-order function wrapping the rate limiter middleware
 */
const rateLimiter = (options) => {
    const { limit, windowSeconds, routeName } = options;

    return async (req, res, next) => {
        // Basic IP detection
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const key = `ratelimit:${routeName}:${ip}`;

        const now = Date.now();
        // Unique identifier for the ZSET member
        const uniqueId = `${now}-${Math.random().toString(36).substring(2, 8)}`;

        try {
            // Global Blacklist Check
            const isBlacklisted = await redis.sismember('blacklist:ips', ip);
            if (isBlacklisted) {
                return res.status(403).json({ error: 'Forbidden', message: 'Your IP has been blacklisted.' });
            }

            // Stats tracking
            await redis.incr('stats:total_requests');
            await redis.zadd('stats:active_users', now, ip);

            const result = await redis.slidingWindowRateLimit(
                key,
                now,
                windowSeconds,
                limit,
                uniqueId
            );

            const [allowed, remaining, retryAfter] = result;
            const isAllowed = allowed === 1;

            // Ensure headers are appended
            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', Math.max(remaining, 0));

            // Build traffic log object to push to dashboard
            const logEntry = {
                id: `${now}-${Math.random().toString(36).substring(2, 8)}`,
                ip,
                endpoint: routeName,
                status: isAllowed ? 'Allowed' : 'Blocked',
                timestamp: now
            };

            const io = req.app.get('io');
            if (io) {
                io.emit('traffic_event', logEntry);
            }

            if (!isAllowed) {
                // Peak traffic tracking (blocks per min)
                const currentMinute = Math.floor(now / 60000);
                const blockKey = `stats:blocks_per_min:${currentMinute}`;
                const minuteBlocks = await redis.incr(blockKey);
                if (minuteBlocks === 1) await redis.expire(blockKey, 120);

                const peakBlocks = parseInt(await redis.get('stats:peak_blocks') || 0);
                if (minuteBlocks > peakBlocks) {
                    await redis.set('stats:peak_blocks', minuteBlocks);
                    await redis.set('stats:peak_time', now);
                }

                res.setHeader('X-Retry-After', retryAfter);
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded. Please wait ${retryAfter} seconds.`
                });
            }

            next();
        } catch (error) {
            console.error('Rate Limiter Error:', error);
            // Fail open or fail closed? Usually fail open is safer so service doesn't go down if Redis goes down
            next();
        }
    };
};

module.exports = rateLimiter;
