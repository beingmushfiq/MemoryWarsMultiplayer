import { Profile } from '../types';

const PROFILE_STORAGE_KEY = 'memory-wars-profile';

/**
 * Saves the user's profile to localStorage.
 * @param profile - The profile object containing name and avatar.
 */
export const saveProfile = (profile: Profile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile to localStorage:", error);
  }
};

/**
 * Loads the user's profile from localStorage.
 * @returns The profile object if found, otherwise null.
 */
export const loadProfile = (): Profile | null => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!data) return null;
    
    const profile = JSON.parse(data);
    // Basic validation
    if (typeof profile.name === 'string' && typeof profile.avatar === 'string') {
        return profile;
    }
    return null;

  } catch (error) {
    console.error("Failed to load profile from localStorage:", error);
    return null;
  }
};
