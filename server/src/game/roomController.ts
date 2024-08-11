import { Server, Socket } from "socket.io";
import { Room } from "../types";
import { getRoom, setRoom } from "../utils/redis";
import { GameEvent } from "../socket/socketHandlers";
import { convertToUnderscores, getRandomWords } from "../utils/word";

const DRAWER_POINTS = 50;
const BONUS_PER_GUESS = 10;
const MAX_WORD_SELECT_TIME = 30 * 1000; // 30s
const timers = new Map();

export async function startGame(room: Room, io: Server) {
  room.gameState.currentRound = 1;
  room.gameState.currentPlayer = 0;
  await setRoom(room.roomId, room);
  io.to(room.roomId).emit(GameEvent.GAME_STARTED, room);
  await nextRound(room.roomId, io);
  return room;
}

export async function endRound(roomId: string, io: Server) {
  let room = await getRoom(roomId);
  if (!room) return;

  if (timers.get(roomId)) {
    clearTimeout(timers.get(roomId));
    timers.delete(roomId);
  }
  room.gameState.currentPlayer += 1;

  // Check if playerCounter needs to be incremented
  if (room.gameState.currentPlayer >= room.players.length) {
    // Round end
    room.gameState.currentRound += 1;
    room.gameState.currentPlayer = 0;
  }
  await setRoom(roomId, room);

  await givePoints(roomId);
  room = await getRoom(roomId);
  if (!room) return;
  room.gameState.drawingData = [];
  room.players = room.players.map((e) => {
    return { ...e, guessed: false, guessedAt: null };
  });

  await setRoom(roomId, room);

  io.to(room.roomId).emit(GameEvent.TURN_END, room, room.gameState.word);
  room.gameState.word = "";
  await setRoom(roomId, room);

  setTimeout(async () => {
    if (room.gameState.currentRound > room.settings.rounds) {
      return await endGame(roomId, io);
    }
    await nextRound(roomId, io);
  }, 5000);
}

export async function guessWord(
  roomId: string,
  guess: string,
  socket: Socket,
  io: Server
) {
  const room = await getRoom(roomId);
  if (!room) return;
  const player = room.players.find((e) => e.playerId === socket.id);
  if (!player) return;
  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (
    room.gameState.word === guess.toLowerCase() &&
    !player.guessed &&
    player.playerId != currentPlayer.playerId
  ) {
    // Word Guessed
    player.guessed = true;
    player.guessedAt = new Date();
    room.players.forEach((p) => {
      if (p.playerId === player.playerId) {
        player.guessed = true;
        player.guessedAt = new Date();
      }
    });
    await setRoom(room.roomId, room);
    io.to(room.roomId).emit(GameEvent.GUESSED, player);

    const allPlayersGuessed = room.players.every(
      (p) => p.guessed || p.playerId === currentPlayer.playerId
    );
    if (allPlayersGuessed) {
      await endRound(room.roomId, io);
    }
  } else {
    io.to(room.roomId).emit(GameEvent.GUESS, guess, player);
  }
}

export async function nextRound(roomId: string, io: Server) {
  const room = await getRoom(roomId);
  if (!room) return;
  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer) return;

  // Get random words
  const words = await getRandomWords(3);
  io.to(currentPlayer.playerId).emit(GameEvent.CHOOSE_WORD, words);

  const timeOut = setTimeout(async () => {
    const room = await getRoom(roomId);
    if (!room) return;
    if (room.gameState.word != "") return;

    // Not selected a word;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    await wordSelected(roomId, randomWord, io);
  }, MAX_WORD_SELECT_TIME);
  timers.set(roomId, timeOut);
}

export async function wordSelected(roomId: string, word: string, io: Server) {
  const room = await getRoom(roomId);
  if (!room) return;
  if (timers.get(roomId)) {
    clearTimeout(timers.get(roomId));
    timers.delete(roomId);
  }
  room.gameState.word = word;
  await setRoom(roomId, room);
  const player = room.players[room.gameState.currentPlayer];
  if (!player) return;
  io.to(player.playerId).emit(GameEvent.WORD_CHOSEN, word);
  const word_blank = convertToUnderscores(word);
  io.to(room.roomId)
    .except(player.playerId)
    .emit(GameEvent.WORD_CHOSEN, word_blank);

  const timeOut = setTimeout(async () => {
    await endRound(roomId, io);
  }, room.settings.drawTime * 1000);
  timers.set(roomId, timeOut);
}

export async function givePoints(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return;
  const now = new Date();
  const playersWhoGuessed = room.players.filter((player) => player.guessed);
  if (playersWhoGuessed.length === 0) {
    room.players.forEach((player) => {
      player.score += 0;
    });
    await setRoom(room.roomId, room);
    return;
  }

  playersWhoGuessed.forEach((player, index) => {
    const points = 200;
    const guessTime = Math.abs(
      (now.getTime() - new Date(player.guessedAt ?? now).getTime()) / 1000
    );
    player.score += Math.round(Math.max(points - guessTime, 0));
  });

  room.players.forEach((player) => {
    if (!player.guessed) {
      player.score += 0;
    }
  });
  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer) return;
  currentPlayer.score +=
    DRAWER_POINTS + playersWhoGuessed.length * BONUS_PER_GUESS;
  await setRoom(room.roomId, room);
}

export async function endGame(roomId: string, io: Server) {
  const room = await getRoom(roomId);
  if (!room) return;

  room.gameState.currentRound = 0;
  room.gameState.word = "";
  room.gameState.guessedWords = [];
  await setRoom(roomId, room);
  io.to(roomId).emit(GameEvent.GAME_ENDED, room);
}
