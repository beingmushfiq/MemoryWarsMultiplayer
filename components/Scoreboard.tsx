import React, { useEffect, useRef, useState } from 'react';
import { Player } from '../types';
import { getAvatar } from './avatars';
import { CpuIcon } from './icons';

const Score: React.FC<{ score: number; scoreClass: string; }> = ({ score, scoreClass }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    if (prevScoreRef.current < score) {
      setIsUpdating(true);
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 500); // Duration of the animation
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  const animationClass = isUpdating ? 'score-updated' : '';

  return (
    <div 
      className={`${scoreClass} ${animationClass} font-bold font-orbitron mt-1`}
      aria-live="polite"
      aria-atomic="true"
    >
      {score}
    </div>
  );
};

const EnergyBar: React.FC<{ energy: number }> = ({ energy }) => {
  return (
    <div className="w-full h-2.5 bg-slate-900/50 rounded-md mt-2 overflow-hidden border border-slate-700/30 relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
      {/* Target Segments (Battery style) */}
      <div className="absolute inset-0 flex justify-between px-0.5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-[1px] h-full bg-slate-800/50 z-10" />
        ))}
      </div>
      
      <div 
        className="h-full bg-gradient-to-r from-cyan-600 via-cyber-blue to-cyan-400 transition-all duration-700 ease-out relative"
        style={{ width: `${energy}%` }}
      >
        <div className="absolute top-0 right-0 w-2 h-full bg-white opacity-40 blur-[2px] animate-pulse" />
      </div>
      
      {/* Overcharge Glow */}
      {energy >= 50 && (
        <div 
            className="absolute inset-0 bg-cyan-400/10 animate-pulse pointer-events-none"
            style={{ width: `${energy}%` }}
        />
      )}
    </div>
  );
};

interface ScoreboardProps {
    players: Player[];
    activePlayerId: number;
    lastScoringPlayerId: number | null;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, activePlayerId, lastScoringPlayerId }) => {
  // DEFENSIVE GUARD: Handle empty or transiently missing player data
  if (!players || players.length === 0) {
    return (
      <div className="flex justify-center my-6 sm:my-8 w-full max-w-5xl mx-auto px-4 opacity-30">
        <div className="bg-slate-900/40 border border-slate-700/50 p-4 rounded-2xl w-full text-center font-orbitron text-xs tracking-widest">
          AWAITING_NEURAL_SIGNATURES...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:justify-center gap-3 sm:gap-6 my-6 sm:my-8 w-full max-w-5xl mx-auto px-4">
      {players.map((player) => {
        const AvatarComponent = getAvatar(player.avatar);
        const isActive = player.id === activePlayerId;
        const isScoring = player.id === lastScoringPlayerId;
        const isAI = player.isAI;

        return (
          <div
            key={player.id}
            className={`
              relative rounded-2xl transition-all duration-500 backdrop-blur-md border flex items-center 
              gap-4 w-full sm:w-auto sm:min-w-[220px] p-4 group
              ${isActive
                ? 'bg-cyan-500/10 border-cyber-blue/50 scale-105 shadow-[0_0_25px_rgba(0,242,255,0.15)] active-player-card'
                : 'bg-slate-900/40 border-slate-700/50 opacity-80 hover:opacity-100 hover:border-slate-600'
              }
              ${isScoring ? 'match-glow' : ''}
            `}
          >
            {/* HUD Bracket Accents */}
            {isActive && (
              <>
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyber-blue rounded-tl-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyber-blue rounded-br-lg" />
              </>
            )}

            <div className="relative flex-shrink-0">
              {AvatarComponent && (
                <div className={`p-0.5 rounded-full ${isActive ? 'ring-2 ring-cyber-blue ring-offset-2 ring-offset-slate-900 animate-pulse' : 'ring-1 ring-slate-700'}`}>
                  <AvatarComponent className="w-14 h-14 rounded-full" />
                </div>
              )}
              {isAI && (
                <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 p-1 rounded-full">
                  <CpuIcon className="w-3 h-3 text-cyan-400" />
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-black uppercase tracking-[0.15em] truncate ${isActive ? 'text-cyber-blue' : 'text-slate-400'}`}>
                  {player.name}
                </span>
                {isActive && (
                   <span className="text-[10px] font-bold text-cyber-blue bg-cyber-blue/20 px-2 py-0.5 rounded-sm animate-pulse flex-shrink-0">
                     LIVE
                   </span>
                )}
              </div>
              
              <div className="flex items-baseline gap-2">
                <Score score={player.score} scoreClass="text-4xl sm:text-5xl text-white" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">Points</span>
              </div>
              
              <EnergyBar energy={player.energy} />
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default Scoreboard;