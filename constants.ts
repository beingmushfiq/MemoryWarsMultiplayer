import { Player, Profile, AIDifficulty, PowerUp } from './types';

export const CARD_VALUES: string[] = [
  'Lion', 'Tiger', 'Bear', 'Elephant',
  'Monkey', 'Zebra', 'Giraffe', 'Hippo',
  'Panda', 'Fox', 'Wolf', 'Deer',
  'Owl', 'Eagle', 'Penguin', 'Dolphin',
  'Shark', 'Turtle', 'Frog', 'Rabbit',
  'Snake', 'Horse', 'Pig', 'Cow',
];

export const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: 'Player 1', score: 0, avatar: 'avatar1', energy: 0, activePowerUps: [] },
  { id: 2, name: 'Player 2', score: 0, avatar: 'avatar5', energy: 0, activePowerUps: [] },
];

export const AI_PLAYER_PROFILE: Profile = { name: 'Cortex', avatar: 'avatarAI' };
export const AI_PLAYER_ID = 2;


export const FLIP_DELAY_MS = 750;
export const BOARD_SIZE_OPTIONS = [16, 24, 30, 36]; // 4x4, 4x6, 5x6, 6x6

export const CARD_THEMES: Record<string, string[]> = {
  Classic: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'],
  Tech: ['💻', '📱', '⌚', '💾', '🕹️', '🔌', '🔋', '🖥️', '🖨️', '⌨️', '🖱️', '💿', '📡', '📷', '📼', '📻', '💡', '🔍'],
  Space: ['🚀', '🛸', '🪐', '☄️', '🌌', '👽', '🌒', '🛰️', '🧑‍🚀', '🌛', '✨', '🌍', '🔭', '🌑', '🌞', '👾', '🧑‍🔬', '🌠'],
  Food: ['🍔', '🍟', '🍕', '🌭', '🍿', '🥓', '🌮', '🌯', '🥗', '🍩', '🍪', '🍰', '🍫', '🍬', '🍭', '🍦', '🍧', '🍨']
};

export const DEFAULT_THEME = 'Classic';

// EMOJIS is kept for backward compatibility if needed, falling back to Classic
export const EMOJIS = CARD_THEMES.Classic;

export const AI_DIFFICULTY_LEVELS: { [key in AIDifficulty]: { name: string; memoryChance: number; mistakeChance: number } } = {
  [AIDifficulty.Easy]: { name: 'Easy', memoryChance: 0, mistakeChance: 1 }, // Never remembers, always random
  [AIDifficulty.Medium]: { name: 'Medium', memoryChance: 0.75, mistakeChance: 0.25 }, // 75% chance to remember, 25% chance to make a random move
  [AIDifficulty.Hard]: { name: 'Hard', memoryChance: 1, mistakeChance: 0 }, // Perfect memory, no mistakes
};

export const POWER_UPS: PowerUp[] = [
    {
        id: 'RADAR',
        name: 'Radar Pulse',
        description: 'Briefly reveal all cards for 0.8 seconds.',
        cost: 40,
        icon: '📡'
    },
    {
        id: 'SCRAMBLE',
        name: 'Scramble',
        description: 'Shuffle all unmatched cards.',
        cost: 60,
        icon: '🌪️'
    },
    {
        id: 'SHIELD',
        name: 'EMP Shield',
        description: 'Opponent cannot match for 1 turn.',
        cost: 50,
        icon: '🛡️'
    },
    {
        id: 'GHOST_EYE',
        name: 'Ghost Eye',
        description: 'Permanently reveal one random unmatched card.',
        cost: 30,
        icon: '👁️'
    }
];

export const ENERGY_GAIN_PER_MATCH = 25;
export const MAX_ENERGY = 100;
export const RADAR_DISPLAY_MS = 800;