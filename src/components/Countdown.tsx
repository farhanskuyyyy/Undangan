import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const Countdown = ({ targetDate }: { targetDate: string }) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(targetDate) - +new Date()
    let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const TimeUnit = ({ value, label, animate = false }: { value: number; label: string; animate?: boolean }) => (
    <div className="flex flex-col items-center mx-1 md:mx-6 min-w-[2.5rem] md:min-w-[4rem]">
      <div className="relative h-[1.4em] md:h-[1.6em] flex items-center justify-center overflow-hidden">
        {animate ? (
          <motion.span 
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-5xl font-serif text-sage tabular-nums block leading-none"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        ) : (
          <span className="text-3xl md:text-5xl font-serif text-sage tabular-nums block leading-none">
            {value.toString().padStart(2, '0')}
          </span>
        )}
      </div>
      <span className="text-[8px] md:text-xs uppercase tracking-[0.2em] text-terracotta/70 mt-1 md:mt-2">{label}</span>
    </div>
  )

  return (
    <div className="flex justify-center items-center py-10 md:py-20 bg-cream/30 backdrop-blur-sm rounded-[2rem] md:rounded-[4rem] border border-sage/10 shadow-sm max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-2 md:inset-4 border-4 border-sage rounded-[1.8rem] md:rounded-[3rem]" />
      </div>
      <TimeUnit value={timeLeft.days} label="Days" />
      <div className="h-6 md:h-12 w-px bg-terracotta/20" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <div className="h-6 md:h-12 w-px bg-terracotta/20" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <div className="h-6 md:h-12 w-px bg-terracotta/20" />
      <TimeUnit value={timeLeft.seconds} label="Secs" animate />
    </div>
  )
}
