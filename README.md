# Real-time Polling Backend

This is a complete backend scaffold for the Move37 Ventures Backend Developer Challenge: a real-time polling API using Node.js, Express, PostgreSQL and Prisma, with Socket.IO for live updates.

## Features
- REST API: Users, Polls (with options), Votes
- Prisma schema modeling one-to-many and many-to-many (Vote) relationships
- Socket.IO broadcasting of live vote counts to clients subscribed to a poll
- Seed script to create example data

## Setup (local)
1. Install dependencies:
```bash
npm install
```

2. Create a PostgreSQL database and set `DATABASE_URL` in `.env` (copy from `.env.example`)

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run migrations (optional) or use Prisma Studio / seed:
```bash
npx prisma db push
node prisma/seed.js
```

5. Start the server:
```bash
npm run start
```

Server runs on `http://localhost:4000` by default.

## API Endpoints (summary)
- `POST /api/users` → create user
- `GET /api/users/:id` → get user
- `POST /api/polls` → create poll with options
- `GET /api/polls/:id` → get poll with options and vote counts
- `POST /api/votes` → submit a vote (body: userId, pollOptionId)

## WebSocket
Connect to the server using Socket.IO and join a poll room:
```js
const socket = io('http://localhost:4000');
socket.emit('joinPoll', { pollId: 1 });
socket.on('pollUpdated', data => console.log(data));
```

When a vote is cast, server emits `pollUpdated` to clients in that poll room with latest counts.

## Notes
- Passwords are stored as `passwordHash` (for demo seed we insert plain strings; replace with proper hashing in production)
- This scaffold aims to be minimal and clear for the assignment. Extend as needed.

