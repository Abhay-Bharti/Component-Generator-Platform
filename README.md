# Coder: AI React Component Generator Platform

A modern, AI-driven micro-frontend playground where authenticated users can generate, preview, tweak, and export React components or full pages. All chat history and code edits are preserved across logins.

---

## 🚀 Features
- **Authentication:** Secure JWT sessions, password hashing
- **Session Management:** Create, list, and resume previous sessions (with chat/code history)
- **Conversational UI:** Side-panel chat with AI (Gemini, OpenAI, or OpenRouter)
- **Live Preview:** Render generated React code in a real React sandbox
- **Code Inspection & Export:** View/edit JSX & CSS, copy/download as .zip
- **Iterative Workflow:** Refine components with further prompts or manual edits
- **Modern UI:** ChatGPT-inspired dashboard, sidebar navigation, custom loader, toast notifications
- **Statefulness:** Auto-save after every chat/code edit, restore on login/reload

---

## 🧰 Tech Stack
- **Frontend:** React, Next.js, Tailwind CSS, react-live, react-hot-toast
- **Backend:** Node.js, Express, MongoDB, JWT, bcrypt, Gemini/OpenAI API
- **State:** React hooks, cookies, REST API
- **Other:** Docker-ready, Vercel/Render deployable

---

## 🛠️ Setup & Development

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd ComponentGenerator
```

### 2. Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure environment variables
- Copy `.env.example` to `.env` in both `backend/` and `frontend/` (if needed)
- Set your MongoDB URI, JWT secret, and Gemini/OpenAI API key in `backend/.env`:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the app locally
- **Backend:**
  ```bash
  cd backend
  npm run dev
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```
- Visit [http://localhost:3000](http://localhost:3000)

---

## 📝 Usage
- Register/login to create your account
- Start a new chat or select a previous session from the sidebar
- Enter prompts to generate React components/pages
- Edit JSX/CSS directly, preview live, and export code
- All changes are auto-saved and restorable

---

## 📦 Deployment
- Deploy frontend to Vercel/Netlify
- Deploy backend to Render/Heroku/AWS
- Use managed MongoDB (e.g., Atlas)

---

## 📄 License
MIT 