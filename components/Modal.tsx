import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 200); // Corresponds to animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-[100] ${isOpen ? 'modal-enter' : 'modal-leave'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Premium Cyber Border Container */}
      <div className="modal-content w-full max-w-xl mx-4 relative group">
        {/* Animated Corner Accents */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyber-blue shadow-[0_0_15px_rgba(0,242,255,0.5)] z-20" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-cyber-pink shadow-[0_0_15px_rgba(255,0,255,0.5)] z-20" />
        
        <div className="relative bg-slate-900/90 border border-slate-800 rounded-lg shadow-2xl overflow-hidden glass-morphism">
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10" />
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-8 relative">
              <div className="space-y-1">
                <h2 id="modal-title" className="text-4xl font-black font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-white to-cyber-pink animate-pulse-glow">
                  {title}
                </h2>
                <div className="flex gap-1">
                  <div className="h-0.5 w-12 bg-cyber-blue/50" />
                  <div className="h-0.5 w-4 bg-cyber-pink/50" />
                  <div className="h-0.5 w-2 bg-white/50" />
                </div>
              </div>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all duration-300"
                  aria-label="Terminate interface"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="relative z-20">
              {children}
            </div>
          </div>
          
          {/* Bottom Data Bar Decor */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent flex justify-center items-center gap-4">
             <div className="w-1 h-1 rounded-full bg-cyber-blue animate-ping" />
             <div className="w-1 h-1 rounded-full bg-cyber-pink animate-ping [animation-delay:0.2s]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;