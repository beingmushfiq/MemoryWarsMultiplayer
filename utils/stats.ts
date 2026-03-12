import { GameStats } from '../types';

const STATS_STORAGE_KEY = 'memory-wars-stats';

export const initialStats: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  ties: 0,
  currentStreak: 0,
  longestStreak: 0,
};

/**
 * Saves game stats to localStorage.
 * @param stats - The game stats object.
 */
export const saveStats = (stats: GameStats): void => {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save stats to localStorage:", error);
  }
};

/**
 * Loads game stats from localStorage.
 * @returns The stats object if found, otherwise initial stats.
 */
export const loadStats = (): GameStats => {
  try {
    const data = localStorage.getItem(STATS_STORAGE_KEY);
    if (!data) return initialStats;
    
    const stats = JSON.parse(data);
    // Basic validation
    if (
      typeof stats.gamesPlayed === 'number' &&
      typeof stats.wins === 'number' &&
      typeof stats.losses === 'number' &&
      typeof stats.ties === 'number' &&
      typeof stats.currentStreak === 'number' &&
      typeof stats.longestStreak === 'number'
    ) {
        return stats;
    }
    return initialStats;

  } catch (error) {
    console.error("Failed to load stats from localStorage:", error);
    return initialStats;
  }
};