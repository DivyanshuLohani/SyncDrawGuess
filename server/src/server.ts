import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { setupSocket } from "./socket/socketHandlers";

const publicDirectoryPath = path.join(__dirname, "/public");

const app = express();
const server = http.createServer(app);
app.use(cors());

// app.use(express.static(publicDirectoryPath));

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
setupSocket(io);

server.listen(8000, function () {
  console.log("listening on *:8000");
});
