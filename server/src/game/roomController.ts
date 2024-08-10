import { Server } from "socket.io";
import { Room } from "../types";
import { getRoom, setRoom } from "../utils/redis";
import { GameEvent } from "../socket/socketHandlers";
import { getRandomWords } from "../utils/word";

const DRAWER_POINTS = 50;
const BONUS_PER_GUESS = 20;
const MAX_WORD_SELECT_TIME = 30 * 1000; // 30s

export async function startGame(room: Room, io: Server) {
  room.gameState.currentRound = 1;
  room.gameState.currentPlayer = 0;
  await setRoom(room.roomId, room);
  io.to(room.roomId).emit(GameEvent.GAME_STARTED, room);
  await nextRound(room.roomId, io);
  return room;
}

export async function endRound(roomId: string, io: Server) {
  const room = await getRoom(roomId);
  if (!room) return;
  if (room.gameState.currentPlayer + 1 < room.players.length) {
    room.gameState.currentPlayer = room.gameState.currentPlayer + 1;
  } else {
    room.gameState.currentRound = room.gameState.currentRound + 1;
    room.gameState.currentPlayer = 0;
  }
  room.gameState.drawingData = [];
  await givePoints(room);
  io.to(room.roomId).emit(GameEvent.TURN_END, room);
  if (room.gameState.currentRound >= room.settings.rounds) {
    await endGame(roomId, io);
  }
  await nextRound(roomId, io);
}

export async function nextRound(roomId: string, io: Server) {
  const room = await getRoom(roomId);
  if (!room) return;

  const words = await getRandomWords(3);
  io.to(room.players[room.gameState.currentPlayer].playerId).emit(
    GameEvent.CHOOSE_WORD,
    words
  );

  setTimeout(async () => {
    const room = await getRoom(roomId);
    if (!room) return;
    if (room.gameState.word) return;
    // Not selected a word;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    await wordSelected(roomId, randomWord, io);
  }, MAX_WORD_SELECT_TIME);
}

export async function wordSelected(roomId: string, word: string, io: Server) {
  const room = await getRoom(roomId);
  if (!room) return;

  room.gameState.word = word;
  await setRoom(roomId, room);
  const player = room.players[room.gameState.currentPlayer];
  io.to(player.playerId).emit(GameEvent.WORD_CHOSEN, word);
  io.to(room.roomId).except(player.playerId).emit(GameEvent.WORD_CHOSEN);

  setTimeout(async () => {
    await endRound(roomId, io);
  }, room.settings.drawTime * 1000);
}

export async function givePoints(room: Room) {
  const now = new Date();

  const playersWhoGuessed = room.players.filter((player) => player.guessed);

  if (playersWhoGuessed.length === 0) {
    room.players.forEach((player) => {
      player.score = 0;
    });
    return;
  }

  playersWhoGuessed.sort(
    (a, b) => (a.guessedAt ?? now).getTime() - (b.guessedAt ?? now).getTime()
  );

  playersWhoGuessed.forEach((player, index) => {
    const timePenalty = Math.max(
      0,
      (now.getTime() - (player.guessedAt?.getTime() ?? now.getTime())) / 10000
    );
    const points = Math.max(200 - timePenalty, 0);
    player.score += points;
  });

  room.players.forEach((player) => {
    if (!player.guessed) {
      player.score = 0;
    }
  });

  room.players[room.gameState.currentPlayer].score =
    DRAWER_POINTS + playersWhoGuessed.length * BONUS_PER_GUESS;

  await setRoom(room.roomId, room);
}

export async function endGame(roomId: string, io: Server) {
  const room = await getRoom(roomId);
  if (!room) return;

  room.gameState.currentRound = 0;
  room.gameState.word = "";
  room.gameState.guessedWords = [];
}
