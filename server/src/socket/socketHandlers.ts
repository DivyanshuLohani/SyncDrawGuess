import { Server, Socket } from "socket.io";
import {
  deleteRedisRoom,
  setRedisRoom,
  getRedisRoom as gR,
} from "../utils/redis";
import { getRoomFromSocket } from "../game/gameController";
import {
  GameEvent,
  Player,
  PlayerData,
  Settings,
  SettingValue,
} from "../types";
import {
  endGame,
  endRound,
  guessWord,
  handleDrawAction,
  handleNewRoom,
  handlePlayerLeft,
  handleSettingsChange,
  startGame,
  wordSelected,
} from "../game/roomController";

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

    socket.on(GameEvent.START_GAME, async ({ words }: { words: string[] }) => {
      const room = await getRoomFromSocket(socket);
      if (!room) return;
      if (room.creator != socket.id) {
        return socket.emit("error", "You are not the host");
      } else if (room.gameState.currentRound != 0) {
        return socket.emit("error", "Game already started");
      } else if (room.players.length < 2) {
        return socket.emit("error", "At least 2 players requred to join game");
      }
      if (words) {
        room.settings.customWords = words;
        await setRedisRoom(room.roomId, room);
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
        await handleSettingsChange(socket, io, setting, value);
      }
    );

    socket.on(GameEvent.DISCONNECT, async () => {
      console.log("User disconnected:", socket.id);
      handlePlayerLeft(socket, io);
    });
  });
}
