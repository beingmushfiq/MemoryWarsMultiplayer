import React, { useMemo } from 'react';

interface ConfettiProps {
  count?: number;
}

const COLORS = ['#22d3ee', '#a3e635', '#f97316', '#ec4899', '#facc15'];

const Confetti: React.FC<ConfettiProps> = ({ count = 150 }) => {
  const confettiPieces = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const left = `${Math.random() * 100}%`;
      const animationDelay = `${Math.random() * 2}s`;
      const animationDuration = `${2 + Math.random() * 2}s`; // Fall duration between 2s and 4s
      const transform = `rotate(${Math.random() * 360}deg)`;

      return (
        <div
          key={index}
          className="confetti-piece"
          style={{
            backgroundColor: color,
            left,
            animationDelay,
            animationDuration,
            transform,
          }}
        />
      );
    });
  }, [count]);

  return <div className="confetti-container">{confettiPieces}</div>;
};

export default Confetti;
