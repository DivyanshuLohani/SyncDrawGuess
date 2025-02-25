import { Socket } from "socket.io";
import { setRedisRoom } from "../utils/redis";
import { Languages, Player, PlayerData, Room, Settings } from "../types";
import { getRedisRoom as gR } from "../utils/redis";

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
  host: PlayerData,
  isPrivate: boolean = false
) {
  const roomId = generateRoomId();
  const player: Player = {
    ...host,
    score: 0,
    playerId: socket.id,
    guessed: false,
    guessedAt: null,
  };

  const room: Room = {
    roomId,
    creator: socket.id,
    players: [player],
    gameState: {
      currentRound: 0,
      drawingData: [],
      guessedWords: [],
      word: "",
      currentPlayer: 0,
    },
    settings: defaultSettings,
    isPrivate,
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

const defaultSettings: Settings = {
  players: 8,
  rounds: 5,
  drawTime: 60,
  customWords: [],
  onlyCustomWords: false,
  language: Languages.en,
  wordCount: 3,
  hints: 2,
};
