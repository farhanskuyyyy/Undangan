import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Petal {
  id: number
  xStart: number // percentage across screen (0-100)
  size: number // diameter/scale
  duration: number // animation speed
  delay: number // animation stagger
  rotation: number // random starting rotation
  swayAmplitude: number // how much it sways left-to-right
  shapeType: number // 0, 1, or 2 for different SVG shapes
}

export const FloatingPetals: React.FC = () => {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    // Generate petals only on client-side
    const generatedPetals: Petal[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      xStart: Math.random() * 100,
      size: Math.random() * 16 + 12, // 12px to 28px
      duration: Math.random() * 12 + 10, // 10s to 22s
      delay: Math.random() * -15, // Negative delay to start immediately in various positions
      rotation: Math.random() * 360,
      swayAmplitude: Math.random() * 80 + 40, // 40px to 120px sway
      shapeType: Math.floor(Math.random() * 3), // 3 distinct petal SVG paths
    }))
    setPetals(generatedPetals)
  }, [])

  // 3 different rose petal shapes (in soft pastel pink colors)
  const getPetalSvg = (shapeType: number) => {
    switch (shapeType) {
      case 0:
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C5.5 2 2 7.5 2 12C2 17.5 7 22 12 22C17 22 22 18.5 22 13C22 7.5 18.5 2 12 2Z"
              fill="#F472B6"
              fillOpacity="0.45"
            />
            <path
              d="M12 4C7.5 4 4.5 8 4.5 12C4.5 16 8.5 20 12 20C15.5 20 19.5 16.5 19.5 12.5C19.5 8.5 16.5 4 12 4Z"
              fill="#F43F5E"
              fillOpacity="0.15"
            />
          </svg>
        )
      case 1:
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C7 2 2 5.5 2 10.5C2 15.5 6.5 21.5 12 22C17.5 22.5 22 17 22 12C22 7 17 2 12 2Z"
              fill="#FBCFE8"
              fillOpacity="0.5"
            />
            <path
              d="M12 3.5C8.5 3.5 4.5 6.5 4.5 10.5C4.5 14.5 8 19.5 12 20C16 20.5 19.5 16 19.5 12C19.5 8 15.5 3.5 12 3.5Z"
              fill="#EC4899"
              fillOpacity="0.1"
            />
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C12 2 2 9 2 13.5C2 18 6.5 22 12 22C17.5 22 22 18 22 13.5C22 9 12 2 12 2Z"
              fill="#FDA4AF"
              fillOpacity="0.55"
            />
            <path
              d="M12 5.5C12 5.5 4.5 11 4.5 14C4.5 17 7.5 20 12 20C16.5 20 19.5 17 19.5 14C19.5 11 12 5.5 12 5.5Z"
              fill="#E11D48"
              fillOpacity="0.08"
            />
          </svg>
        )
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            width: petal.size,
            height: petal.size,
            left: `${petal.xStart}%`,
            top: `-5%`,
          }}
          initial={{
            y: '-10%',
            x: 0,
            rotate: petal.rotation,
            opacity: 0,
          }}
          animate={{
            y: '110vh',
            x: [
              -petal.swayAmplitude / 2,
              petal.swayAmplitude / 2,
              -petal.swayAmplitude / 2,
            ],
            rotate: [petal.rotation, petal.rotation + 360, petal.rotation + 720],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: 'linear',
            x: {
              duration: petal.duration / 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
            opacity: {
              times: [0, 0.1, 0.85, 1],
              duration: petal.duration,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {getPetalSvg(petal.shapeType)}
        </motion.div>
      ))}
    </div>
  )
}
