import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket) => {
  console.log("✅ socket connected:", socket.id);
  const userId = socket.handshake.auth.userId;
  if (userId) {
    socket.join(userId);
    console.log("👤 joined room:", userId);
  }

  socket.on("disconnect", () => {
    console.log("❌ socket disconnected:", socket.id);
  });
});

// 🔥 HTTP endpoint to trigger emits from Next.js
app.post("/emit-name-update", (req, res) => {
  const { userId, preferredName } = req.body;
  io.to(userId).emit("preferred_name_updated", { preferredName });
  console.log(`🔥 emitted new name to ${userId}: ${preferredName}`);
  res.send({ ok: true });
});

httpServer.listen(4000, () => {
  console.log("🚀 Socket server + HTTP running on port 4000");
});
