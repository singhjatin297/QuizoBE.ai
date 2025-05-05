import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import { signPayload, verifyToken } from "./utils/jwt.js";
import { registerAuthHandler } from "./socketHandlers/handleAuth.js";
import { registerChatHandler } from "./socketHandlers/handleChat.js";
import { users } from "./users.js";
import cors from "cors";
import router from "./routes/index.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", router);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Token does not exist"));
  }

  try {
    const user = verifyToken(token);
    if (!user) {
      return next(new Error("No Valid User"));
    }
    socket.data.user = user;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }
    return next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`user is connected: ${socket.data.user.username}`);
  // socket.on("chat message", (msg) => {
  //   console.log("message: " + msg);
  //   io.emit("chat message", msg);
  // });

  registerAuthHandler(socket);
  registerChatHandler(io, socket);

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.data.user.username}`);
  });

  return io;
});

app.get("/", (req, res) => {
  res.send("Backend is up !!");
});

app.get("/users", (req, res) => {
  const data = users.map((user) => ({ id: user.id, username: user.username }));
  res.json(data);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    console.log("Invalid Credentials");
    return;
  }

  const token = signPayload({ id: user.id, username: user.username });

  res.json({ token });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
