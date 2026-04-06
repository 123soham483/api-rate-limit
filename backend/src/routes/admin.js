const express = require('express');
const redis = require('../redisClient');
const router = express.Router();

const ADMIN_KEY = process.env.ADMIN_KEY || 'supersecret';

// Simple admin security middleware
const requireAdmin = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid Admin Key' });
    }
    next();
};

router.post('/block', requireAdmin, async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP is required' });
    await redis.sadd('blacklist:ips', ip);
    res.json({ message: `IP ${ip} blocked.` });
});

router.post('/unblock', requireAdmin, async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP is required' });
    await redis.srem('blacklist:ips', ip);
    res.json({ message: `IP ${ip} unblocked.` });
});

router.post('/reset', requireAdmin, async (req, res) => {
    try {
        const keys = await redis.keys('ratelimit:*');
        if (keys.length > 0) {
            await redis.del(keys);
        }
        res.json({ message: `Cleared limits for ${keys.length} keys.` });
    } catch (err) {
        console.error('Reset Error:', err);
        res.status(500).json({ error: 'Failed to reset limits' });
    }
});

router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const now = Date.now();
        const fiveMinsAgo = now - 5 * 60 * 1000;

        const totalRequests = await redis.get('stats:total_requests') || 0;
        const activeUsersCount = await redis.zcount('stats:active_users', fiveMinsAgo, now);
        
        const peakBlocks = await redis.get('stats:peak_blocks') || 0;
        const peakTime = await redis.get('stats:peak_time');

        res.json({
            totalRequests: parseInt(totalRequests),
            activeUsers: parseInt(activeUsersCount),
            peakBlocks: parseInt(peakBlocks),
            peakTime: peakTime ? parseInt(peakTime) : null
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
