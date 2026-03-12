import React, { useEffect, useRef, useState } from 'react';
import { CardData } from '../types';
import { getIcon } from './icons';

interface CardProps {
  card: CardData;
  onClick: () => void;
  delay: number;
  disabled: boolean;
}

const usePrevious = <T,>(value: T) => {
  // FIX: Explicitly provide `undefined` as the initial value for `useRef` to resolve type inference issues.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const Sparkles = () => (
    <div className="sparkle-container">
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
    </div>
);

const Card: React.FC<CardProps> = ({ card, onClick, delay, disabled }) => {
  const { isFlipped, isMatched, value } = card;
  const IconComponent = getIcon(value);
  const [isNew, setIsNew] = useState(true);
  const [justMatched, setJustMatched] = useState(false);
  const [playPopIn, setPlayPopIn] = useState(false);
  const prevIsMatched = usePrevious(isMatched);
  const prevIsFlipped = usePrevious(isFlipped);

  useEffect(() => {
    if (!prevIsMatched && isMatched) {
      setJustMatched(true);
      const timer = setTimeout(() => setJustMatched(false), 1100);
      return () => clearTimeout(timer);
    }
  }, [isMatched, prevIsMatched]);

  useEffect(() => {
    if (isFlipped && !prevIsFlipped) {
      setPlayPopIn(true);
    }
    if (!isFlipped && prevIsFlipped) {
      setPlayPopIn(false);
    }
  }, [isFlipped, prevIsFlipped]);

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), delay + 500);
    return () => clearTimeout(timer);
  }, [delay]);

  const cardClasses = `relative w-full h-full transition-flip [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`;
  const faceClasses = 'absolute w-full h-full rounded-2xl shadow-2xl flex items-center justify-center [backface-visibility:hidden] overflow-hidden border-2';
  
  // Front of the card (Showing value)
  const frontClasses = 'bg-slate-900/90 backdrop-blur-xl text-cyan-400 [transform:rotateY(180deg)] border-cyan-500/40';
  
  // Back of the card (Face down)
  const backClasses = 'bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 border-indigo-500/50 group-hover:border-cyber-blue shadow-indigo-500/10';
  
  const content = isMatched ? (
    <div className={`w-full h-full bg-slate-900/40 border-2 border-cyan-500/20 rounded-2xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(34,211,238,0.1)] ${justMatched ? 'match-glow' : ''}`}
        role="img"
        aria-label={`Card ${card.id + 1}: ${value}, matched.`}
    >
       <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
       {IconComponent && <IconComponent className="w-1/2 h-1/2 text-cyan-500/20" />}
    </div>
  ) : (
    <button
        className="w-full h-full group focus:outline-none touch-none active:scale-90 transition-transform duration-200"
        onClick={onClick}
        disabled={disabled || isFlipped}
        aria-label={`Card ${card.id + 1}. ${isFlipped ? `Showing ${value}.` : 'Face down.'}`}
        aria-pressed={isFlipped}
    >
      <div className={cardClasses}>
        <div className={`${faceClasses} ${frontClasses}`}>
          {/* Holographic Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,242,255,0.1),transparent_70%)]" />
          
          {IconComponent && <IconComponent className={`w-3/5 h-3/5 ${playPopIn ? 'icon-pop-in' : ''} drop-shadow-[0_0_12px_rgba(0,242,255,0.6)] z-10`} />}
          
          {/* Corner accents */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50" />
        </div>
        
        <div className={`${faceClasses} ${backClasses}`}>
           {/* Card Back Design: Cyber Circuit */}
           <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
             {/* Rotating Ring */}
             <div className="absolute w-16 h-16 border border-indigo-400/20 rounded-full animate-spin [animation-duration:8s]" />
             <div className="absolute w-20 h-20 border border-violet-400/10 rounded-full animate-spin [animation-duration:12s] reverse" />
             
             {/* Center Logo/Icon mark */}
             <div className="z-10 w-8 h-8 rounded-lg bg-slate-900 border border-indigo-400/40 flex items-center justify-center shadow-lg transform group-hover:rotate-45 transition-transform duration-500">
                <div className="w-3 h-3 bg-cyan-400/80 rounded-sm animate-pulse" />
             </div>
             
             {/* Micro-circuit lines */}
             <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-gradient-to-b from-indigo-500/40 to-transparent" />
             <div className="absolute bottom-0 left-1/2 w-[1px] h-1/2 bg-gradient-to-t from-indigo-500/40 to-transparent" />
             <div className="absolute left-0 top-1/2 h-[1px] w-1/2 bg-gradient-to-r from-indigo-500/40 to-transparent" />
             <div className="absolute right-0 top-1/2 h-[1px] w-1/2 bg-gradient-to-l from-indigo-500/40 to-transparent" />
           </div>
        </div>
      </div>
    </button>
  );

  return (
    <div 
      className={`relative w-full aspect-square transition-all duration-500 ${isNew ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} ${justMatched ? 'pulse-match' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
        {content}
        {justMatched && <Sparkles />}
    </div>
  )
};

export default Card;