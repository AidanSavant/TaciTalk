# TaciTalk

A real-time chat application built with Node.js, Express, and Socket.IO.

## Features

- **User authentication** — register and login with JWT-based session management and bcrypt password hashing
- **Real-time messaging** — messages delivered instantly via WebSockets (Socket.IO)
- **Direct and group chats** — create single or multi-user conversations
- **Friends list** — view and manage friendships
- **User profiles** — update a personal bio
- **Protected routes** — dashboard access requires a valid JWT token

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js, Express 5 |
| Real-time | Socket.IO |
| Auth | JWT, bcrypt |
| Database | MySQL (mysql2) |
| Cache | Redis |
| Frontend | Vanilla HTML/CSS/JS |

## Project Structure

```
TaciTalk/
├── server.js              # Entry point — Express app + Socket.IO setup
├── docker-compose.yml     # Redis container config
├── src/
│   ├── controllers/
│   │   ├── AuthController.js      # Register / login logic
│   │   ├── ConvoController.js     # WebSocket conversation events
│   │   ├── DashController.js      # REST handlers (conversations, users, friends)
│   │   ├── MessageController.js   # WebSocket message delivery
│   │   ├── DatabaseManager.js     # MySQL query layer
│   │   └── RedisManager.js        # Redis client wrapper
│   └── routers/
│       ├── AuthRouter.js          # POST /api/register, /api/login
│       ├── DashRouter.js          # REST API for dashboard data
│       └── WSRouter.js            # Socket.IO event routing
└── public/
    ├── index.html                 # Landing / login page
    ├── pages/
    │   ├── dashboard.html         # Main chat UI (auth-protected)
    │   └── unauthorized.html      # 401 page
    ├── js/
    │   ├── auth.js                # Login/register form logic
    │   ├── dashScript.js          # Dashboard UI and conversation logic
    │   └── chat.js                # Real-time chat client
    └── styles/                    # CSS per page
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database
- Redis (via Docker or local install)

### Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```
   JWT_SECRET=your_secret_here
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=tacitalk
   ```

3. Start Redis:
   ```bash
   docker-compose up -d
   ```

4. Start the server:
   ```bash
   node server.js
   ```

5. Open `http://localhost:5050` in your browser.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Create a new account |
| POST | `/api/login` | Login and receive a JWT |
| GET | `/api/conversations/:id` | Get conversations for a user |
| POST | `/api/conversations` | Create a new conversation |
| GET | `/api/users` | List all users |
| GET | `/api/friends/:id` | Get a user's friends |

**WebSocket events:**

| Event (client → server) | Description |
|---|---|
| `join_conversation` | Join a conversation room |
| `send_message` | Send a message to a conversation |
| `conversation_created` | Notify members of a new conversation |
