import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", function (req, res) {
  res.sendFile(`${process.cwd()}/static/index.html`);
});

io.on("connection", (socket) => {
  console.log("New Connection", socket);
});

server.listen(3000, function () {
  console.log("listening on *:3000");
});
