const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Session' },
    chat: [
        {
            role: { type: String, enum: ['user', 'ai'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    code: {
        jsx: { type: String, default: '' },
        css: { type: String, default: '' }
    },
    uiState: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema); 