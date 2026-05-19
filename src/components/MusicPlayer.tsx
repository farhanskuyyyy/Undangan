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
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />
      <button
        onClick={togglePlay}
        className="w-12 h-12 bg-cream/80 backdrop-blur-sm border border-sage/20 rounded-full flex items-center justify-center shadow-lg text-sage hover:scale-110 transition-transform"
        aria-label={isPlaying ? "Pause Music" : "Play Music"}
      >
        {isPlaying ? (
          <MusicIcon size={20} className="animate-spin-slow" />
        ) : (
          <Music2 size={20} />
        )}
      </button>
    </div>
  )
}
