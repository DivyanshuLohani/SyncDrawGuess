import { Server, Socket } from "socket.io";
import { getRoom, setRoom } from "../utils/redis";
import { generateEmptyRoom } from "../utils/gameController";
import { PlayerData } from "../types";

enum GameEvent {
  // CLient Events
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DRAW = "draw",
  GUESS = "guess",

  // Server Events
  JOINED_ROOM = "joinedRoom",
  PLAYER_JOINED = "playerJoined",
  LEFT_ROOM = "leftRoom",
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

    // socket.on(GameEvent.LEAVE_ROOM, (roomId: string) => {
    //   socket.leave(roomId);
    //   console.log(`User ${socket.id} left room ${roomId}`);
    //   io.to(roomId).emit("message", `${socket.id} has left the room.`);
    // });

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

    socket.on(GameEvent.GUESS, (data: any) => {
      const { roomId, guess } = data;
      socket.to(roomId).emit(GameEvent.GUESSED, guess);
      console.log(`Guess "${guess}" sent to room ${roomId}`);
    });

    socket.on(GameEvent.DISCONNECT, () => {
      console.log("User disconnected:", socket.id);
      // const rooms = await getRooms
    });
  });
}
