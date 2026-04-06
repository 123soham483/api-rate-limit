const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Keep track of traffic in memory for new clients joining
const trafficHistory = [];
const MAX_HISTORY = 100;

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Configure express
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// Expose io to routes/middleware
app.set('io', io);

// Intercept emits to maintain a history buffer
const originalEmit = io.emit.bind(io);
io.emit = (event, data) => {
    if (event === 'traffic_event') {
        trafficHistory.unshift(data);
        if (trafficHistory.length > MAX_HISTORY) {
            trafficHistory.pop();
        }
    }
    originalEmit(event, data);
};

// WebSocket connection for dashboard live feed
io.on('connection', (socket) => {
    console.log('Dashboard connected:', socket.id);
    // Send recent history to newly connected clients
    socket.emit('traffic_history', trafficHistory);

    socket.on('disconnect', () => {
        console.log('Dashboard disconnected:', socket.id);
    });
});

app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
