# ⚡ MEMORY WARS ⚡

![Memory Wars Icon](public/game_icon.png)

*A high-stakes, tactical multiplayer memory game built for the modern web.*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🎮 Overview

**Memory Wars** is not your typical card-matching game. It's a strategic battleground where memory meets tactical abilities. Compete against a friend in real-time or challenge the **Cortex AI Engine** in a race to clear the board using energy-charged power-ups.

## ✨ Core Features

### 📡 Tactical Power-Ups

Accumulate energy by making matches and unleash devastating abilities:

- **Radar Pulse (40 Energy)**: Briefly reveal the entire board to spot hidden pairs.
- **Scramble (60 Energy)**: Reshuffle all unmatched cards on the board to disrupt your opponent's memory.
- **Ghost Eye (30 Energy)**: Permanently reveal a random hidden card for yourself.
- **EMP Shield**: (In Development) Block your opponent's ability to match cards for a turn.

### 🌐 Real-Time Multiplayer

- **Room System**: Create a private battleground with a unique 4-character code.
- **Instant Sync**: Every flip, match, and power-up usage is broadcasted instantly via Socket.io.
- **Authoritative Server**: The central server manages turns, validates moves, and prevents cheating.
- **Turn Management**: Integrated "Referee" logic ensures players follow turn sequences and handles timeouts (15s).
- **Cross-Device Synchronization**: Action relay and authoritative state management keep all players in sync, even with varying connection speeds.
- **Cross-Device**: Play seamlessly on mobile, tablet, or desktop.

### 🧠 Cortex AI Engine

Challenge a sophisticated AI with multiple difficulty levels. The AI doesn't just match cards—it strategically uses power-ups to gain the upper hand when you're winning!

### 🎨 Premium Visuals

- **3D Card Mechanics**: Realistic card flips and tactile interactions.
- **Multiple Themes**: Switch between **Space**, **Tech**, **Food**, and **Animals** themes.
- **Responsive Grid**: The game board automatically adapts to any screen size without scrolling.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd memory-wars
npm install
```

### 2. Configure Environment

Create a `.env.local` in the root:

```env
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Start Developing

**Run Backend:**

```bash
cd server
npm install
npm start
```

**Run Frontend:**

```bash
# In the root directory
npm run dev
```

---

## ☁️ Deployment Guide

### Backend (Cloud Run / Node.js)

The server is Docker-ready. To deploy the backend:

1. **Build and Push Image:**

   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/memory-wars-server ./server
   ```

2. **Deploy to Cloud Run:**

   ```bash
   gcloud run deploy memory-wars-server --image gcr.io/[PROJECT_ID]/memory-wars-server --platform managed --allow-unauthenticated
   ```

### Frontend (Vercel / Netlify / GitHub Pages)

1. **Build the Project:**

   ```bash
   npm run build
   ```

2. **Deploy:** Upload the contents of the `dist` folder to your favorite static hosting provider.

3. **Note:** Ensure `VITE_SOCKET_URL` is set to your deployed backend.

---

## 🆓 Free Deployment Guide

Want to host your game online for **$0/month**? Follow this 5-minute setup using the industry's best free tiers.

### 1. Host the Backend on Render

1. Create a free account on [Render.com](https://render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. **Settings:**
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Once deployed, copy your service URL (e.g., `https://memory-wars-api.onrender.com`).

### 2. Host the Frontend on Vercel

1. Create a free account on [Vercel.com](https://vercel.com/).
2. Click **Add New** → **Project** and import your repository.
3. **Framework Preset**: `Vite`.
4. **Important Environment Variable**:
   - Add a variable named `VITE_SOCKET_URL` and set its value to your **Render URL** from the previous step.
5. Click **Deploy**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, Socket.io.
- **State Management**: Custom React Hooks & Reducers.
- **Icons**: AI-Generated Custom Assets.

---

Developed with ❤️ for Memory Masters everywhere.
