import { useState, useRef } from 'react'
import { Music as MusicIcon, Music2 } from 'lucide-react'

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Placeholder music
      />
      <button
        onClick={togglePlay}
        className="w-12 h-12 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:scale-110 transition-transform"
      >
        {isPlaying ? <MusicIcon size={20} className="animate-spin-slow" /> : <Music2 size={20} />}
      </button>
    </div>
  )
}
