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
    <div className="flex flex-col items-center mx-2 md:mx-6 min-w-[3rem] md:min-w-[4rem]">
      <div className="relative overflow-hidden h-[1.2em] flex items-center justify-center">
        {animate ? (
          <motion.span 
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-serif text-sage tabular-nums block"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        ) : (
          <span className="text-4xl md:text-5xl font-serif text-sage tabular-nums block">
            {value.toString().padStart(2, '0')}
          </span>
        )}
      </div>
      <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-terracotta/70 mt-2">{label}</span>
    </div>
  )

  return (
    <div className="flex justify-center items-center py-16 bg-cream/30 backdrop-blur-sm rounded-[3rem] border border-sage/10 shadow-sm max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="w-full h-full border-4 border-sage m-2 rounded-[2.5rem]" />
      </div>
      <TimeUnit value={timeLeft.days} label="Days" />
      <div className="h-8 w-px bg-terracotta/20" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <div className="h-8 w-px bg-terracotta/20" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <div className="h-8 w-px bg-terracotta/20" />
      <TimeUnit value={timeLeft.seconds} label="Secs" animate />
    </div>
  )
}
