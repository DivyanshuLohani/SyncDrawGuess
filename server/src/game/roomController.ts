import { Server, Socket } from "socket.io";
import { PlayerData, Room } from "../types";
import { deleteRedisRoom, getRedisRoom, setRedisRoom } from "../utils/redis";
import { GameEvent } from "../socket/socketHandlers";
import { convertToUnderscores, getRandomWords } from "../utils/word";
import { generateEmptyRoom } from "./gameController";
import { getRoomFromSocket } from "./gameController";
import {
  END_ROUND_TIME,
  WINNER_SHOW_TIME,
  WORDCHOOSE_TIME,
} from "../constants";

const DRAWER_POINTS = 50;
const BONUS_PER_GUESS = 10;
const timers = new Map();

function clearTimers(roomId: string) {
  if (timers.get(roomId)) {
    clearTimeout(timers.get(roomId));
    timers.delete(roomId);
  }
}

export async function startGame(room: Room, io: Server) {
  room.gameState.currentRound = 1;
  room.gameState.currentPlayer = 0;
  await setRedisRoom(room.roomId, room);
  io.to(room.roomId).emit(GameEvent.GAME_STARTED, room);
  await nextRound(room.roomId, io);
  return room;
}

export async function endRound(
  roomId: string,
  io: Server,
  reason: string = ""
) {
  let room = await getRedisRoom(roomId);
  if (!room) return;

  clearTimers(room.roomId);
  if (reason === "left" && room.players.length === 2) {
    return;
  }
  room.gameState.currentPlayer += 1;

  // Check if playerCounter needs to be incremented
  if (room.gameState.currentPlayer >= room.players.length) {
    // Round end
    room.gameState.currentRound += 1;
    room.gameState.currentPlayer = 0;
  }
  await setRedisRoom(roomId, room);

  await givePoints(roomId);
  room = await getRedisRoom(roomId);
  if (!room) return;
  room.gameState.drawingData = [];
  room.players = room.players.map((e) => {
    return { ...e, guessed: false, guessedAt: null };
  });
  await setRedisRoom(roomId, room);

  io.to(room.roomId).emit(GameEvent.TURN_END, room, {
    word: room.gameState.word,
    reason,
    time: END_ROUND_TIME,
  });
  room.gameState.word = "";
  await setRedisRoom(roomId, room);

  setTimeout(async () => {
    if (room.gameState.currentRound > room.settings.rounds) {
      return await endGame(roomId, io);
    }
    await nextRound(roomId, io);
  }, END_ROUND_TIME * 1000);
}

export async function guessWord(
  roomId: string,
  guess: string,
  socket: Socket,
  io: Server
) {
  const room = await getRedisRoom(roomId);
  if (!room) return;

  const player = room.players.find((e) => e.playerId === socket.id);
  if (!player) return;

  const currentPlayer = room.players[room.gameState.currentPlayer];

  if (
    player.playerId !== currentPlayer.playerId &&
    room.gameState.word === guess.toLowerCase() &&
    !player.guessed
  ) {
    // Mark player as guessed
    player.guessed = true;
    player.guessedAt = new Date();

    await setRedisRoom(room.roomId, room);
    io.to(room.roomId).emit(GameEvent.GUESSED, player);

    // Check if all players (except the current one) have guessed
    if (
      room.players.every(
        (p) => p.guessed || p.playerId === currentPlayer.playerId
      )
    ) {
      await endRound(room.roomId, io, "All players have guessed the word");
    }
  } else {
    io.to(room.roomId).emit(GameEvent.GUESS, guess, player);
  }
}

export async function nextRound(roomId: string, io: Server) {
  const room = await getRedisRoom(roomId);
  if (!room) return;
  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer) return;

  // Get random words
  const words = await getRandomWords(
    room.settings.wordCount,
    room.settings.language
  );
  io.to(currentPlayer.playerId).emit(GameEvent.CHOOSE_WORD, {
    words,
    time: WORDCHOOSE_TIME,
  });

  io.to(room.roomId)
    .except(currentPlayer.playerId)
    .emit(GameEvent.CHOOSING_WORD, { currentPlayer, time: WORDCHOOSE_TIME });

  const timeOut = setTimeout(async () => {
    const room = await getRedisRoom(roomId);
    if (!room) return;
    if (room.gameState.word != "") return;
    // Not selected a word;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    await wordSelected(roomId, randomWord, io);
  }, WORDCHOOSE_TIME * 1000);
  timers.set(roomId, timeOut);
}

