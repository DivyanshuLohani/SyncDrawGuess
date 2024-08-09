export interface PlayerData {
  name: string;
  color: string;
}

export interface Player extends PlayerData {
  playerId: string;
  score: number;
  guessed: boolean;
  guessedAt: Date | null;
}

export interface GameState {
  currentRound: number;
  drawingData: string[];
  guessedWords: string[];
  word: string;
  currentPlayer: number;
}

export interface Settings {
  players: number;
  drawTime: number;
  rounds: number;
  onlyCustomWords: boolean;
  customWords: string[];
}

export enum SettingValue {
  players = "players",
  drawTime = "drawTime",
  rounds = "rounds",
  // onlyCustomWords: boolean;
  // customWords: string[];
}

export interface Room {
  roomId: string; // Unique identifier for the room
  creator: string; // Player ID of the creator of the room
  players: Player[]; // List of players in the room
  gameState: GameState; // Current state of the game
  settings: Settings;
}
