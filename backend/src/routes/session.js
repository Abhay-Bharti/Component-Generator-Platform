const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// List all sessions for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.userId }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new session
router.post('/', auth, async (req, res) => {
    try {
        const session = new Session({ user: req.user.userId, ...req.body });
        await session.save();
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single session by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const session = await Session.findOne({ _id: req.params.id, user: req.user.userId });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a session (chat/code/uiState)
router.put('/:id', auth, async (req, res) => {
    try {
        const session = await Session.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            req.body,
            { new: true }
        );
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Chat with AI and update session
router.post('/:id/chat', auth, async (req, res) => {
    const { prompt } = req.body;
    try {
        const session = await Session.findOne({ _id: req.params.id, user: req.user.userId });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        // Append strict instructions to the user prompt
        const strictInstructions = `\n\nIMPORTANT:\n- Only output a single valid React functional component in a \`\`\`jsx code block.\`\`\`\n- Do NOT include any import or export statements.\n- Use React hooks like React.useState() directly (do NOT import useState).\n- Do NOT include any explanations, comments, or extra text.\n- If CSS is needed, output it in a separate \`\`\`css code block, and use matching className attributes in the JSX.\`\`\`\n- Do NOT output any code or explanation for other languages or frameworks.\n- The code must be ready to run in a React sandbox like react-live.`;
        const fullPrompt = prompt + strictInstructions;
        // Add user message to chat
        session.chat.push({ role: 'user', content: prompt });
        // Call Gemini API
        const geminiRes = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                contents: [
                    { parts: [{ text: fullPrompt }] }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": process.env.GEMINI_API_KEY
                }
            }
        );
        const aiMsg = geminiRes.data.candidates[0].content.parts[0].text;
        // Add AI message to chat
        session.chat.push({ role: 'ai', content: aiMsg });
        // Extract code (assume AI returns code in a markdown block)
        const jsxMatch = aiMsg.match(/```(?:jsx|tsx)?\n([\s\S]*?)```/);
        const cssMatch = aiMsg.match(/```css\n([\s\S]*?)```/);
        if (jsxMatch) session.code.jsx = jsxMatch[1];
        if (cssMatch) session.code.css = cssMatch[1];
        await session.save();
        res.json(session);
    } catch (err) {
        console.error('Gemini chat error:', err);
        res.status(500).json({ message: 'Gemini AI error', error: err.message });
    }
});

module.exports = router; 