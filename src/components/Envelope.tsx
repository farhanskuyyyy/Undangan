import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MailOpen } from 'lucide-react'

interface EnvelopeProps {
  groomName: string
  brideName: string
  guestName?: string
  onOpen: () => void
}

export const Envelope: React.FC<EnvelopeProps> = ({ groomName, brideName, guestName, onOpen }) => {
  const [isOpening, setIsOpening] = useState(false)
  const monogram = `${groomName.charAt(0)}${brideName.charAt(0)}`

  const handleOpen = () => {
    setIsOpening(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blush overflow-hidden">
      {/* Background Texture/Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="env-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="#831843" strokeWidth="1" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#env-pattern)" />
        </svg>
      </div>

      <motion.div
        className="relative w-[92vw] max-w-[520px] aspect-[4/3] md:aspect-[3/2]"
        style={{ perspective: '1200px' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* Soft Shadow */}
        <motion.div
          className="absolute -bottom-6 inset-x-8 h-8 bg-burgundy/20 blur-2xl rounded-[100%]"
          animate={isOpening ? { scaleX: 1.2, translateY: 15, opacity: 0.1 } : { scaleX: 1, translateY: 0, opacity: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Envelope Body (Back) - Rich Royal Burgundy */}
        <div className="absolute inset-0 bg-burgundy rounded-3xl shadow-2xl border border-burgundy/50" />

        {/* Inner Card (Invitation) */}
        <motion.div
          className="absolute inset-x-4 bottom-4 bg-white rounded-2xl shadow-inner flex flex-col items-center justify-center p-6 md:p-8 text-center z-10 border border-primary/10"
          initial={{ y: 0 }}
          animate={isOpening ? { y: '-80%', scale: 1.05 } : { y: 0 }}
          transition={{
            delay: 0.8,
            duration: 1.8,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          onAnimationComplete={() => {
            if (isOpening) {
              setTimeout(onOpen, 600)
            }
          }}
          style={{ height: 'calc(100% - 2rem)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5 }}
            className="w-full flex flex-col items-center justify-center"
          >
            <span className="text-primary font-bold tracking-[0.3em] text-[8px] md:text-[10px] mb-2 uppercase">
              The Wedding Of
            </span>
            <h1 className="text-3xl md:text-5xl font-script italic text-burgundy mb-4 md:mb-6 leading-tight">
              {groomName} & {brideName}
            </h1>
            <div className="h-0.5 w-12 md:w-16 bg-gold/50 mx-auto mb-4 md:mb-6" />
            <span className="text-gray-400 italic text-[10px] md:text-xs mb-1 uppercase tracking-widest font-sans">
              Special Guest
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-burgundy leading-tight max-w-[90%] truncate font-medium">
              {guestName || 'Tamu Undangan'}
            </h2>
          </motion.div>
        </motion.div>

        {/* Envelope Top Flap (3D opening) */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-burgundy to-primary origin-top z-30 border-t border-white/10"
          initial={{ rotateX: 0 }}
          animate={isOpening ? { rotateX: 180, zIndex: 5 } : { rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.45, 0.05, 0.55, 0.95] }}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        />

        {/* Envelope Front Panels */}
        <div
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl"
          style={{
            clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(135deg, #831843 0%, #DB2777 100%)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Wax Seal / Interactive Opener */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[52%] z-40 flex flex-col items-center gap-4 w-full px-8 md:px-12"
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                className="text-center mb-1 bg-white/95 backdrop-blur-md px-6 md:px-10 py-4.5 rounded-2xl shadow-xl border border-primary/20 relative w-fit max-w-[85%] border-t-2 border-b-2"
              >
                {/* Decorative side lines */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[1px] h-6 bg-primary/20" />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[1px] h-6 bg-primary/20" />

                <span className="text-primary/60 italic text-[9px] md:text-xs mb-1 font-semibold tracking-[0.25em] uppercase block">
                  Dear Beloved Guest
                </span>
                <h2 className="text-burgundy text-xl md:text-3xl font-serif tracking-wide leading-tight truncate px-2 font-medium">
                  {guestName || 'Tamu Undangan'}
                </h2>
              </motion.div>

              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.08, rotate: [0, -3, 3, -3, 0] }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpen}
                  className="relative group scale-90 md:scale-100 cursor-pointer"
                >
                  {/* Premium Gold Wax Seal */}
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gold rounded-full shadow-[0_12px_24px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center border-4 border-gold/80 relative overflow-hidden transform-gpu">
                    {/* Metallic Gold Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                    
                    {/* Inner recessed circle */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-burgundy/10 flex items-center justify-center bg-gradient-to-tr from-gold to-[#EAB308] shadow-[inset_0_4px_8px_rgba(0,0,0,0.25)]">
                      <span className="text-burgundy font-script text-3xl md:text-4xl select-none drop-shadow-[0_1.5px_2px_rgba(255,255,255,0.5)] leading-none pt-1">
                        {monogram}
                      </span>
                    </div>
                  </div>

                  {/* Ripple Effect */}
                  <motion.div
                    className="absolute -inset-4 border border-gold/40 rounded-full"
                    animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-burgundy font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg border border-primary/25 flex items-center gap-2"
                >
                  <MailOpen className="w-4 h-4 text-primary animate-pulse" />
                  <span>Buka Undangan</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
