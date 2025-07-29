const redis = require('redis');

// Create Redis client
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle connection events
client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

client.on('ready', () => {
    console.log('Redis client ready');
});

// Connect to Redis
(async () => {
    await client.connect();
})();

// Cache utility functions
const cacheUtils = {
    // Set cache with TTL (default 1 hour)
    async set(key, value, ttl = 3600) {
        try {
            await client.setEx(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Redis set error:', error);
        }
    },

    // Get cache value
    async get(key) {
        try {
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    },

    // Delete cache key
    async del(key) {
        try {
            await client.del(key);
        } catch (error) {
            console.error('Redis del error:', error);
        }
    },

    // Set cache without TTL (for session data)
    async setSession(key, value) {
        try {
            await client.set(key, JSON.stringify(value));
        } catch (error) {
            console.error('Redis setSession error:', error);
        }
    },

    // Get session data
    async getSession(key) {
        try {
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis getSession error:', error);
            return null;
        }
    }
};

module.exports = { client, cacheUtils }; 