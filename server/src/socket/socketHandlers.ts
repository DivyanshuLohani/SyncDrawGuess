import { Server, Socket } from "socket.io";
import {
  deleteRedisRoom,
  setRedisRoom,
  getRedisRoom as gR,
} from "../utils/redis";
import { getRoomFromSocket } from "../game/gameController";
import { Player, PlayerData, Settings, SettingValue } from "../types";
import {
  endGame,
  endRound,
  guessWord,
  handleDrawAction,
  handleNewRoom,
  startGame,
  wordSelected,
} from "../game/roomController";

export enum GameEvent {
  // CLient Events
  CONNECT = "connect",
  DISCONNECT = "disconnecting",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DRAW = "draw",
  DRAW_CLEAR = "clear",
  DRAW_UNDO = "undo",
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
  CLEAR_DRAW = "clearDraw",
  UNDO_DRAW = "undoDraw",
  GUESSED = "guessed",
  TURN_END = "turnEnded",
  CHOOSE_WORD = "chooseWord",
  CHOOSING_WORD = "choosingWord",
  WORD_CHOSEN = "wordChosen",
  GUESS_WORD_CHOSEN = "guessWordChosen",
  SETTINGS_CHANGED = "settingsChanged",
  GUESS_FAIL = "guessFail",
}

export function setupSocket(io: Server) {
  io.on(GameEvent.CONNECT, (socket: Socket) => {
    console.log("A user connected:", socket.id);
    socket.on(
      GameEvent.JOIN_ROOM,
      async (playerData: PlayerData, roomId?: string, isPrivate?: boolean) => {
        if (!playerData) {
          socket.emit("error", "playerData is required");
          return socket.disconnect();
        }

        if (!roomId) {
          return await handleNewRoom(io, socket, playerData, isPrivate);
        }

        const room = await gR(roomId);
        if (!room) {
          socket.emit("error", "Invalid Room ID");
          return socket.disconnect();
        }

        if (room.players.length >= room.settings.players) {
          socket.emit("error", "The room you're trying to join is full");
          return socket.disconnect();
        }

        const player: Player = {
          ...playerData,
          score: 0,
          playerId: socket.id,
          guessed: false,
          guessedAt: null,
        };

        room.players.push(player);
        await setRedisRoom(roomId, room);

        socket.join(roomId);
        socket.emit(GameEvent.JOINED_ROOM, room);
        io.to(room.roomId).emit(GameEvent.PLAYER_JOINED, player);
      }
    );

    socket.on(GameEvent.START_GAME, async () => {
      const room = await getRoomFromSocket(socket);
      if (!room) return;
      if (room.creator != socket.id) {
        return socket.emit("error", "You are not the host");
      } else if (room.gameState.currentRound != 0) {
        return socket.emit("error", "Game already started");
      } else if (room.players.length < 2) {
        return socket.emit("error", "At least 2 players requred to join game");
      }
      await startGame(room, io);
    });

    socket.on(GameEvent.DRAW, async (drawData: any) =>
      handleDrawAction(socket, "DRAW", drawData)
    );

    socket.on(GameEvent.DRAW_CLEAR, async () =>
      handleDrawAction(socket, "CLEAR")
    );
    socket.on(GameEvent.DRAW_UNDO, async () =>
      handleDrawAction(socket, "UNDO")
    );

    socket.on(GameEvent.GUESS, async (data: any) => {
      const { guess }: { guess: string } = data;
      const room = await getRoomFromSocket(socket);
      if (!room) return;
      await guessWord(room.roomId, guess, socket, io);
    });

    socket.on(GameEvent.WORD_SELECT, async (word: string) => {
      const room = await getRoomFromSocket(socket);
      if (!room) return;
      await wordSelected(room.roomId, word, io);
    });

    socket.on(
      GameEvent.CHANGE_SETTIING,
      async (setting: keyof Settings, value: any) => {
        if (typeof setting !== "string") return;

        const room = await getRoomFromSocket(socket);
        if (!room) return;

        if (!(setting in room.settings))
          return socket.emit("error", "Invalid setting value");

        const settingType = typeof room.settings[setting];
        if (typeof value !== settingType)
          return socket.emit("error", `Invalid value type for ${setting}`);

        // @ts-ignore
        room.settings[setting] = value as SettingValue;

        await setRedisRoom(room.roomId, room);
        io.to(room.roomId).emit(GameEvent.SETTINGS_CHANGED, setting, value);
      }
    );

    socket.on(GameEvent.DISCONNECT, async () => {
      console.log("User disconnected:", socket.id);
      const room = await getRoomFromSocket(socket);
      if (!room) return;

      // Check if the player was current player
      const currentPlayer = room.players[room.gameState.currentPlayer];
      if (currentPlayer && currentPlayer.playerId === socket.id) {
        await endRound(room.roomId, io, "left");
      }

      const player = room.players.find((e) => e.playerId === socket.id);
      if (!player) return;
      room.players = room.players.filter((e) => e.playerId != socket.id);
      if (room.players.length === 0) {
        await deleteRedisRoom(room.roomId);
        return;
      }

      if (
        room.creator === player.playerId &&
        room.players.length > 0 &&
        room.isPrivate
      ) {
        room.creator = room.players[0].playerId;
      }

      await setRedisRoom(room.roomId, room);
      socket.to(room.roomId).emit(GameEvent.PLAYER_LEFT, player);
      if (room.players.length === 1 && room.gameState.currentRound >= 1) {
        // No players left in the room
        await endGame(room.roomId, io);
      }
    });
  });
}
