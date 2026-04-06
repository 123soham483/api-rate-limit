const express = require('express');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();

// Defined limits per requirements
const HOME_LIMIT = 100;
const SEARCH_LIMIT = 20;
const LOGIN_LIMIT = 5;

// All share the same window size (1 minute = 60 seconds)
const WINDOW_SECONDS = 60;

router.get('/home',
    rateLimiter({ limit: HOME_LIMIT, windowSeconds: WINDOW_SECONDS, routeName: '/api/home' }),
    (req, res) => {
        res.json({ message: 'Success! Welcome to Home. (High limit)' });
    }
);

router.get('/search',
    rateLimiter({ limit: SEARCH_LIMIT, windowSeconds: WINDOW_SECONDS, routeName: '/api/search' }),
    (req, res) => {
        res.json({ message: 'Success! Search results here. (Medium limit)' });
    }
);

router.post('/login',
    rateLimiter({ limit: LOGIN_LIMIT, windowSeconds: WINDOW_SECONDS, routeName: '/api/login' }),
    (req, res) => {
        res.json({ message: 'Success! Logged in securely. (Strict limit)' });
    }
);

module.exports = router;
