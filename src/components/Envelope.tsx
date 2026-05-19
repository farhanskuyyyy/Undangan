import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MailOpen } from 'lucide-react';

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
        style={{ perspective: '1000px' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Shadow */}
        <div className="absolute -bottom-10 inset-x-10 h-10 bg-black/10 blur-2xl rounded-full" />

        {/* Envelope Body (Back) */}
        <div className="absolute inset-0 bg-sage rounded-lg shadow-2xl" />

        {/* Inner Card (Invitation) */}
        <motion.div
          className="absolute inset-x-4 bottom-4 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center p-8 text-center z-10 border border-gray-100"
          initial={{ y: 0 }}
          animate={isOpening ? { y: '-80%', scale: 1.05 } : { y: 0 }}
          transition={{ 
            delay: 0.8, 
            duration: 1.5, 
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
          className="absolute inset-x-0 top-0 h-1/2 bg-sage-dark origin-top z-30"
          initial={{ rotateX: 0 }}
          animate={isOpening ? { rotateX: 180, zIndex: 5 } : { rotateX: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
          }}
        />

        {/* Envelope Front (Triangular parts) */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ 
            clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(135deg, #829460 0%, #5F7144 100%)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)'
          }}
        />

        {/* Wax Seal / Button */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-6"
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpen}
                className="relative group"
              >
                {/* Wax Seal Effect */}
                <div className="w-20 h-20 bg-terracotta rounded-full shadow-lg flex items-center justify-center border-4 border-[#a67d7d] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                  <MailOpen className="text-white relative z-10" size={32} />
                </div>
                
                {/* Seal Ripple Effect */}
                <motion.div 
                  className="absolute inset-0 bg-terracotta/30 rounded-full"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sage font-light tracking-[0.2em] uppercase text-sm bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full shadow-sm"
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
