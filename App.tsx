import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import Modal from './components/Modal';
import { useGameLogic } from './hooks/useGameLogic';
import { GameStatus, Player, Profile, GameMode, AIDifficulty, PowerUpType } from './types';
import { playSound, setMuted } from './utils/audio';
import { AVATAR_OPTIONS, getAvatar } from './components/avatars';
import { CrownIcon, FullScreenEnterIcon, FullScreenExitIcon, StatsIcon, SoundOnIcon, SoundOffIcon } from './components/icons';
import { BOARD_SIZE_OPTIONS, AI_PLAYER_PROFILE, FLIP_DELAY_MS, POWER_UPS } from './constants';
import StatsModal from './components/StatsModal';
import { useFullscreen } from './hooks/useFullscreen';
import GameSetupModal from './components/GameSetupModal';
import Confetti from './components/Confetti';
import { loadMutedState, saveMutedState } from './utils/settings';
import { useMultiplayer } from './hooks/useMultiplayer';

const App: React.FC = () => {
  const { state, handleCardClick: logicCardClick, startGame, resetGame, setPlayerProfile, usePowerUp, dispatch } = useGameLogic();
  const { gameStatus, board, players, activePlayerId, winner, flippedCardIndices, isShaking, lastScoringPlayerId, stats, isAIThinking, theme: currentTheme, gameMode } = state;
  
  // SAFE DERIVATION: Ensure player1 is available before any hooks or effects use it
  const player1 = players?.find(p => p.id === 1) || players?.[0];
  
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.Medium);
  const [selectedBoardSize, setSelectedBoardSize] = useState(BOARD_SIZE_OPTIONS[0]);
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const [theme, setTheme] = useState('Classic');
  const [isHosting, setIsHosting] = useState(true);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState('');
  
  const { 
    createRoom, joinRoom, room, isConnected, error, leaveRoom, 
    startGameOnline, socket, sendInput
  } = useMultiplayer();

  const [isMuted, setIsMuted] = useState(loadMutedState());
  const [playerSetups, setPlayerSetups] = useState<Profile[]>([]);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCardClick = (index: number) => {
    if (gameMode === GameMode.ONLINE) {
        const localPlayer = players.find(p => p.socketId === socket?.id);
        if (localPlayer && activePlayerId === localPlayer.id) {
            sendInput('FLIP_CARD', { cardIndex: index });
        }
    } else {
        logicCardClick(index);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('gameStarted', (updatedRoom) => {
        console.log(`NET_SYNC: Game starting with seed ${updatedRoom.seed}`);
        playSound('start');
        const profiles = updatedRoom.players.map((p: any) => ({ ...p }));
        startGame(updatedRoom.settings.boardSize, profiles, GameMode.ONLINE, null, updatedRoom.settings.theme, updatedRoom.seed);
    });

    socket.on('inputReceived', ({ frame, playerId, type, data }) => {
        console.log(`LOCKSTEP: Frame ${frame} received from player ${playerId}: ${type}`);
        dispatch({ 
            type: 'INPUT_RECEIVED', 
            payload: { frame, playerId, actionType: type, actionData: data } 
        });

        // If it was a flip, and now we have 2 cards, the engine logic handles the DETERMINISTIC delay
        // Note: For a true lockstep, we might want a 'SCHEDULED_ACTION' but for this game,
        // we can just let the local engine handle the deterministic outcome of the 2nd flip.
    });

    return () => {
        socket.off('gameStarted');
        socket.off('inputReceived');
    };
  }, [socket, dispatch, startGame]);

  // Deterministic automatic transitions (Match resolution)
  useEffect(() => {
    if (flippedCardIndices.length === 2) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CHECK_MATCH' });
      }, FLIP_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [flippedCardIndices, dispatch]);

  // Deterministic Game End
  useEffect(() => {
    if (gameStatus === GameStatus.Playing && board.length > 0) {
      const allMatched = board.every(card => card.isMatched);
      if (allMatched) {
        const timer = setTimeout(() => dispatch({ type: 'END_GAME' }), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [board, gameStatus, dispatch]);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setIsIntroVisible(false);
      playSound('start');
    }, 4000);

    return () => clearTimeout(introTimer);
  }, []);
  
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setMuted(newMutedState);
    saveMutedState(newMutedState);
  };

  useEffect(() => {
    if (gameStatus === GameStatus.Lobby && player1) {
      if (gameMode === GameMode.PVE) {
          setPlayerSetups([
              { name: player1.name, avatar: player1.avatar },
              { name: AI_PLAYER_PROFILE.name, avatar: AI_PLAYER_PROFILE.avatar },
          ]);
      } else if (gameMode === GameMode.ONLINE) {
          setPlayerSetups([
              { name: player1.name, avatar: player1.avatar }
          ]);
      } else {
        setPlayerSetups(currentSetups => {
            const newSetups = Array.from({ length: numberOfPlayers }, (_, i) => {
                if (i === 0) return { name: player1.name, avatar: player1.avatar };
                if (currentSetups[i]) return currentSetups[i];
                return { name: `Player ${i + 1}`, avatar: AVATAR_OPTIONS[(i + 1) % AVATAR_OPTIONS.length] };
            });
            return newSetups.slice(0, numberOfPlayers);
        });
      }
    }
  }, [numberOfPlayers, gameStatus, player1?.name, player1?.avatar, gameMode]);


  const getWinnerMessage = (winner: Player | 'tie' | null) => {
    if (winner === 'tie') return "It's a Draw!";
    if (winner) return `${winner.name} Wins!`;
    return 'Game Over';
  };

  const handleStartGame = () => {
    playSound('click');
    let finalSetups = playerSetups;
    if (gameMode === GameMode.PVP) {
        finalSetups = playerSetups.map((p, i) => ({
            ...p,
            name: p.name.trim() === '' ? `Player ${i + 1}` : p.name,
        }));
    } else if (gameMode === GameMode.ONLINE) {
        if (isHosting) {
            createRoom(playerSetups[0], selectedBoardSize, theme);
        } else {
            joinRoom(roomCodeToJoin, playerSetups[0]);
        }
        return;
    } else {
        finalSetups = [
            {
                ...playerSetups[0],
                name: playerSetups[0].name.trim() === '' ? `Player 1` : playerSetups[0].name,
            },
            AI_PLAYER_PROFILE
        ];
    }
    startGame(selectedBoardSize, finalSetups, gameMode, gameMode === GameMode.PVE ? aiDifficulty : null, theme);
  };
  
  const handleStartOnlineGame = () => {
    if (!room) return;
    startGameOnline(); // Just tell server to start with a seed
  };

  const handlePlayAgain = () => {
    const player1Won = winner !== 'tie' && winner?.id === 1;
    if(player1Won) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    }
    playSound('start');
    resetGame();
  };

  const handleCloseGameOverModal = () => {
    playSound('click');
    resetGame();
  };
  
  const handlePlayerSetupChange = (index: number, field: 'name' | 'avatar', value: string) => {
    playSound('click');
    setPlayerSetups(prevSetups => {
        const newSetups = [...prevSetups];
        const updatedProfile = { ...newSetups[index], [field]: value };
        newSetups[index] = updatedProfile;

        if (index === 0) {
            setPlayerProfile(updatedProfile);
        }
        return newSetups;
    });
  };

  const handleOpenStats = () => {
    playSound('click');
    setIsStatsModalOpen(true);
  };

  const handleCloseStats = () => {
    setIsStatsModalOpen(false);
  };

  const highestScore = (gameStatus === GameStatus.GameOver && players) ? Math.max(0, ...players.map(p => p.score)) : 0;

  // DEFENSIVE GUARD: Ensure basic state integrity before final render
  if (!players || !Array.isArray(players) || players.length === 0) {
    if (gameStatus !== GameStatus.Lobby) {
        console.error('CRITICAL: State corruption detected - Players list missing.');
    }
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-cyber-blue/20 border-t-cyber-blue rounded-full animate-spin"></div>
            <p className="font-orbitron text-cyber-blue animate-pulse tracking-[0.5em] text-sm">SYNCHRONIZING_MATRIX...</p>
        </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-white flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden touch-manipulation">
      {showConfetti && <Confetti />}
      <div className="stars stars-1"></div>
      <div className="stars stars-2"></div>
      <div className="stars stars-3"></div>

      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
        currentTheme === 'Space' ? 'opacity-30 bg-indigo-900/40' : 
        currentTheme === 'Tech' ? 'opacity-20 bg-emerald-900/40' : 'opacity-0'
      }`}></div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
         <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 transition-colors"
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
         >
            {isMuted ? (
                <SoundOffIcon className="w-6 h-6 text-slate-400" />
            ) : (
                <SoundOnIcon className="w-6 h-6 text-cyan-400" />
            )}
         </button>
         <button 
            onClick={handleOpenStats}
            className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 transition-colors"
            aria-label="View stats"
        >
            <StatsIcon className="w-6 h-6 text-cyan-400" />
        </button>
        <button 
            onClick={toggleFullscreen} 
            className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/70 transition-colors"
            aria-label={isFullscreen ? 'Exit full-screen' : 'Enter full-screen'}
        >
            {isFullscreen ? (
            <FullScreenExitIcon className="w-6 h-6 text-cyan-400" />
            ) : (
            <FullScreenEnterIcon className="w-6 h-6 text-cyan-400" />
            )}
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-7xl mx-auto">
        <header className="text-center mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-orbitron text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] h-16 sm:h-20 flex items-center justify-center">
            {isIntroVisible ? (
              <>
                <span className="typewriter-word animate-memory">Memory</span>
                <span className="w-2 sm:w-4"></span>
                <span className="typewriter-word animate-wars">Wars</span>
              </>
            ) : (
              'Memory Wars'
            )}
          </h1>
          <p className={`text-slate-400 mt-2 text-sm sm:text-base ${isIntroVisible ? 'animate-subtitle' : ''}`}>
            {gameMode === GameMode.ONLINE ? `Room: ${room?.id || 'Connecting...'}` : 'A real-time multiplayer memory challenge.'}
          </p>
        </header>
        
        {gameStatus === GameStatus.Playing || gameStatus === GameStatus.GameOver ? (
          <main className="w-full flex flex-col items-center flex-grow">
            <Scoreboard players={players} activePlayerId={activePlayerId} lastScoringPlayerId={lastScoringPlayerId} />
            
            {gameStatus === GameStatus.Playing && (
              <div className="flex flex-wrap justify-center gap-3 mb-6 px-4">
                {POWER_UPS.map(pu => {
                  const currentPlayer = players.find(p => p.id === activePlayerId);
                  const canAfford = currentPlayer && currentPlayer.energy >= pu.cost;
                  const isLocalTurn = gameMode !== GameMode.ONLINE || (socket && players.find(p => p.socketId === socket.id)?.id === activePlayerId);
                  
                  return (
                    <button
                      key={pu.id}
                      onClick={() => {
                        if (gameMode === GameMode.ONLINE) {
                            sendInput('USE_POWER_UP', { powerUpType: pu.id });
                        } else {
                            usePowerUp(pu.id as PowerUpType, activePlayerId);
                        }
                      }}
                      disabled={!canAfford || !isLocalTurn || isAIThinking || flippedCardIndices.length > 0}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300
                        ${canAfford && isLocalTurn && !isAIThinking ? 'bg-slate-800/80 border-cyan-500/50 hover:border-cyan-400 hover:scale-105 hover:bg-slate-700 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/50 border-slate-700 opacity-50 grayscale cursor-not-allowed'}
                      `}
                      title={`${pu.name}: ${pu.description} (Cost: ${pu.cost} Energy)`}
                    >
                      <span className="text-xl">{pu.icon}</span>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{pu.name}</span>
                        <span className="text-sm font-black text-cyan-400 font-orbitron">{pu.cost}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <GameBoard 
              board={board} 
              onCardClick={handleCardClick}
              disabled={flippedCardIndices.length === 2 || isAIThinking || (gameMode === GameMode.ONLINE && activePlayerId !== players.find(p => p.socketId === socket?.id)?.id)}
              isShaking={isShaking}
            />
          </main>
        ) : null}

        <GameSetupModal
            isOpen={!isIntroVisible && gameStatus === GameStatus.Lobby && !room}
            onStartGame={handleStartGame}
            playerSetups={playerSetups}
            onPlayerSetupChange={handlePlayerSetupChange}
            numberOfPlayers={numberOfPlayers}
            onNumberOfPlayersChange={(num) => { playSound('click'); setNumberOfPlayers(num); }}
            selectedBoardSize={selectedBoardSize}
            onBoardSizeChange={(size) => { playSound('click'); setSelectedBoardSize(size); }}
            gameMode={gameMode}
            onGameModeChange={(mode) => { playSound('click'); dispatch({ type: 'SYNC_ONLINE_STATE', payload: { gameMode: mode } }); }}
            aiDifficulty={aiDifficulty}
            onAIDifficultyChange={(difficulty) => { playSound('click'); setAiDifficulty(difficulty); }}
            theme={theme}
            onThemeChange={(t) => { playSound('click'); setTheme(t); }}
            isHosting={isHosting}
            onIsHostingChange={(hosting) => { playSound('click'); setIsHosting(hosting); }}
            roomCodeToJoin={roomCodeToJoin}
            onRoomCodeChange={setRoomCodeToJoin}
        />

        {!isIntroVisible && gameStatus === GameStatus.Lobby && room && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-blue to-transparent animate-pulse"></div>
                  <h2 className="text-3xl font-black font-orbitron text-center text-white mb-8 tracking-wider">NET_LINK_READY</h2>
                  
                  <div className="text-center mb-10 bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group/code">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Access_Vector</p>
                      <h3 className="text-5xl font-black tracking-[0.2em] text-cyber-blue font-mono group-hover/code:scale-110 transition-transform cursor-pointer" title="Click to copy">
                          {room.id}
                      </h3>
                      <div className="absolute inset-0 border border-cyber-blue opacity-0 group-hover/code:opacity-10 transition-opacity rounded-2xl" />
                  </div>
                  
                  <div className="mb-8 space-y-4">
                      <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active_Nodes</p>
                          <span className="text-cyber-blue text-[10px] font-black bg-cyber-blue/5 border border-cyber-blue/20 px-3 py-1 rounded-full">{room.players.length} / {room.settings.maxPlayers}</span>
                      </div>
                      <div className="space-y-3">
                        {room.players.map(p => {
                            const AvatarComponent = getAvatar(p.avatar);
                            return (
                                <div key={p.id} className="flex items-center gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800/50 hover:border-cyber-blue/30 transition-all group/player">
                                    <div className="relative">
                                        {AvatarComponent && <AvatarComponent className="w-10 h-10 rounded-full ring-2 ring-slate-800 group-hover/player:ring-cyber-blue transition-all" />}
                                        {room.hostId === p.socketId && <div className="absolute -top-1 -right-1 bg-cyber-blue text-slate-900 w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900 text-[8px] font-black">H</div>}
                                    </div>
                                    <span className="font-bold text-white tracking-tight">{p.name}</span>
                                    {p.socketId === socket?.id && <span className="ml-auto text-[8px] font-black text-cyber-pink animate-pulse">YOU</span>}
                                </div>
                            )
                        })}
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={leaveRoom} className="flex-1 bg-slate-800 border-2 border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all">
                          Abort
                      </button>
                      {isHosting && (
                          <button 
                               onClick={handleStartOnlineGame} 
                               disabled={room.players.length < 2} 
                               className={`flex-1 font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-xl ${room.players.length >= 2 ? 'bg-cyber-blue hover:bg-white text-slate-900 shadow-cyber-blue/20 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                          >
                               Engage
                          </button>
                      )}
                  </div>
              </div>
            </div>
        )}

        <Modal isOpen={gameStatus === GameStatus.GameOver} title="Mission Result" onClose={handleCloseGameOverModal}>
          <div className="space-y-8">
            <div className="flex flex-wrap justify-center gap-4">
              {players.map(p => {
                const AvatarComponent = getAvatar(p.avatar);
                const isTopScorer = p.score === highestScore && highestScore > 0;
                const isSingleWinner = isTopScorer && winner !== 'tie';

                return (
                  <div 
                    key={p.id} 
                    className={`relative p-6 rounded-2xl transition-all duration-500 flex flex-col items-center gap-3 flex-1 min-w-[140px] max-w-[200px] border-2 ${
                      isTopScorer 
                        ? 'bg-cyber-blue/5 border-cyber-blue shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
                        : 'bg-slate-900/40 border-slate-800 grayscale opacity-60'
                    }`}
                  >
                    {isSingleWinner && (
                      <div className="absolute -top-6 -right-4 z-20">
                        <CrownIcon className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-bounce" />
                      </div>
                    )}
                    
                    <div className="relative">
                      {AvatarComponent && <AvatarComponent className={`w-16 h-16 rounded-full ring-2 ${isTopScorer ? 'ring-cyber-blue' : 'ring-slate-800'}`} />}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900 ${isTopScorer ? 'bg-cyber-blue text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                        {players.indexOf(p) + 1}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={`font-black uppercase tracking-tighter text-sm ${isTopScorer ? 'text-white' : 'text-slate-500'}`}>{p.name}</div>
                      <div className={`text-4xl font-black font-orbitron leading-none mt-1 ${isTopScorer ? 'text-cyber-blue' : 'text-slate-700'}`}>{p.score}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handlePlayAgain}
              className="group relative w-full overflow-hidden rounded-2xl bg-cyber-blue p-5 font-black uppercase tracking-[0.5em] text-slate-900 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,242,255,0.4)] hover:scale-[1.02] active:scale-95"
            >
              <span className="relative z-10 text-xl font-orbitron">Re-Initialize</span>
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
            </button>
          </div>
        </Modal>

        <StatsModal
          isOpen={isStatsModalOpen}
          onClose={handleCloseStats}
          stats={stats}
        />
      </div>
    </div>
  );
};

export default App;