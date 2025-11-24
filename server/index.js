const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Message = require("./models/Message");
const authRoute = require("./routes/auth");
const uploadRoute = require("./routes/upload");
const User = require("./models/User");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/chat-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/upload", uploadRoute);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Track online users: { socketId: userId }
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Handle user login/online status
  socket.on("user_connected", async (userId) => {
    onlineUsers[socket.id] = userId;
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Broadcast updated online list
    const users = await User.find({ isOnline: true }).select("-password");
    io.emit("update_user_list", users);
  });

  // Join a specific channel
  socket.on("join_channel", (channel) => {
    socket.join(channel);
    console.log(`User ${socket.id} joined channel: ${channel}`);

    // Load history for this channel
    Message.find({ channel })
      .sort({ createdAt: 1 })
      .then((messages) => {
        socket.emit("load_history", messages);
      })
      .catch((err) => console.error("Error loading history:", err));
  });

  // Send message
  socket.on("send_message", (data) => {
    const newMessage = new Message(data);
    newMessage
      .save()
      .then(() => {
        // Broadcast to the specific channel
        socket.to(data.channel).emit("receive_message", data);
      })
      .catch((err) => console.error("Error saving message:", err));
  });

  socket.on("typing", (channel) => {
    socket.to(channel).emit("typing_status", true);
  });

  socket.on("stop_typing", (channel) => {
    socket.to(channel).emit("typing_status", false);
  });

  socket.on("disconnect", async () => {
    console.log("User Disconnected", socket.id);
    const userId = onlineUsers[socket.id];
    if (userId) {
      await User.findByIdAndUpdate(userId, { isOnline: false });
      delete onlineUsers[socket.id];

      // Broadcast updated online list
      const users = await User.find({ isOnline: true }).select("-password");
      io.emit("update_user_list", users);
    }
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
