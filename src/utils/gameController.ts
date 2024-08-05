import { Socket } from "socket.io";
import { setRoom } from "./redis";
import { Player, PlayerData, Room } from "../types";

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
  };

  const room: Room = {
    roomId,
    creator: socket.id,
    players: [player],
    gameState: {
      currentRound: -1,
      drawingData: [],
      guessedWords: [],
      word: "",
    },
  };

  await setRoom(roomId, room);
  return roomId;
}
