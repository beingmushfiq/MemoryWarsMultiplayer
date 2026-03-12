import React, { useMemo } from 'react';
import { CardData } from '../types';
import Card from './Card';

interface GameBoardProps {
  board: CardData[];
  onCardClick: (index: number) => void;
  disabled: boolean;
  isShaking: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCardClick, disabled, isShaking }) => {
  const boardSize = board.length;

  if (boardSize === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4 text-cyber-blue animate-pulse">
        <div className="w-12 h-12 border-4 border-cyber-blue/30 border-t-cyber-blue rounded-full animate-spin"></div>
        <p className="font-orbitron text-xs tracking-[0.3em] uppercase">Recalibrating_Neural_Grid...</p>
      </div>
    );
  }

  // Calculate the ideal number of columns based on board size
  const gridConfig = useMemo(() => {
    if (boardSize <= 16) return { cols: 4, mobileCols: 4 };
    if (boardSize <= 24) return { cols: 6, mobileCols: 4 };
    if (boardSize <= 30) return { cols: 6, mobileCols: 5 };
    if (boardSize <= 36) return { cols: 6, mobileCols: 6 };
    return { cols: 8, mobileCols: 6 };
  }, [boardSize]);

  // Use CSS Grid with dynamic columns and gap
  // We use aspect-square on cards and ensure the board stays within viewport limits
  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div 
        className={`grid gap-2 sm:gap-4 w-full h-full max-h-[70vh] items-center justify-center ${disabled ? 'pointer-events-none' : ''} ${isShaking ? 'shake' : ''}`}
        style={{
          gridTemplateColumns: `repeat(var(--grid-cols), minmax(0, 1fr))`,
          maxWidth: 'min(100%, 70vh * var(--aspect-ratio))',
          margin: '0 auto',
          '--grid-cols': window.innerWidth < 640 ? gridConfig.mobileCols : gridConfig.cols,
          '--aspect-ratio': (window.innerWidth < 640 ? gridConfig.mobileCols : gridConfig.cols) / (boardSize / (window.innerWidth < 640 ? gridConfig.mobileCols : gridConfig.cols)),
        } as React.CSSProperties}
      >
        {board.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => onCardClick(index)}
            delay={index * 15}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;