import { Server, Socket } from "socket.io";
import { deleteRoom, setRoom, getRoom as gR } from "../utils/redis";
import { getRoom } from "../game/gameController";
import { generateEmptyRoom } from "../game/gameController";
import { PlayerData, SettingValue } from "../types";
import { guessWord, startGame, wordSelected } from "../game/roomController";

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
  WORD_SELECT = "wordSelect",

  // Server Events
  JOINED_ROOM = "joinedRoom",
  PLAYER_JOINED = "playerJoined",
  PLAYER_LEFT = "playerLeft",
  GAME_STARTED = "gameStarted",
  GAME_ENDED = "gameEnded",
  DRAW_DATA = "drawData",
  GUESSED = "guessed",
  TURN_END = "turnEnded",
  CHOOSE_WORD = "chooseWord",
  WORD_CHOSEN = "wordChosen",
  SETTINGS_CHANGED = "settingsChanged",
  GUESS_FAIL = "guessFail",
}

export function setupSocket(io: Server) {
  io.on(GameEvent.CONNECT, (socket: Socket) => {
    console.log("A user connected:", socket.id);
    socket.on(
      GameEvent.JOIN_ROOM,
      async (playerData: PlayerData, roomId?: string) => {
        if (!playerData) {
          socket.emit("error", "playerData is required");
          socket.disconnect();
          return;
        }
        if (!roomId) {
          const newRoomId = await generateEmptyRoom(socket, playerData);
          socket.join(newRoomId);
          const room = await gR(newRoomId);
          io.to(newRoomId).emit(GameEvent.JOINED_ROOM, room);
        } else {
          let room = await gR(roomId);
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
          io.to(room.roomId).emit(GameEvent.PLAYER_JOINED, player);
        }
      }
    );

    socket.on(GameEvent.START_GAME, async () => {
      const room = await getRoom(socket);
      if (!room) return;
      if (room.creator != socket.id)
        return socket.emit("error", "You are not the host");
      if (room.gameState.currentRound != 0)
        return socket.emit("error", "Game already started");
      if (socket.id != room.creator)
        return socket.emit("error", "You cannot start the game");

      if (room.players.length < 2) {
        return socket.emit("error", "At least 2 players requred to join game");
      }

      await startGame(room, io);
    });

    socket.on(GameEvent.DRAW, async (drawData: any) => {
      const room = await getRoom(socket);
      if (!room) return;
      if (room.gameState.currentRound === 0) return;
      const currentPlayer = room.players[room.gameState.currentPlayer];
      if (!currentPlayer) return;
      if (currentPlayer.playerId != socket.id) return;
      room.gameState.drawingData.push(drawData);
      await setRoom(room.roomId, room);
      socket.to(room.roomId).emit(GameEvent.DRAW_DATA, drawData);
    });

    socket.on(GameEvent.GUESS, async (data: any) => {
      const { guess }: { guess: string } = data;
      const room = await getRoom(socket);
      if (!room) return;
      await guessWord(room.roomId, guess, socket, io);
    });

    socket.on(GameEvent.WORD_SELECT, async (word: string) => {
      const room = await getRoom(socket);
      if (!room) return;
      await wordSelected(room.roomId, word, io);
    });

    socket.on(
      GameEvent.CHANGE_SETTIING,
      async (setting: string, value: number) => {
        const room = await getRoom(socket);
        if (!room) return;
        switch (setting) {
          case SettingValue.players:
            room.settings.players = value;
            break;
          case SettingValue.drawTime:
            room.settings.drawTime = value;
            break;
          case SettingValue.rounds:
            room.settings.rounds = value;
            break;

          default:
            socket.emit("error", "Invalid setting value");
            break;
        }
        await setRoom(room.roomId, room);
        io.to(room.roomId).emit(GameEvent.SETTINGS_CHANGED, setting, value);
      }
    );

    socket.on(GameEvent.DISCONNECT, async () => {
      console.log("User disconnected:", socket.id);
      const room = await getRoom(socket);
      if (!room) return;
      const player = room.players.find((e) => e.playerId === socket.id);
      if (!player) return;
      room.players = room.players.filter((e) => e.playerId != socket.id);
      if (room.players.length === 0) {
        await deleteRoom(room.roomId);
        return;
      }
      if (room.creator === player.playerId) {
        room.creator = room.players[0].playerId;
      }

      await setRoom(room.roomId, room);
      socket.to(room.roomId).emit(GameEvent.PLAYER_LEFT, player);
    });
  });
}
