import { Languages, Settings } from "./types";

export const WORDCHOOSE_TIME = 30;
export const END_ROUND_TIME = 5;
export const WINNER_SHOW_TIME = 10;

export const DRAWER_POINTS = 50;
export const BONUS_PER_GUESS = 10;

export const INITIAL_HINTS_TIME = 30;
export const HINTS_TIME = 10;

export const DEFAULT_GAME_SETTINGS: Settings = {
  players: 8,
  rounds: 1,
  drawTime: 60,
  customWords: [],
  onlyCustomWords: false,
  language: Languages.en,
  wordCount: 3,
  hints: 2,
};
