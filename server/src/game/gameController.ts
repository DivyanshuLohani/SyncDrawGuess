import { Socket } from "socket.io";
import { setRedisRoom } from "../utils/redis";
import {
  Languages,
  Player,
  PlayerData,
  Room,
  RoomState,
  Settings,
} from "../types";
import { getRedisRoom as gR } from "../utils/redis";
import { DEFAULT_GAME_SETTINGS } from "../constants";

export function generateRoomId() {
  return String("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx").replace(
    /[xy]/g,
    (character) => {
      const random = (Math.random() * 16) | 0;
      const value = character === "x" ? random : (random & 0x3) | 0x8;

      return value.toString(16);
    }
  );
}

export async function generateEmptyRoom(
  socket: Socket,
  isPrivate: boolean = false,
  language: Languages = Languages.en
) {
  const roomId = generateRoomId();

  const room: Room = {
    roomId,
    creator: isPrivate ? socket.id : null,
    players: [],
    gameState: {
      currentRound: 0,
      drawingData: [],
      guessedWords: [],
      word: "",
      currentPlayer: 0,
      hintLetters: [],
      roomState: RoomState.NOT_STARTED,
      timerStartedAt: new Date(),
    },
    settings: { ...DEFAULT_GAME_SETTINGS, language },
    isPrivate,
    vote_kickers: [],
  };

  await setRedisRoom(roomId, room);
  return roomId;
}

export async function getRoomFromSocket(socket: Socket) {
  if (!socket) return null;
  const roomId = Array.from(socket.rooms)[1] as string;
  if (!roomId) return null;
  const room = await gR(roomId);
  return room;
}
