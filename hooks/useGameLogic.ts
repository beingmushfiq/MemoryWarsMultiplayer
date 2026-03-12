import { useReducer, useEffect, useCallback } from 'react';
import { GameState, Action, GameStatus, CardData, Profile, Player, GameStats, GameMode, AIDifficulty, PowerUpType } from '../types';
import { CARD_VALUES, INITIAL_PLAYERS, FLIP_DELAY_MS, AI_PLAYER_ID, AI_PLAYER_PROFILE, AI_DIFFICULTY_LEVELS, ENERGY_GAIN_PER_MATCH, POWER_UPS, RADAR_DISPLAY_MS } from '../constants';
import { playSound } from '../utils/audio';
import { saveProfile, loadProfile } from '../utils/profile';
import { saveStats, loadStats, initialStats } from '../utils/stats';
import { createPRNG, seededShuffle, hashString } from '../utils/random';

const createBoard = (boardSize: number, seed?: number): CardData[] => {
  const uniqueCardCount = boardSize / 2;
  const cardValuesForGame = CARD_VALUES.slice(0, uniqueCardCount);
  const cardPairs = [...cardValuesForGame, ...cardValuesForGame];
  
  let shuffled: string[];
  if (seed !== undefined) {
    const prng = createPRNG(seed);
    shuffled = seededShuffle(cardPairs, prng);
  } else {
    shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
  }

  return shuffled.map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }));
};

const createPlayers = (playerProfiles: Profile[], gameMode: GameMode): Player[] => {
    if (gameMode === GameMode.PVE) {
        return [
            { id: 1, name: playerProfiles[0].name, avatar: playerProfiles[0].avatar, score: 0, energy: 0, activePowerUps: [] },
            { id: AI_PLAYER_ID, name: AI_PLAYER_PROFILE.name, avatar: AI_PLAYER_PROFILE.avatar, score: 0, isAI: true, energy: 0, activePowerUps: [] }
        ];
    }
    return playerProfiles.map((profile, index) => ({
        id: (profile as any).id || (index + 1),
        name: profile.name,
        avatar: profile.avatar,
        score: 0,
        energy: 0,
        activePowerUps: [],
        socketId: (profile as any).socketId,
        profile: profile,
    }));
};


