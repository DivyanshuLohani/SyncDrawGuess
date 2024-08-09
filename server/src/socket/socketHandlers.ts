import { Server, Socket } from "socket.io";
import { deleteRoom, getRoom, setRoom } from "../utils/redis";
import { generateEmptyRoom } from "../game/gameController";
import { PlayerData, SettingValue } from "../types";
import { startGame } from "../game/roomController";

export enum GameEvent {
  // CLient Events
  CONNECT = "connect",
  DISCONNECT = "disconnecting",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DRAW = "draw",
  GUESS = "guess",
  CHANGE_SETTIING = "changeSettings",

  // Server Events
  JOINED_ROOM = "joinedRoom",
  PLAYER_JOINED = "playerJoined",
  PLAYER_LEFT = "playerLeft",
  GAME_STARTED = "gameStarted",
  DRAW_DATA = "drawData",
  GUESSED = "guessed",
  TURN_END = "turnEnded",
  CHOOSE_WORD = "chooseWord",
  WORD_CHOSEN = "wordChosen",
  SETTINGS_CHANGED = "settingsChanged",
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
            guessed: false,
            guessedAt: null,
          };
          room.players.push(player);
          await setRoom(roomId, room);

          socket.join(roomId);
          socket.emit(GameEvent.JOINED_ROOM, room);
          socket.to(room.roomId).emit(GameEvent.PLAYER_JOINED, player);
        }
      }
    );

    socket.on(GameEvent.START_GAME, async (roomId: string) => {
      const room = await getRoom(roomId);
      if (!room) return;
      if (room.gameState.currentRound != 0)
        return socket.emit("error", "Game already started");
      if (socket.id != room.creator)
        return socket.emit("error", "You cannot start the game");

      await startGame(room, io);
    });

    socket.on(GameEvent.DRAW, async (data: any) => {
      const { roomId, data: drawData } = data;
      const room = await getRoom(roomId);
      if (!room) return;
      if (room.gameState.currentPlayer ?? "" != socket.id) return;
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
        player.guessed = true;
        player.guessedAt = new Date();
        await setRoom(roomId, room);
        io.to(roomId).emit(GameEvent.GUESSED, socket.id);
      } else {
        socket.to(roomId).emit(GameEvent.GUESS, player, guess);
      }

      console.log(`Guess "${guess}" sent to room ${roomId}`);
    });

    socket.on(GameEvent.CHANGE_SETTIING, async (data: any) => {
      const { roomId, setting, value } = data;
      const room = await getRoom(roomId);
      if (!room) return;
      switch (setting) {
        case SettingValue.players:
          room.settings.players = value;
          break;
        case SettingValue.drawTime:
          room.settings.drawTime = value;
        case SettingValue.rounds:
          room.settings.rounds = value;

        default:
          socket.emit("error", "Invalid setting value");
          break;
      }
      await setRoom(roomId, room);
      io.to(roomId).emit(GameEvent.SETTINGS_CHANGED, setting, value);
    });

    socket.on(GameEvent.DISCONNECT, async () => {
      console.log("User disconnected:", socket.id);
      const roomId = Array.from(socket.rooms)[1] as string;
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
