import { Socket } from "socket.io";
import { setRoom } from "../utils/redis";
import { Player, PlayerData, Room } from "../types";
import { getRoom as gR } from "../utils/redis";

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

export async function generateEmptyRoom(socket: Socket, host: PlayerData) {
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
    settings: {
      players: 3,
      rounds: 3,
      drawTime: 60,
      customWords: [],
      onlyCustomWords: false,
    },
  };

  await setRoom(roomId, room);
  return roomId;
}

export async function getRoom(socket: Socket) {
  if (!socket) return null;
  const roomId = Array.from(socket.rooms)[1] as string;
  if (!roomId) return null;
  const room = await gR(roomId);
  return room;
}
