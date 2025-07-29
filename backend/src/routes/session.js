const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const axios = require('axios');
const { cacheUtils } = require('../config/redis');

const router = express.Router();

// List all sessions for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const cacheKey = `sessions:${req.user.userId}`;

        // Try to get from cache first
        let sessions = await cacheUtils.get(cacheKey);

        if (!sessions) {
            // If not in cache, get from database
            sessions = await Session.find({ user: req.user.userId }).sort({ updatedAt: -1 });
            // Cache for 5 minutes
            await cacheUtils.set(cacheKey, sessions, 300);
        }

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

        // Invalidate sessions list cache
        const sessionsCacheKey = `sessions:${req.user.userId}`;
        await cacheUtils.del(sessionsCacheKey);

        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single session by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const cacheKey = `session:${req.params.id}:${req.user.userId}`;

        // Try to get from cache first
        let session = await cacheUtils.getSession(cacheKey);

        if (!session) {
            // If not in cache, get from database
            session = await Session.findOne({ _id: req.params.id, user: req.user.userId });
            if (!session) return res.status(404).json({ message: 'Session not found' });
            // Cache session data (no TTL for active sessions)
            await cacheUtils.setSession(cacheKey, session);
        }

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

        // Update cache
        const cacheKey = `session:${req.params.id}:${req.user.userId}`;
        await cacheUtils.setSession(cacheKey, session);

        // Invalidate sessions list cache
        const sessionsCacheKey = `sessions:${req.user.userId}`;
        await cacheUtils.del(sessionsCacheKey);

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
        // Check if this is a property override request
        const isOverrideRequest = prompt.toLowerCase().includes('modify the element') || prompt.toLowerCase().includes('element with id');

        let strictInstructions;
        if (isOverrideRequest) {
            strictInstructions = `\n\nIMPORTANT:\n- This is a property override request. Only modify the specified element.\n- Output the complete updated React component in a \`\`\`jsx code block.\`\`\`\n- Do NOT include any import or export statements.\n- Use React hooks like React.useState() directly (do NOT import useState).\n- If CSS changes are needed, output them in a separate \`\`\`css code block.\`\`\`\n- Do NOT include any explanations, comments, or extra text.\n- The code must be ready to run in a React sandbox.`;
        } else {
            strictInstructions = `\n\nCRITICAL REQUIREMENTS FOR REACT-LIVE:\n- Output ONLY a complete, valid React functional component in a \`\`\`jsx code block.\`\`\`\n- The component MUST be complete with proper opening and closing braces.\n- Do NOT include any import or export statements.\n- Use React hooks like React.useState() directly (do NOT import useState).\n- Ensure all JSX elements are properly closed.\n- Ensure all function braces are properly closed.\n- If CSS is needed, output it in a separate \`\`\`css code block.\`\`\`\n- Do NOT include any explanations, comments, or extra text outside the code blocks.\n- The code must be ready to run in a React sandbox.\n\nEXACT FORMAT FOR REACT-LIVE:\n\`\`\`jsx\nfunction ComponentName() {\n  const [state, setState] = React.useState(initialValue);\n  \n  const handleClick = () => {\n    setState(newValue);\n  };\n  \n  return (\n    <div className="container">\n      <h1>Title</h1>\n      <button onClick={handleClick}>Click me</button>\n    </div>\n  );\n}\n\`\`\`\n\nIMPORTANT:\n- Component must end with closing brace }\n- JSX must end with closing parenthesis )\n- No trailing commas or extra characters\n- No incomplete statements`;
        }

        // Build context from chat history and current code
        let contextPrompt = '';

        // Add chat history for context (last 5 messages to avoid token limits)
        const recentChat = session.chat.slice(-5);
        if (recentChat.length > 0) {
            contextPrompt += 'Previous conversation:\n';
            recentChat.forEach(msg => {
                contextPrompt += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
            });
            contextPrompt += '\n';
        }

        // Add current code context
        if (session.code.jsx || session.code.css) {
            contextPrompt += 'Current React component:\n';
            if (session.code.jsx) {
                contextPrompt += `JSX:\n\`\`\`jsx\n${session.code.jsx}\n\`\`\`\n`;
            }
            if (session.code.css) {
                contextPrompt += `CSS:\n\`\`\`css\n${session.code.css}\n\`\`\`\n`;
            }
            contextPrompt += '\n';
        }

        // Add the new user prompt
        contextPrompt += `User request: ${prompt}\n`;

        const fullPrompt = contextPrompt + strictInstructions;

        // Debug: Log the context being sent (remove in production)
        console.log('=== AI Context ===');
        console.log('Recent chat:', recentChat.length, 'messages');
        console.log('Current JSX length:', session.code.jsx?.length || 0);
        console.log('Current CSS length:', session.code.css?.length || 0);
        console.log('User request:', prompt);
        console.log('==================');

        // Only add user message if it's not already the last message
        const lastMessage = session.chat[session.chat.length - 1];
        if (!lastMessage || lastMessage.content !== prompt) {
            session.chat.push({ role: 'user', content: prompt });
        }

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

        // Extract code with better error handling
        const jsxMatch = aiMsg.match(/```(?:jsx|tsx)?\n([\s\S]*?)```/);
        const cssMatch = aiMsg.match(/```css\n([\s\S]*?)```/);

        if (jsxMatch) {
            let jsxCode = jsxMatch[1].trim();

            // Clean up common issues
            jsxCode = jsxCode.replace(/^\s*import.*$/gm, ''); // Remove import statements
            jsxCode = jsxCode.replace(/^\s*export.*$/gm, ''); // Remove export statements
            jsxCode = jsxCode.replace(/,\s*$/, ''); // Remove trailing commas
            jsxCode = jsxCode.replace(/\s+$/, ''); // Remove trailing whitespace

            // Ensure component ends properly
            if (!jsxCode.endsWith('}')) {
                jsxCode += '\n}';
            }

            session.code.jsx = jsxCode;
        }

        if (cssMatch) {
            session.code.css = cssMatch[1].trim();
        }
        await session.save();

        // Update cache
        const cacheKey = `session:${req.params.id}:${req.user.userId}`;
        await cacheUtils.setSession(cacheKey, session);

        // Invalidate sessions list cache
        const sessionsCacheKey = `sessions:${req.user.userId}`;
        await cacheUtils.del(sessionsCacheKey);

        res.json(session);
    } catch (err) {
        console.error('Gemini chat error:', err);
        res.status(500).json({ message: 'Gemini AI error', error: err.message });
    }
});

module.exports = router; 