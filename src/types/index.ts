export interface PlayerData {
  name: string;
  color: string;
}

export interface Player extends PlayerData {
  playerId: string;
  score: number;
}

export interface GameState {
  currentRound: number;
  drawingData: string[];
  guessedWords: string[];
  word: string;
}

export interface Room {
  roomId: string; // Unique identifier for the room
  creator: string; // Player ID of the creator of the room
  players: Player[]; // List of players in the room
  gameState: GameState; // Current state of the game
  settings?: {
    maxPlayers?: number; // Optional maximum number of players
    nRounds?: number; // number of rounds
    roundDuration?: number; // Optional duration of each round (in seconds)
  };
}
