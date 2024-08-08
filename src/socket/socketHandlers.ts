import { Server, Socket } from "socket.io";
import { deleteRoom, getRoom, setRoom } from "../utils/redis";
import { generateEmptyRoom } from "../utils/gameController";
import { PlayerData } from "../types";

enum GameEvent {
  // CLient Events
  CONNECT = "connect",
  DISCONNECT = "disconnecting",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DRAW = "draw",
  GUESS = "guess",

  // Server Events
  JOINED_ROOM = "joinedRoom",
  PLAYER_JOINED = "playerJoined",
  PLAYER_LEFT = "playerLeft",
  GAME_STARTED = "gameStarted",
  DRAW_DATA = "drawData",
  GUESSED = "guessed",
  // GUESS_CLOSE = "guessClose"
}

export function setupSocket(io: Server) {
  io.on(GameEvent.CONNECT, (socket: Socket) => {
    console.log("A user connected:", socket.id);
    socket.on(
      GameEvent.JOIN_ROOM,
      async (playerData: PlayerData, roomId?: string) => {
        console.log(playerData, roomId);
        if (!playerData) {
          socket.emit("error", "playerData is required");
          socket.disconnect();
          return;
        }
        if (!roomId) {
          const newRoomId = await generateEmptyRoom(socket, playerData);
          socket.join(newRoomId);
          const room = await getRoom(newRoomId);
          io.to(newRoomId).emit(GameEvent.JOINED_ROOM, room);
        } else {
          let room = await getRoom(roomId);
          if (!room) {
            socket.emit("error", "Invalid Room ID");
            socket.disconnect();

            return;
          }
          const player = {
            ...playerData,
            score: 0,
            playerId: socket.id,
          };
          room.players.push(player);
          await setRoom(roomId, room);

          socket.join(roomId);
          socket.emit(GameEvent.JOINED_ROOM, room);
          socket.to(room.roomId).emit(GameEvent.PLAYER_JOINED, player);
        }
      }
    );

    socket.on(GameEvent.START_GAME, (roomId: string) => {
      io.to(roomId).emit("gameStarted", { message: "The game has started!" });
      console.log(`Game started in room ${roomId}`);
    });

    socket.on(GameEvent.DRAW, async (data: any) => {
      const { roomId, data: drawData } = data;
      const room = await getRoom(roomId);
      room?.gameState.drawingData.push(drawData);
      await setRoom(roomId, room);
      socket.to(roomId).emit(GameEvent.DRAW_DATA, drawData);
    });

    socket.on(GameEvent.GUESS, async (data: any) => {
      const { roomId, guess }: { roomId: string; guess: string } = data;
      const room = await getRoom(roomId);
      if (!room) return;
      const player = room.players.find((e) => e.playerId == socket.id);
      if (!player) return;
      if (room.gameState.word === guess.toLowerCase()) {
        // Word Guessed
        // Returns player id
        io.to(roomId).emit(GameEvent.GUESSED, socket.id);
      } else {
        socket.to(roomId).emit(GameEvent.GUESS, player, guess);
      }

      console.log(`Guess "${guess}" sent to room ${roomId}`);
    });

    socket.on(GameEvent.DISCONNECT, async () => {
      console.log("User disconnected:", socket.id);
      const roomId = Array.from(socket.rooms)[1];
      const room = await getRoom(roomId);
      if (!room) return;
      const player = room.players.find((e) => e.playerId === socket.id);
      if (!player) return;
      room.players = room.players.filter((e) => e.playerId != socket.id);
      if (room.players.length === 0) {
        await deleteRoom(roomId);
        return;
      }
      await setRoom(roomId, room);
      socket.to(roomId).emit(GameEvent.PLAYER_LEFT, player);
    });
  });
}
