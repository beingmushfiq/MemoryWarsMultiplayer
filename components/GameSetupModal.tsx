import React from 'react';
import Modal from './Modal';
import { Profile, GameMode, AIDifficulty } from '../types';
import { BOARD_SIZE_OPTIONS, AI_DIFFICULTY_LEVELS } from '../constants';
import { AVATAR_OPTIONS, getAvatar } from './avatars';
import { CpuIcon, UsersIcon } from './icons';

interface GameSetupModalProps {
  isOpen: boolean;
  onStartGame: () => void;
  playerSetups: Profile[];
  onPlayerSetupChange: (index: number, field: 'name' | 'avatar', value: string) => void;
  numberOfPlayers: number;
  onNumberOfPlayersChange: (num: number) => void;
  selectedBoardSize: number;
  onBoardSizeChange: (size: number) => void;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  aiDifficulty: AIDifficulty;
  onAIDifficultyChange: (difficulty: AIDifficulty) => void;
  theme?: string;
  onThemeChange?: (theme: string) => void;
  isHosting?: boolean;
  onIsHostingChange?: (isHosting: boolean) => void;
  roomCodeToJoin?: string;
  onRoomCodeChange?: (code: string) => void;
}

const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  onStartGame,
  playerSetups,
  onPlayerSetupChange,
  numberOfPlayers,
  onNumberOfPlayersChange,
  selectedBoardSize,
  onBoardSizeChange,
  gameMode,
  onGameModeChange,
  aiDifficulty,
  onAIDifficultyChange,
  theme = 'Classic',
  onThemeChange,
  isHosting = true,
  onIsHostingChange,
  roomCodeToJoin = '',
  onRoomCodeChange,
}) => {
  return (
    <Modal isOpen={isOpen} title="System Configuration">
      <div className="space-y-8 py-2">
        {/* Game Mode Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-cyber-blue shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Operation Mode</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: GameMode.PVP, label: 'Dual Link', icon: UsersIcon, desc: 'Local PvP' },
              { id: GameMode.PVE, label: 'Cortex AI', icon: CpuIcon, desc: 'vs Neural Net' },
              { id: GameMode.ONLINE, label: 'Net Link', icon: UsersIcon, desc: 'Online Ops' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => onGameModeChange(mode.id)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden ${
                  gameMode === mode.id
                    ? 'bg-cyber-blue/10 border-cyber-blue shadow-[0_0_20px_rgba(0,242,255,0.1)]'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
                aria-pressed={gameMode === mode.id}
              >
                <div className="flex flex-col gap-1 relative z-10">
                  <mode.icon className={`w-5 h-5 ${gameMode === mode.id ? 'text-cyber-blue' : 'text-slate-500'}`} />
                  <span className={`font-bold tracking-tight ${gameMode === mode.id ? 'text-white' : 'text-slate-400'}`}>{mode.label}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{mode.desc}</span>
                </div>
                {gameMode === mode.id && <div className="absolute top-0 right-0 w-8 h-8 bg-cyber-blue/10 rounded-bl-3xl border-b border-l border-cyber-blue/20" />}
              </button>
            ))}
          </div>
        </div>
        
        {/* Player Profile Setup */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-cyber-blue shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Identity Matrix</label>
          </div>
          <div className="flex flex-wrap gap-4">
            {playerSetups.slice(0, gameMode === GameMode.PVP ? numberOfPlayers : 1).map((setup, index) => (
              <div key={index} className="flex-1 min-w-[280px] p-4 bg-slate-900/60 rounded-xl border border-slate-800/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-cyber-blue transition-colors" />
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      {getAvatar(setup.avatar) && React.createElement(getAvatar(setup.avatar)!, { className: "w-16 h-16 rounded-full ring-2 ring-slate-800 group-hover:ring-cyber-blue/30 transition-all" })}
                      <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow space-y-3">
                    <input
                      type="text"
                      value={setup.name}
                      onChange={(e) => onPlayerSetupChange(index, 'name', e.target.value)}
                      placeholder="Ident..."
                      className="w-full bg-transparent border-b border-slate-800 focus:border-cyber-blue transition-colors py-1 text-lg font-bold text-white outline-none placeholder:text-slate-700"
                      maxLength={12}
                    />
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_OPTIONS.map(avatarKey => {
                        const AvatarComp = getAvatar(avatarKey);
                        return AvatarComp && (
                          <button
                            key={avatarKey}
                            onClick={() => onPlayerSetupChange(index, 'avatar', avatarKey)}
                            className={`rounded-full p-0.5 transition-all ${setup.avatar === avatarKey ? 'bg-cyber-blue scale-110' : 'bg-slate-800 hover:bg-slate-700 opacity-50 hover:opacity-100'}`}
                          >
                            <AvatarComp className="w-full h-full" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Group 1: Game Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-4 bg-cyber-blue shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Environment</label>
            </div>
            
            <div className="space-y-4">
              {gameMode === GameMode.PVP && (
                <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Fleet Size</span>
                  <div className="flex gap-2">
                    {[2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => onNumberOfPlayersChange(num)}
                        className={`w-8 h-8 rounded-md font-bold transition-all ${numberOfPlayers === num ? 'bg-cyber-blue text-slate-900 shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gameMode === GameMode.PVE && (
                <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Core Power</span>
                  <div className="flex gap-1">
                    {[AIDifficulty.Easy, AIDifficulty.Medium, AIDifficulty.Hard].map(level => (
                      <button
                        key={level}
                        onClick={() => onAIDifficultyChange(level)}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${aiDifficulty === level ? 'bg-cyber-blue text-slate-900 shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'bg-slate-800 text-slate-500'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gameMode === GameMode.ONLINE && (
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 space-y-3">
                  <div className="flex gap-2">
                    <button onClick={() => onIsHostingChange?.(true)} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-all ${isHosting ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Initiate</button>
                    <button onClick={() => onIsHostingChange?.(false)} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-all ${!isHosting ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Receive</button>
                  </div>
                  {!isHosting && (
                    <input
                      type="text"
                      value={roomCodeToJoin}
                      onChange={(e) => onRoomCodeChange?.(e.target.value.toUpperCase())}
                      placeholder="ACCESS_CODE"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-center font-mono text-cyber-blue tracking-[0.5em] focus:border-cyber-blue/50 outline-none"
                      maxLength={6}
                    />
                  )}
                </div>
              )}

              {/* Board Size Picker */}
              <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Data High</span>
                <div className="flex gap-2">
                  {BOARD_SIZE_OPTIONS.map(size => (
                    <button
                      key={size}
                      onClick={() => onBoardSizeChange(size)}
                      className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${selectedBoardSize === size ? 'bg-cyber-blue text-slate-900 shadow-[0_0_8px_rgba(0,242,255,0.3)]' : 'bg-slate-800 text-slate-500'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Visual Theme */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-4 bg-cyber-pink shadow-[0_0_8px_rgba(255,0,255,0.5)]" />
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Skin Overlay</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Classic', 'Tech', 'Space', 'Food'].map(t => (
                <button
                  key={t}
                  onClick={() => onThemeChange?.(t)}
                  className={`p-3 rounded-lg border text-sm font-bold transition-all relative overflow-hidden group/theme ${
                    theme === t
                      ? 'border-cyber-pink bg-cyber-pink/5 text-white shadow-[0_0_15px_rgba(255,0,255,0.1)]'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className="relative z-10">{t}</span>
                  {theme === t && <div className="absolute inset-0 bg-gradient-to-tr from-cyber-pink/20 to-transparent animate-pulse" />}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-pink group-hover/theme:w-full transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Final Execution Button */}
        <button
          onClick={onStartGame}
          className={`group relative w-full overflow-hidden rounded-xl p-4 font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95 ${
            gameMode === GameMode.ONLINE && !isHosting && !roomCodeToJoin.trim()
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-cyber-blue text-slate-900 hover:shadow-[0_0_30px_rgba(0,242,255,0.4)]'
          }`}
          disabled={gameMode === GameMode.ONLINE && !isHosting && !roomCodeToJoin.trim()}
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
             <span className="text-xl">
               {gameMode === GameMode.ONLINE ? (isHosting ? 'INITIALIZE ROOM' : 'CONNECT LINK') : 'START OPERATION'}
             </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
    </Modal>
  );
};

export default GameSetupModal;