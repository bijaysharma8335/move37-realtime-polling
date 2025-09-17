// --- Core imports ---
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// --- Config & initialization ---
dotenv.config(); // Load environment variables from .env
const prisma = new PrismaClient(); // Prisma ORM client
const app = express(); 


// --- Middlewares ---
app.use(cors());           // Enable CORS (cross-origin requests)
app.use(express.json());   // Parse JSON request bodies


// --- HTTP + WebSocket Server ---
const server = http.createServer(app); // Create HTTP server for Express
const io = new Server(server, {
    cors: { origin: "" },  // Allow all origins ( can restrict in prod)
});

// --- WebSocket setup ---
io.on("connection", (socket) => {
    console.log("New Client connected:", socket.id);

    // Join a specific poll room
    socket.on("joinPoll", ({ pollId }) => {
        socket.join(`poll_${pollId}`);
        console.log(`Client ${socket.id} joined poll_${pollId}`);
    });

    // Leave a poll room
    socket.on("leavePoll", ({ pollId }) => {
        socket.leave(`poll_${pollId}`);
        console.log(`Client ${socket.id} left poll_${pollId}`);
    });
});

// --- Broadcast updated vote counts to all clients in a poll room ---
async function broadcastPollCounts(pollId) {
    // Fetch poll options and their votes from DB
    const options = await prisma.pollOption.findMany({
        where: { pollId },
        include: { votes: true },
    });

    // Count votes for each option
    const counts = options.map((o) => ({
        id: o.id,
        text: o.text,
        count: o.votes.length,
    }));

    // Emit updated results to all clients in the poll room
    io.to(`poll_${pollId}`).emit("pollUpdated", { pollId, options: counts });
}

// --- Routes ---
const usersRouter = require("./routes/users"); // User routes
const pollsRouter = require("./routes/polls")({
    broadcastPollCounts,
    prisma,
    io,
});
const votesRouter = require("./routes/votes")({
    broadcastPollCounts,
    prisma,
    io,
});

// Register routes under /api/*
app.use("/api/users", usersRouter);
app.use("/api/polls", pollsRouter);
app.use("/api/votes", votesRouter);

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});
