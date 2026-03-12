const MUTE_STORAGE_KEY = 'memory-wars-mute';

/**
 * Saves the mute state to localStorage.
 * @param isMuted - The current mute state.
 */
export const saveMutedState = (isMuted: boolean): void => {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, JSON.stringify(isMuted));
  } catch (error) {
    console.error("Failed to save mute state to localStorage:", error);
  }
};

/**
 * Loads the mute state from localStorage.
 * @returns The mute state if found, otherwise false (unmuted).
 */
export const loadMutedState = (): boolean => {
  try {
    const data = localStorage.getItem(MUTE_STORAGE_KEY);
    if (data === null) return false;
    return JSON.parse(data) === true;
  } catch (error) {
    console.error("Failed to load mute state from localStorage:", error);
    return false;
  }
};
