export interface CardData {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface Player {
  id: number;
  name: string;
  score: number;
  avatar: string;
  isAI?: boolean;
  energy: number; // 0-100
  activePowerUps: string[]; // List of active effects
  socketId?: string;
  profile?: Profile;
}

export type PowerUpType = 'RADAR' | 'SCRAMBLE' | 'SHIELD' | 'GHOST_EYE';

export interface PowerUp {
    id: PowerUpType;
    name: string;
    description: string;
    cost: number;
    icon: string;
}

export interface Profile {
  name: string;
  avatar: string;
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  currentStreak: number;
  longestStreak: number;
}

export enum GameStatus {
  Lobby = 'LOBBY',
  Playing = 'PLAYING',
  GameOver = 'GAME_OVER',
}

export enum GameMode {
  PVP = 'PVP', // Player vs Player
  PVE = 'PVE', // Player vs Environment (AI)
  ONLINE = 'ONLINE', // Multiplayer Online
}

export enum AIDifficulty {
  Easy = 'EASY',
  Medium = 'MEDIUM',
  Hard = 'HARD',
}

export type Action =
  | { type: 'START_GAME'; payload: { boardSize: number; players: Profile[]; gameMode: GameMode; aiDifficulty: AIDifficulty | null; theme?: string; seed?: number } }
  | { type: 'FLIP_CARD'; payload: { cardIndex: number; playerId: number } }
  | { type: 'CHECK_MATCH' }
  | { type: 'NO_MATCH'; payload?: { nextPlayerId: number } }
  | { type: 'MATCH_FOUND'; payload: { playerId: number; card1Index: number; card2Index: number } }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'RESET_SHAKE' }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'CLEAR_MATCH_EFFECT' }
  | { type: 'LOAD_INITIAL_DATA'; payload: { profile: Profile | null; stats: GameStats } }
  | { type: 'AI_THINKING_UPDATE'; payload: { isThinking: boolean } }
  | { type: 'USE_POWER_UP'; payload: { powerUpType: PowerUpType; playerId: number } }
  | { type: 'SYNC_ONLINE_STATE'; payload: Partial<GameState> }
  | { type: 'INPUT_RECEIVED'; payload: { frame: number; playerId: number; actionType: string; actionData?: any } };

export interface GameState {
  gameStatus: GameStatus;
  board: CardData[];
  players: Player[];
  flippedCardIndices: number[];
  activePlayerId: number;
  winner: Player | 'tie' | null;
  isShaking: boolean;
  lastScoringPlayerId: number | null;
  stats: GameStats;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty | null;
  theme: string;
  aiMemory: { [key: string]: number[] }; // value -> [index]
  isAIThinking: boolean;
  seed: number;
  frame: number;
}

export interface InputFrame {
  frame: number;
  playerId: number;
  type: string;
  data?: any;
}