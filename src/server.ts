import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", function (req, res) {
  res.sendFile(`${process.cwd()}/static/index.html`);
});
app.get("/game.js", function (req, res) {
  res.sendFile(`${process.cwd()}/static/game.js`);
});

io.on("connection", (socket) => {
  console.log("New Connection");

  socket.emit("hello", "hello from server");

  socket.on("hi", (x) => {
    console.log(x);
  });

  socket.on("disconnect", (reason) => {
    console.log(reason);
  });
});

server.listen(3000, function () {
  console.log("listening on *:3000");
});
