import { useState, useRef, useEffect } from 'react'
import { Music as MusicIcon, Music2 } from 'lucide-react'

interface MusicPlayerProps {
  autoPlay?: boolean
}

export const MusicPlayer = ({ autoPlay = false }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (autoPlay && audioRef.current && !isPlaying) {
      audioRef.current.currentTime = 69 // Start from 1:09 (Risk it all / highlight part)
      audioRef.current.play().catch(err => console.log('Autoplay blocked:', err))
      setIsPlaying(true)
    }
  }, [autoPlay])

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
    <div className="fixed bottom-6 right-6 z-50">
      <audio
        ref={audioRef}
        loop
        src="/lagu.mp3"
      />
      <button
        onClick={togglePlay}
        className="relative w-16 h-16 flex items-center justify-center group focus:outline-none"
        aria-label={isPlaying ? "Pause Music" : "Play Music"}
      >
        {/* Vinyl Record Background */}
        <div className={`absolute inset-0 bg-neutral-900 rounded-full shadow-2xl border-4 border-neutral-800 transition-all duration-500 ${isPlaying ? 'animate-spin-slow' : 'scale-95 opacity-80'}`}>
          {/* Vinyl Grooves */}
          <div className="absolute inset-2 border border-neutral-700/30 rounded-full"></div>
          <div className="absolute inset-4 border border-neutral-700/30 rounded-full"></div>
          <div className="absolute inset-6 border border-neutral-700/30 rounded-full"></div>
          
          {/* Center Label */}
          <div className="absolute inset-5 bg-sage rounded-full flex items-center justify-center border-2 border-neutral-900">
            <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>
          </div>
        </div>

        {/* Play/Pause Icon Overlay */}
        <div className="relative z-10 text-white/80 group-hover:text-white transition-colors">
          {isPlaying ? (
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-current animate-pulse"></span>
              <span className="w-1 h-4 bg-current animate-pulse [animation-delay:0.2s]"></span>
            </div>
          ) : (
            <Music2 size={24} />
          )}
        </div>

        {/* Decorative Ring */}
        <div className={`absolute -inset-2 border border-sage/20 rounded-full transition-all duration-700 ${isPlaying ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}`}></div>
      </button>
    </div>
  )
}
