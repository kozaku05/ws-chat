const express = require("express");
const http = require("http");
const websocket = require("ws");
const app = express();
const server = http.createServer(app);
const port = 3001;
server.listen(port);
app.use(express.static("./public"));
const wss = new websocket.Server({ server });
const rooms = new Map();
wss.on("connection", (ws) => {
  let roomId = null;
  let userName = null;
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "join") {
      if (!data.roomId || !data.userName) {
        return;
      }
      roomId = data.roomId;
      userName = data.userName;
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { user: new Set(), data: [] });
      }
      rooms.get(roomId).user.add(ws);
      if (rooms.get(roomId).data.length > 0) {
        ws.send(JSON.stringify({ type: "log", log: rooms.get(roomId).data }));
      }
      rooms.get(roomId).user.forEach((socket) => {
        socket.send(JSON.stringify({ type: "join", userName: userName }));
      });
      console.log("joined", userName);
    } else {
      if (!data.message) {
        return;
      }
      const message = data.message;
      if (rooms.has(roomId)) {
        rooms.get(roomId).data.push({ userName, message });
        rooms.get(roomId).user.forEach((socket) => {
          socket.send(
            JSON.stringify({
              type: "message",
              message: message,
              userName: userName,
            })
          );
        });
      }
    }
  });
  ws.on("close", () => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).user.delete(ws);
      if (rooms.get(roomId).user.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
});
