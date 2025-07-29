// Entry point for backend

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { client: redisClient } = require('./config/redis');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Wait for Redis connection
redisClient.on('ready', () => {
    console.log('Redis connected and ready');
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => res.send('Backend API running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));