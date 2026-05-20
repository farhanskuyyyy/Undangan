import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnvelopeProps {
  groomName: string;
  brideName: string;
  guestName?: string;
  onOpen: () => void;
}

export const Envelope: React.FC<EnvelopeProps> = ({ 
  groomName, 
  brideName, 
  guestName, 
  onOpen 
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const monogram = `${groomName.charAt(0)}&${brideName.charAt(0)}`;

  const handleOpen = () => {
    setIsOpening(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cream overflow-hidden">
      {/* Background Texture/Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="#829460" strokeWidth="1" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      <motion.div 
        className="relative w-[90vw] max-w-[500px] aspect-[3/2]"
        style={{ perspective: '1200px' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Shadow */}
        <motion.div 
          className="absolute -bottom-10 inset-x-10 h-12 bg-black/20 blur-3xl rounded-[100%]"
          animate={isOpening ? { scaleX: 1.2, translateY: 20, opacity: 0.1 } : { scaleX: 1, translateY: 0, opacity: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Envelope Body (Back) */}
        <div className="absolute inset-0 bg-sage rounded-lg shadow-2xl" />

        {/* Inner Card (Invitation) */}
        <motion.div
          className="absolute inset-x-4 bottom-4 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center p-8 text-center z-10 border border-gray-100"
          initial={{ y: 0 }}
          animate={isOpening ? { y: '-80%', scale: 1.05 } : { y: 0 }}
          transition={{ 
            delay: 0.8, 
            duration: 1.8, 
            ease: [0.34, 1.56, 0.64, 1]
          }}
          onAnimationComplete={() => {
            if (isOpening) {
              setTimeout(onOpen, 600);
            }
          }}
          style={{ height: 'calc(100% - 2rem)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-sage font-light tracking-[0.3em] uppercase text-[10px] mb-4">The Wedding Of</p>
            <h1 className="text-3xl md:text-4xl font-serif italic text-sage mb-6 leading-tight">
              {groomName} <br className="md:hidden" /> & <br className="md:hidden" /> {brideName}
            </h1>
            <div className="h-px w-16 bg-terracotta/40 mx-auto mb-6" />
            <p className="text-gray-400 italic text-xs mb-2">Special Guest</p>
            <h2 className="text-xl md:text-2xl font-serif text-sage">{guestName || 'Tamu Undangan'}</h2>
          </motion.div>
        </motion.div>

        {/* Envelope Top Flap (3D opening) */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#5F7144] to-sage origin-top z-30"
          initial={{ rotateX: 0 }}
          animate={isOpening ? { rotateX: 180, zIndex: 5 } : { rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.45, 0.05, 0.55, 0.95] }}
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
          }}
        />

        {/* Envelope Front (Panels) */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-lg"
          style={{ 
            clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(135deg, #829460 0%, #5F7144 100%)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </div>

        {/* Wax Seal / Button */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4 md:gap-6 w-full px-12"
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                className="text-center mb-4 md:mb-6 bg-cream/90 backdrop-blur-sm px-10 py-6 rounded-sm shadow-xl border-t-2 border-b-2 border-sage/20 relative"
              >
                {/* Decorative side lines */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-px h-8 bg-sage/20" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-px h-8 bg-sage/20" />
                
                <p className="text-sage/60 italic text-[10px] md:text-xs mb-2 font-light tracking-[0.3em] uppercase">Special Guest</p>
                <h2 className="text-sage-dark text-2xl md:text-4xl font-serif tracking-wide">
                  {guestName || 'Tamu Undangan'}
                </h2>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: [0, -2, 2, -2, 0] }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpen}
                className="relative group"
              >
                {/* Premium Wax Seal */}
                <div className="w-24 h-24 bg-terracotta rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center border-4 border-terracotta/80 relative overflow-hidden transform-gpu">
                  {/* Wax texture overlay */}
                  <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                  
                  {/* Inner recessed circle */}
                  <div className="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center bg-terracotta shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)]">
                    <span className="text-white font-serif text-2xl font-bold tracking-tighter italic select-none drop-shadow-sm">
                      {monogram}
                    </span>
                  </div>
                </div>
                
                {/* Ripple Effect */}
                <motion.div 
                  className="absolute -inset-4 border-2 border-terracotta/20 rounded-full"
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sage font-light tracking-[0.2em] uppercase text-xs md:text-sm bg-white/70 backdrop-blur-md px-4 md:px-6 py-2 rounded-full shadow-lg border border-white/30"
              >
                Buka Undangan
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