export async function wordSelected(roomId: string, word: string, io: Server) {
  const room = await getRedisRoom(roomId);
  if (!room) return;
  clearTimers(room.roomId);
  room.gameState.word = word;
  await setRedisRoom(roomId, room);

  const player = room.players[room.gameState.currentPlayer];
  if (!player) return;

  io.to(player.playerId).emit(GameEvent.WORD_CHOSEN, {
    word,
    time: room.settings.drawTime,
  });

  const words_lens = convertToUnderscores(word);
  io.to(room.roomId).except(player.playerId).emit(GameEvent.GUESS_WORD_CHOSEN, {
    word: words_lens,
    time: room.settings.drawTime,
  });

  const timeOut = setTimeout(async () => {
    await endRound(roomId, io, "Time is up");
  }, room.settings.drawTime * 1000);
  timers.set(roomId, timeOut);
}

export async function givePoints(roomId: string) {
  const room = await getRedisRoom(roomId);
  if (!room) return;
  const now = new Date();
  const playersWhoGuessed = room.players.filter((player) => player.guessed);
  if (playersWhoGuessed.length === 0) {
    room.players.forEach((player) => {
      player.score += 0;
    });
    await setRedisRoom(room.roomId, room);
    return;
  }

  playersWhoGuessed.forEach((player, index) => {
    const points = 200;
    const guessTime = Math.abs(
      (now.getTime() - new Date(player.guessedAt ?? now).getTime()) / 1000
    );
    player.score += Math.round(Math.max(points - guessTime, 0));
  });

  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer) return;
  currentPlayer.score +=
    DRAWER_POINTS + playersWhoGuessed.length * BONUS_PER_GUESS;
  await setRedisRoom(room.roomId, room);
}

export async function endGame(roomId: string, io: Server) {
  const room = await getRedisRoom(roomId);
  if (!room) return;

  clearTimers(room.roomId);

  room.gameState.currentRound = 0;
  room.gameState.word = "";
  room.gameState.guessedWords = [];
  await setRedisRoom(roomId, room);
  io.to(roomId).emit(GameEvent.GAME_ENDED, { room, time: WINNER_SHOW_TIME });
}

export const handleNewRoom = async (
  io: Server,
  socket: Socket,
  playerData: PlayerData,
  isPrivate?: boolean
) => {
  if (isPrivate) {
    const newRoomId = await generateEmptyRoom(socket, playerData, isPrivate);
    socket.join(newRoomId);
    const room = await getRedisRoom(newRoomId);
    io.to(newRoomId).emit(GameEvent.JOINED_ROOM, room);
  } else {
    // TODO: Implement public room search logic or create a new one
    console.log("Public room request");
  }
};

export async function handleDrawAction(
  socket: Socket,
  action: "DRAW" | "CLEAR" | "UNDO",
  drawData?: any
) {
  const room = await getRoomFromSocket(socket);
  if (!room || room.gameState.currentRound === 0) return;

  const currentPlayer = room.players[room.gameState.currentPlayer];
  if (!currentPlayer || currentPlayer.playerId !== socket.id) return;

  switch (action) {
    case "DRAW":
      if (!drawData) return;
      room.gameState.drawingData.push(drawData);
      socket.to(room.roomId).emit(GameEvent.DRAW_DATA, drawData);
      break;

    case "CLEAR":
      room.gameState.drawingData = [];
      socket.to(room.roomId).emit(GameEvent.CLEAR_DRAW);
      break;

    case "UNDO":
      room.gameState.drawingData.pop();
      socket.to(room.roomId).emit(GameEvent.UNDO_DRAW);
      break;
  }

  await setRedisRoom(room.roomId, room);
}
