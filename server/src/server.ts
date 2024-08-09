import express from "express";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { Room } from "./types";
import { setupSocket } from "./socket/socketHandlers";

const publicDirectoryPath = path.join(__dirname, "/public");

const app = express();
app.use(express.static(publicDirectoryPath));

const server = http.createServer(app);
const io = new Server(server);
setupSocket(io);

server.listen(8000, function () {
  console.log("listening on *:8000");
});