const initialState: GameState = {
  gameStatus: GameStatus.Lobby,
  board: [],
  players: INITIAL_PLAYERS,
  flippedCardIndices: [],
  activePlayerId: 1,
  winner: null,
  isShaking: false,
  lastScoringPlayerId: null,
  stats: initialStats,
  gameMode: GameMode.PVP,
  aiDifficulty: null,
  aiMemory: {},
  isAIThinking: false,
  theme: 'Classic',
  seed: 0,
  frame: 0,
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'LOAD_INITIAL_DATA': {
      const { profile, stats } = action.payload;
      const newPlayers = [...state.players];
      if (profile) {
        const player1 = newPlayers.find(p => p.id === 1);
        if (player1) {
          player1.name = profile.name;
          player1.avatar = profile.avatar;
        }
      }
      return { ...state, players: newPlayers, stats };
    }
    case 'SET_PROFILE': {
      const newPlayers = [...state.players];
      const player1 = newPlayers.find(p => p.id === 1);
      if (player1) {
        player1.name = action.payload.name;
        player1.avatar = action.payload.avatar;
      }
      return { ...state, players: newPlayers };
    }
    case 'START_GAME': {
      const { boardSize, players: playerProfiles, gameMode, aiDifficulty, theme, seed } = action.payload;
      const bSize = Number(boardSize) || 16;
      const finalSeed = seed ?? Math.floor(Math.random() * 1000000);
      
      console.log(`ENGINE: Initializing board with size ${bSize} for mode ${gameMode} (Seed: ${finalSeed})`);
      
      if (playerProfiles[0]) {
          saveProfile(playerProfiles[0]);
      }
      return {
        ...initialState,
        stats: state.stats,
        players: createPlayers(playerProfiles, gameMode),
        gameStatus: GameStatus.Playing,
        board: createBoard(bSize, finalSeed),
        gameMode,
        aiDifficulty,
        theme,
        seed: finalSeed,
        frame: 0,
      };
    }
    case 'SYNC_ONLINE_STATE': {
        // HARDENING: Prevent undefined payload values from corrupting state
        const validPayload = Object.fromEntries(
            Object.entries(action.payload).filter(([_, v]) => v !== undefined)
        );
        
        // CRITICAL FIX: Ensure players is derived correctly or falls back to current state
        if ('players' in validPayload && !validPayload.players) {
            delete validPayload.players;
        }

        return {
            ...state,
            ...validPayload,
        };
    }
    case 'FLIP_CARD': {
      const { cardIndex } = action.payload;
      const card = state.board[cardIndex];
      if (card.isFlipped || card.isMatched || state.flippedCardIndices.length === 2) {
        return state;
      }
      
      playSound('flip');
      const newBoard = [...state.board];
      newBoard[cardIndex] = { ...card, isFlipped: true };
      const newFlippedIndices = [...state.flippedCardIndices, cardIndex];
      
      // Update AI memory with the revealed card
      const newMemory = { ...state.aiMemory };
      if (!newMemory[card.value]) {
          newMemory[card.value] = [];
      }
      if (!newMemory[card.value].includes(cardIndex)) {
          newMemory[card.value].push(cardIndex);
      }

      return {
        ...state,
        board: newBoard,
        flippedCardIndices: newFlippedIndices,
        activePlayerId: newFlippedIndices.length === 1 ? action.payload.playerId : state.activePlayerId,
        isShaking: false, // Reset shake on new flip
        aiMemory: newMemory,
      };
    }
    case 'CHECK_MATCH': {
      const [index1, index2] = state.flippedCardIndices;
      const card1 = state.board[index1];
      const card2 = state.board[index2];

      if (card1.value === card2.value) {
        return gameReducer(state, { type: 'MATCH_FOUND', payload: { playerId: state.activePlayerId, card1Index: index1, card2Index: index2 } });
      } else {
        return gameReducer(state, { type: 'NO_MATCH' });
      }
    }
    case 'MATCH_FOUND': {
        playSound('match');
        const { playerId, card1Index, card2Index } = action.payload;
        const newBoard = [...state.board];
        newBoard[card1Index] = { ...newBoard[card1Index], isMatched: true };
        newBoard[card2Index] = { ...newBoard[card2Index], isMatched: true };

        const newPlayers = state.players.map(p => 
            p.id === playerId ? { ...p, score: p.score + 1, energy: Math.min(100, p.energy + (ENERGY_GAIN_PER_MATCH)) } : p
        );

        const cardValue = state.board[card1Index].value;
        const newMemory = { ...state.aiMemory };
        delete newMemory[cardValue]; // A match is found, so AI can forget this pair

        return {
            ...state,
            board: newBoard,
            players: newPlayers,
            flippedCardIndices: [],
            lastScoringPlayerId: playerId,
            aiMemory: newMemory,
        };
    }
    case 'NO_MATCH': {
      playSound('mismatch');
      const [index1, index2] = state.flippedCardIndices;
      const newBoard = [...state.board];
      if (newBoard[index1]) newBoard[index1] = { ...newBoard[index1], isFlipped: false };
      if (newBoard[index2]) newBoard[index2] = { ...newBoard[index2], isFlipped: false };

      const currentPlayerIndex = state.players.findIndex(p => p.id === state.activePlayerId);
      const nextPlayerId = action.payload?.nextPlayerId ?? state.players[(currentPlayerIndex + 1) % state.players.length].id;

      return {
        ...state,
        board: newBoard,
        flippedCardIndices: [],
        isShaking: true,
        activePlayerId: nextPlayerId,
      };
    }
     case 'RESET_SHAKE': {
        return { ...state, isShaking: false };
    }
     case 'CLEAR_MATCH_EFFECT': {
        return { ...state, lastScoringPlayerId: null };
     }
    case 'END_GAME': {
        const highestScore = Math.max(...state.players.map(p => p.score));
        const winners = state.players.filter(p => p.score === highestScore);
        
        let winnerResult: GameState['winner'] = null;
        if (winners.length > 1) {
            winnerResult = 'tie';
        } else {
            winnerResult = winners[0];
        }

        const player1WonOrTied = winners.some(w => w.id === 1);
        if (winnerResult === 'tie' && player1WonOrTied) {
            playSound('win');
        } else if (winnerResult !== 'tie' && winnerResult?.id === 1) {
            playSound('win');
        } else {
            playSound('lose');
        }

        const newStats = { ...state.stats };
        newStats.gamesPlayed += 1;
        const player1Won = winnerResult !== 'tie' && winnerResult?.id === 1;

        if (player1Won) {
            newStats.wins += 1;
            newStats.currentStreak += 1;
            if (newStats.currentStreak > newStats.longestStreak) {
                newStats.longestStreak = newStats.currentStreak;
            }
        } else if (winnerResult === 'tie') {
            newStats.ties += 1;
            newStats.currentStreak = 0; // A tie breaks a winning streak
        } else {
            newStats.losses += 1;
            newStats.currentStreak = 0;
        }
        
        saveStats(newStats); // Persist stats

        return {
            ...state,
            gameStatus: GameStatus.GameOver,
            winner: winnerResult,
            stats: newStats,
        };
    }
    case 'RESET_GAME':
      return {
        ...state,
        gameStatus: GameStatus.Lobby,
        board: [],
        players: state.players.map(p => ({...p, score: 0})),
        flippedCardIndices: [],
        activePlayerId: 1,
        winner: null,
        isShaking: false,
        lastScoringPlayerId: null,
        aiMemory: {},
        isAIThinking: false,
      };
    case 'AI_THINKING_UPDATE':
      return { ...state, isAIThinking: action.payload.isThinking };
    case 'USE_POWER_UP': {
        const { powerUpType, playerId } = action.payload;
        const player = state.players.find(p => p.id === playerId);
        const powerUp = POWER_UPS.find(pu => pu.id === powerUpType);
        
        if (!player || !powerUp || player.energy < powerUp.cost) {
            return state;
        }

        playSound('click'); // Or a specialized power-up sound
        
        const newPlayers = state.players.map(p => 
            p.id === playerId ? { ...p, energy: p.energy - powerUp.cost } : p
        );

        let newBoard = [...state.board];
        let newFlippedIndices = [...state.flippedCardIndices];

        if (powerUpType === 'RADAR') {
            newBoard = newBoard.map(c => c.isMatched ? c : { ...c, isFlipped: true });
        } else if (powerUpType === 'SCRAMBLE') {
            const unmatchedIndices = newBoard.map((c, i) => i).filter(i => !newBoard[i].isMatched);
            const unmatchedValues = unmatchedIndices.map(i => newBoard[i].value);
            const shuffledValues = [...unmatchedValues].sort(() => Math.random() - 0.5);
            
            unmatchedIndices.forEach((idx, i) => {
                newBoard[idx] = { ...newBoard[idx], value: shuffledValues[i], isFlipped: false };
            });
            newFlippedIndices = []; // Reset currently flipped if scrambled
        } else if (powerUpType === 'GHOST_EYE') {
            const unmatchedCards = newBoard.filter(c => !c.isMatched && !c.isFlipped);
            if (unmatchedCards.length > 0) {
                const randomCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
                newBoard = newBoard.map(c => c.id === randomCard.id ? { ...c, isFlipped: true } : c);
            }
        }

        return {
            ...state,
            players: newPlayers,
            board: newBoard,
            flippedCardIndices: newFlippedIndices,
        };
    }
    case 'INPUT_RECEIVED': {
        const { frame, playerId, actionType, actionData } = action.payload;
        
        // Lockstep validation: Process in order
        const newState = { ...state, frame };
        
        if (actionType === 'FLIP_CARD') {
            return gameReducer(newState, { type: 'FLIP_CARD', payload: { cardIndex: actionData.cardIndex, playerId } });
        } else if (actionType === 'USE_POWER_UP') {
            return gameReducer(newState, { type: 'USE_POWER_UP', payload: { powerUpType: actionData.powerUpType as PowerUpType, playerId } });
        } else if (actionType === 'CHECK_MATCH') {
            // Deterministic resolution triggered by frame progression
            return gameReducer(newState, { type: 'CHECK_MATCH' });
        }
        
        return newState;
    }
    default:
      return state;
  }
};

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const savedProfile = loadProfile();
    const savedStats = loadStats();
    dispatch({ type: 'LOAD_INITIAL_DATA', payload: { profile: savedProfile, stats: savedStats } });
  }, []);

  // AI Turn Logic
  useEffect(() => {
    if (state.gameMode !== GameMode.PVE || state.gameStatus !== GameStatus.Playing || state.activePlayerId !== AI_PLAYER_ID || state.isAIThinking || state.flippedCardIndices.length > 0) {
      return;
    }

    const aiMoveTimeout = setTimeout(() => {
      dispatch({ type: 'AI_THINKING_UPDATE', payload: { isThinking: true } });
      
      const { board, aiMemory, aiDifficulty } = state;
      const difficultySettings = AI_DIFFICULTY_LEVELS[aiDifficulty || AIDifficulty.Medium];
      const unflippedIndices = board.map((_, i) => i).filter(i => !board[i].isMatched);
      const aiPlayer = state.players.find(p => p.id === AI_PLAYER_ID);
      const player1 = state.players.find(p => p.id === 1);

      // 1. Strategic Power-Up Usage
      if (aiPlayer && aiPlayer.energy >= 30 && Math.random() < 0.25) {
          let choice: PowerUpType | null = null;
          
          if (player1 && player1.score > aiPlayer.score + 2 && aiPlayer.energy >= 60) {
              choice = 'SCRAMBLE';
          } else if (state.board.filter(c => !c.isMatched).length > 12 && aiPlayer.energy >= 40) {
              choice = 'RADAR';
          } else if (aiPlayer.energy >= 30 && Math.random() < 0.2) {
              choice = 'GHOST_EYE';
          }

          if (choice) {
              dispatch({ type: 'USE_POWER_UP', payload: { powerUpType: choice, playerId: AI_PLAYER_ID } });
              dispatch({ type: 'AI_THINKING_UPDATE', payload: { isThinking: false } });
              return; // AI takes a moment after using power-up
          }
      }

      let firstCardIndex: number | null = null;
      let secondCardIndex: number | null = null;
      
      const useMemory = Math.random() < difficultySettings.memoryChance;

      if (useMemory) {
        // Look for a known pair in memory
        for (const value in aiMemory) {
          if (aiMemory[value].length === 2) {
            const [idx1, idx2] = aiMemory[value];
            if (!board[idx1].isMatched) {
              firstCardIndex = idx1;
              secondCardIndex = idx2;
              break;
            }
          }
        }
      }
      
      if (firstCardIndex === null) {
        const availableToFlip = unflippedIndices.filter(i => !board[i].isFlipped);
        if (availableToFlip.length === 0) {
          dispatch({ type: 'AI_THINKING_UPDATE', payload: { isThinking: false } });
          return;
        }
        firstCardIndex = availableToFlip[Math.floor(Math.random() * availableToFlip.length)];
      }
      
      if (secondCardIndex === null) {
        const firstCardValue = board[firstCardIndex].value;
        const potentialMatch = aiMemory[firstCardValue]?.find(idx => idx !== firstCardIndex && unflippedIndices.includes(idx));
        const makeMistake = Math.random() < difficultySettings.mistakeChance;

        if (useMemory && potentialMatch !== undefined && !makeMistake) {
          secondCardIndex = potentialMatch;
        } else {
          const remainingIndices = unflippedIndices.filter(i => i !== firstCardIndex && !board[i].isFlipped);
          if (remainingIndices.length > 0) {
            secondCardIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
          } else {
            secondCardIndex = unflippedIndices.find(i => i !== firstCardIndex) ?? null;
          }
        }
      }

      if (firstCardIndex !== null && secondCardIndex !== null) {
        const card1Idx = firstCardIndex!;
        const card2Idx = secondCardIndex!;
        
        setTimeout(() => {
          dispatch({ type: 'FLIP_CARD', payload: { cardIndex: card1Idx, playerId: AI_PLAYER_ID } });
          setTimeout(() => {
            dispatch({ type: 'FLIP_CARD', payload: { cardIndex: card2Idx, playerId: AI_PLAYER_ID } });
            setTimeout(() => {
              dispatch({ type: 'AI_THINKING_UPDATE', payload: { isThinking: false } });
            }, FLIP_DELAY_MS);
          }, 800);
        }, 500);
      } else {
        dispatch({ type: 'AI_THINKING_UPDATE', payload: { isThinking: false } });
      }

    }, 1000);

    return () => clearTimeout(aiMoveTimeout);
  }, [state.gameStatus, state.activePlayerId, state.isAIThinking, state.board, state.aiMemory, state.aiDifficulty, state.players]);

  useEffect(() => {
    if (state.lastScoringPlayerId !== null) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_MATCH_EFFECT' });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.lastScoringPlayerId]);

  useEffect(() => {
    if (state.isShaking) {
      const timer = setTimeout(() => dispatch({ type: 'RESET_SHAKE' }), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isShaking]);

  useEffect(() => {
    if (state.flippedCardIndices.length === 2 && state.gameMode !== GameMode.ONLINE) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CHECK_MATCH' });
      }, FLIP_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [state.flippedCardIndices, state.gameMode]);

  useEffect(() => {
    if (state.gameStatus === GameStatus.Playing && state.board.length > 0 && state.gameMode !== GameMode.ONLINE) {
      const allMatched = state.board.every(card => card.isMatched);
      if (allMatched) {
        const timer = setTimeout(() => dispatch({ type: 'END_GAME' }), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [state.board, state.gameStatus, state.gameMode]);

  // Radar Effect Timer
  useEffect(() => {
    const unflippedRadaredCount = state.board.filter(c => !c.isMatched && c.isFlipped).length;
    // If Radar revealed cards but we aren't in a normal flip state
    if (unflippedRadaredCount > 0 && state.flippedCardIndices.length === 0 && state.gameMode !== GameMode.ONLINE) {
        const timer = setTimeout(() => {
            // Flip all unmatched cards back
            dispatch({ type: 'SYNC_ONLINE_STATE', payload: {
                board: state.board.map(c => c.isMatched ? c : { ...c, isFlipped: false })
            }});
        }, RADAR_DISPLAY_MS);
        return () => clearTimeout(timer);
    }
  }, [state.board, state.flippedCardIndices, state.gameMode]);

  const handleCardClick = useCallback((index: number) => {
    if (state.flippedCardIndices.length < 2 && !state.isAIThinking) {
      dispatch({ type: 'FLIP_CARD', payload: { cardIndex: index, playerId: state.activePlayerId } });
    }
  }, [state.activePlayerId, state.flippedCardIndices.length, state.isAIThinking]);

  const startGame = useCallback((boardSize: number, players: Profile[], gameMode: GameMode, aiDifficulty: AIDifficulty | null, theme: string) => {
    dispatch({ type: 'START_GAME', payload: { boardSize, players, gameMode, aiDifficulty, theme } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setPlayerProfile = useCallback((profile: Profile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, []);

  const usePowerUp = useCallback((powerUpType: PowerUpType, playerId: number) => {
    dispatch({ type: 'USE_POWER_UP', payload: { powerUpType, playerId } });
  }, []);


  return { state, handleCardClick, startGame, resetGame, setPlayerProfile, usePowerUp, dispatch };
};
