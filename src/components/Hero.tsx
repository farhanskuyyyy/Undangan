import { motion } from 'framer-motion'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface HeroProps {
  groomName: string
  brideName: string
  weddingDate: string
}

// SVG Bunga (rose with petals) — pure inline, no image dependency
const FlowerLeft = () => (
  <svg
    viewBox="0 0 280 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {/* Stem */}
    <path d="M140 300 Q130 240 120 200 Q110 160 125 130" stroke="#829460" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    {/* Leaf left */}
    <path d="M125 200 Q80 185 70 155 Q100 165 120 185" fill="#829460" fillOpacity="0.7" />
    {/* Leaf right */}
    <path d="M120 230 Q155 210 165 180 Q140 195 125 215" fill="#829460" fillOpacity="0.6" />
    {/* Rose petals outer */}
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#F472B6" fillOpacity="0.7" transform="rotate(-20 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#EC4899" fillOpacity="0.55" transform="rotate(20 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#F9A8D4" fillOpacity="0.7" transform="rotate(-60 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#DB2777" fillOpacity="0.45" transform="rotate(65 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#F472B6" fillOpacity="0.55" transform="rotate(110 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#EC4899" fillOpacity="0.45" transform="rotate(-110 140 100)" />
    {/* Rose center */}
    <circle cx="140" cy="100" r="22" fill="#DB2777" fillOpacity="0.85" />
    <circle cx="140" cy="100" r="14" fill="#831843" fillOpacity="0.7" />
    <circle cx="134" cy="94" r="6" fill="#F9A8D4" fillOpacity="0.5" />
    {/* Smaller bud */}
    <ellipse cx="85" cy="145" rx="12" ry="20" fill="#F472B6" fillOpacity="0.6" transform="rotate(-30 85 145)" />
    <ellipse cx="85" cy="145" rx="12" ry="20" fill="#EC4899" fillOpacity="0.5" transform="rotate(30 85 145)" />
    <circle cx="85" cy="145" r="9" fill="#DB2777" fillOpacity="0.75" />
    {/* Gold accent dots */}
    <circle cx="160" cy="75" r="3.5" fill="#CA8A04" fillOpacity="0.7" />
    <circle cx="118" cy="72" r="2.5" fill="#CA8A04" fillOpacity="0.6" />
    <circle cx="165" cy="125" r="2" fill="#CA8A04" fillOpacity="0.5" />
  </svg>
)

const FlowerRight = () => (
  <svg
    viewBox="0 0 280 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    style={{ transform: 'scaleX(-1)' }}
  >
    {/* Stem */}
    <path d="M140 300 Q130 240 120 200 Q110 160 125 130" stroke="#829460" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    {/* Leaf left */}
    <path d="M125 200 Q80 185 70 155 Q100 165 120 185" fill="#829460" fillOpacity="0.7" />
    {/* Leaf right */}
    <path d="M120 230 Q155 210 165 180 Q140 195 125 215" fill="#829460" fillOpacity="0.6" />
    {/* Rose petals outer */}
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#F472B6" fillOpacity="0.7" transform="rotate(-20 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#EC4899" fillOpacity="0.55" transform="rotate(20 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#F9A8D4" fillOpacity="0.7" transform="rotate(-60 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#DB2777" fillOpacity="0.45" transform="rotate(65 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#F472B6" fillOpacity="0.55" transform="rotate(110 140 100)" />
    <ellipse cx="140" cy="100" rx="28" ry="48" fill="#EC4899" fillOpacity="0.45" transform="rotate(-110 140 100)" />
    {/* Rose center */}
    <circle cx="140" cy="100" r="22" fill="#DB2777" fillOpacity="0.85" />
    <circle cx="140" cy="100" r="14" fill="#831843" fillOpacity="0.7" />
    <circle cx="134" cy="94" r="6" fill="#F9A8D4" fillOpacity="0.5" />
    {/* Smaller bud */}
    <ellipse cx="85" cy="145" rx="12" ry="20" fill="#F472B6" fillOpacity="0.6" transform="rotate(-30 85 145)" />
    <ellipse cx="85" cy="145" rx="12" ry="20" fill="#EC4899" fillOpacity="0.5" transform="rotate(30 85 145)" />
    <circle cx="85" cy="145" r="9" fill="#DB2777" fillOpacity="0.75" />
    {/* Gold accent dots */}
    <circle cx="160" cy="75" r="3.5" fill="#CA8A04" fillOpacity="0.7" />
    <circle cx="118" cy="72" r="2.5" fill="#CA8A04" fillOpacity="0.6" />
    <circle cx="165" cy="125" r="2" fill="#CA8A04" fillOpacity="0.5" />
  </svg>
)

