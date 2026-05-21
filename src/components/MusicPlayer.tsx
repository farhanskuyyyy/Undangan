import { useState, useRef, useEffect } from 'react'
import { Music, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MusicPlayerProps {
  autoPlay?: boolean
}

export const MusicPlayer = ({ autoPlay = false }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [floatingNotes, setFloatingNotes] = useState<{ id: number; x: number; y: number }[]>([])
  const noteCounter = useRef(0)

  useEffect(() => {
    if (autoPlay && audioRef.current && !isPlaying) {
      audioRef.current.currentTime = 70 // Start from 1:10 (Risk it all / highlight part)
      audioRef.current.play().catch((err) => console.log('Autoplay blocked:', err))
      setIsPlaying(true)
    }
  }, [autoPlay])

  // Spawn floating music notes while playing
  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        const id = noteCounter.current++
        const note = {
          id,
          x: Math.random() * 40 - 20, // random offset
          y: Math.random() * -20 - 40, // float upwards
        }
        setFloatingNotes((prev) => [...prev, note])

        // Remove note after 2 seconds
        setTimeout(() => {
          setFloatingNotes((prev) => prev.filter((n) => n.id !== id))
        }, 2000)
      }, 800)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-center">
      {/* Floating Notes */}
      <div className="relative w-0 h-0 overflow-visible pointer-events-none">
        <AnimatePresence>
          {floatingNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.2, 0.8], x: note.x, y: note.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute text-primary text-lg"
            >
              ♪
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <audio ref={audioRef} loop src="/lagu.mp3" />
      
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={togglePlay}
        className="relative w-16 h-16 flex items-center justify-center group focus:outline-none cursor-pointer"
        aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        {/* Glowing Decorative Outer Ring */}
        <div
          className={`absolute -inset-2 border-2 border-primary/20 rounded-full transition-all duration-700 ${
            isPlaying ? 'scale-110 opacity-100 animate-pulse-slow' : 'scale-100 opacity-0'
          }`}
        />

        {/* Outer Vinyl Disc Body - Dark Premium Metallic Charcoal */}
        <div
          className={`absolute inset-0 bg-[#0F172A] rounded-full shadow-2xl border-[3px] border-[#334155] transition-all duration-700 flex items-center justify-center ${
            isPlaying ? 'animate-spin-slow' : 'scale-95 opacity-90'
          }`}
        >
          {/* Vinyl Grooves */}
          <div className="absolute inset-1.5 border border-slate-700/25 rounded-full" />
          <div className="absolute inset-3 border border-slate-700/25 rounded-full" />
          <div className="absolute inset-4.5 border border-slate-700/25 rounded-full" />

          {/* Luxury Gold Monogram center label */}
          <div className="absolute inset-5 bg-gradient-to-tr from-gold to-[#FEF08A] rounded-full flex items-center justify-center border-2 border-[#0F172A] shadow-inner">
            <div className="w-2.5 h-2.5 bg-[#0F172A] rounded-full" />
          </div>
        </div>

        {/* Icon Overlay */}
        <div className="relative z-10 text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center">
          {isPlaying ? (
            <Pause className="w-5 h-5 animate-pulse text-burgundy" />
          ) : (
            <Music className="w-5 h-5 text-burgundy animate-bounce" />
          )}
        </div>
      </motion.button>
    </div>
  )
}
export default MusicPlayer
