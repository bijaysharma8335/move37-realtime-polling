const express = require("express");

const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "" },
});

//---websocket setup----

io.on("connection", (socket) => {
    console.log("New Client: !", socket.id);

    socket.on("joinPoll", ({ pollId }) => {
        socket.join(`poll_${pollId}`);
        console.log(`Client ${socket.id} joined poll_${pollId}`);
    });
    socket.on("leavePoll", ({ pollId }) => {
        socket.leave(`poll_${pollId}`);
    });
});

async function broadcastPollCounts(pollId) {
    const poll = await prisma.pollOption.findMany({ where: { pollId }, include: { votes: true } });

    const counts = options.map((o) => ({
        id: o.id,
        text: o.text,
        count: o.votes.length,
    }));

    io.to(`poll_${pollId}`).emit("pollUpdated", { pollId, options: counts });
}

//Routes
const usersRouter = require("./routes/users");
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

app.use("/api/users", usersRouter);

app.use("/api/polls", pollsRouter);

app.use("/api/votes", votesRouter);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});