export const Hero = ({ groomName, brideName, weddingDate }: HeroProps) => {
  const formattedDate = weddingDate ? new Date(weddingDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : ''

  const containerRef = useRef<HTMLDivElement>(null)
  const flowerLeftRef = useRef<HTMLDivElement>(null)
  const flowerRightRef = useRef<HTMLDivElement>(null)
  const flowerLeft2Ref = useRef<HTMLDivElement>(null)
  const flowerRight2Ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Entrance animation: flowers rise from bottom
    gsap.fromTo(
      [flowerLeftRef.current, flowerRightRef.current],
      { y: 80, opacity: 0, scale: 0.85 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.6,
        delay: 0.6,
        ease: 'power3.out',
        stagger: 0.15,
      }
    )
    gsap.fromTo(
      [flowerLeft2Ref.current, flowerRight2Ref.current],
      { y: 60, opacity: 0, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.4,
        delay: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
      }
    )

    // Continuous gentle floating sway — left flowers
    gsap.to(flowerLeftRef.current, {
      y: '-=10',
      x: '+=6',
      rotation: '-=3',
      duration: 5.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5,
    })
    gsap.to(flowerLeft2Ref.current, {
      y: '+=8',
      x: '-=4',
      rotation: '+=2',
      duration: 6.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2,
    })

    // Continuous gentle floating sway — right flowers
    gsap.to(flowerRightRef.current, {
      y: '-=12',
      x: '-=5',
      rotation: '+=3',
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.8,
    })
    gsap.to(flowerRight2Ref.current, {
      y: '+=9',
      x: '+=4',
      rotation: '-=2',
      duration: 5.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2.2,
    })
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="min-h-[100svh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-10 md:py-12 relative overflow-hidden bg-gradient-to-b from-white to-blush/30"
    >
      {/* ─── GSAP Floral Decorations — Bottom Left & Right ─── */}
      {/* Bottom Left — main flower */}
      <div
        ref={flowerLeftRef}
        className="absolute bottom-0 left-0 w-28 h-36 sm:w-36 sm:h-44 md:w-48 md:h-60 lg:w-56 lg:h-72 pointer-events-none select-none z-10"
        style={{ transformOrigin: 'bottom left', opacity: 0 }}
      >
        <FlowerLeft />
      </div>
      {/* Bottom Left — secondary smaller flower, offset */}
      <div
        ref={flowerLeft2Ref}
        className="absolute bottom-0 left-20 sm:left-24 md:left-32 lg:left-36 w-16 h-20 sm:w-20 sm:h-28 md:w-28 md:h-36 pointer-events-none select-none z-[9]"
        style={{ transformOrigin: 'bottom center', opacity: 0 }}
      >
        <FlowerLeft />
      </div>

      {/* Bottom Right — main flower */}
      <div
        ref={flowerRightRef}
        className="absolute bottom-0 right-0 w-28 h-36 sm:w-36 sm:h-44 md:w-48 md:h-60 lg:w-56 lg:h-72 pointer-events-none select-none z-10"
        style={{ transformOrigin: 'bottom right', opacity: 0 }}
      >
        <FlowerRight />
      </div>
      {/* Bottom Right — secondary smaller flower, offset */}
      <div
        ref={flowerRight2Ref}
        className="absolute bottom-0 right-20 sm:right-24 md:right-32 lg:right-36 w-16 h-20 sm:w-20 sm:h-28 md:w-28 md:h-36 pointer-events-none select-none z-[9]"
        style={{ transformOrigin: 'bottom center', opacity: 0 }}
      >
        <FlowerRight />
      </div>

      {/* ─── Main Content ─── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-4xl w-full flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-10 lg:gap-12 relative z-20"
      >
        {/* Wedding Of label + Names */}
        <div className="flex-none">
          <span className="text-primary font-bold tracking-[0.3em] text-[9px] sm:text-[10px] md:text-xs uppercase mb-2 block">
            The Wedding of
          </span>
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-script text-burgundy italic leading-tight"
            >
              {groomName}{' '}
              <span className="inline-block mx-1.5 sm:mx-2 text-xl sm:text-2xl md:text-4xl lg:text-5xl text-gold font-serif not-italic font-light">
                &
              </span>{' '}
              {brideName}
            </motion.h1>
          </div>
        </div>

        {/* Photos */}
        <div className="relative flex items-center justify-center my-0 sm:my-2 md:my-4">
          <div className="flex justify-center items-center -space-x-10 sm:-space-x-12 md:-space-x-20 relative scale-[0.78] sm:scale-90 md:scale-100 transition-transform duration-500">
            <motion.div
              initial={{ opacity: 0, x: -40, rotate: -8 }}
              whileInView={{ opacity: 1, x: 0, rotate: -4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="relative z-10"
            >
              <div className="w-32 h-48 sm:w-40 sm:h-56 md:w-[22rem] md:h-[30rem] overflow-visible">
                <div className="absolute inset-0 border-4 border-gold/40 rounded-3xl -m-2 -z-10" />
                <img
                  src="/cowo.png"
                  alt="Groom"
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(131,24,67,0.15)] rounded-3xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 8 }}
              whileInView={{ opacity: 1, x: 0, rotate: 4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="relative z-20 -mt-5 sm:-mt-8 md:-mt-20"
            >
              <div className="w-32 h-48 sm:w-40 sm:h-56 md:w-[22rem] md:h-[30rem] overflow-visible">
                <div className="absolute inset-0 border-4 border-gold/40 rounded-3xl -m-2 -z-10" />
                <img
                  src="/cewe.png"
                  alt="Bride"
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(131,24,67,0.15)] rounded-3xl"
                />
              </div>
            </motion.div>

            {/* Blush glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 md:w-[40rem] md:h-[40rem] bg-primary/[0.04] rounded-full blur-[60px] -z-10" />
          </div>
        </div>

        {/* Date & Location */}
        <div className="flex-none pt-1 sm:pt-2 md:pt-4">
          <div className="w-12 sm:w-16 h-0.5 bg-primary/20 mx-auto mb-2.5 sm:mb-3 md:mb-5" />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <p className="text-base sm:text-xl md:text-3xl font-serif text-burgundy mb-1.5 italic font-medium">
              {formattedDate}
            </p>
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-4 text-gray-500 uppercase tracking-[0.2em] text-[8px] sm:text-[9px] md:text-xs font-semibold">
              <span>Jakarta</span>
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gold rounded-full" />
              <span>Indonesia</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
