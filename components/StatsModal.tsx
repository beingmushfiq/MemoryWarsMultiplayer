import React from 'react';
import Modal from './Modal';
import { GameStats } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

const StatItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-cyber-blue' }) => (
  <div className="flex justify-between items-baseline py-4 border-b border-white/5 last:border-b-0 relative group">
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">{label}</span>
      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-cyber-blue to-transparent transition-all duration-500" />
    </div>
    <span className={`text-3xl font-black font-orbitron ${color} shadow-sm transition-transform group-hover:scale-110`}>{value}</span>
  </div>
);

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  const { gamesPlayed, wins, losses, ties, currentStreak, longestStreak } = stats;

  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(0) + '%' : 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neural Performance">
      <div className="space-y-6">
        {/* Top Grid: Primary Metrics */}
        <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
          <div className="bg-slate-900/80 p-6 flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engagements</span>
            <div className="text-5xl font-black font-orbitron text-white leading-none">{gamesPlayed}</div>
          </div>
          <div className="bg-slate-900/80 p-6 flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Success Rate</span>
            <div className="text-5xl font-black font-orbitron text-cyber-blue leading-none">{winRate}</div>
          </div>
        </div>
        
        {/* Detailed Breakdown */}
        <div className="bg-slate-900/40 p-6 rounded-xl border border-white/5 space-y-1">
          <StatItem label="Victories" value={wins} color="text-cyber-blue" />
          <StatItem label="Casualties" value={losses} color="text-cyber-pink" />
          <StatItem label="Stalements" value={ties} color="text-slate-400" />
          <StatItem label="Active Sync" value={currentStreak} />
          <StatItem label="Peak Sync" value={longestStreak} />
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="group relative w-full mt-2 overflow-hidden rounded-xl bg-slate-800 p-4 font-black uppercase tracking-[0.4em] text-slate-400 transition-all hover:bg-slate-700 hover:text-white"
        >
          <span className="relative z-10">DISCONNECT_LINK</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    </Modal>
  );
};

export default StatsModal;