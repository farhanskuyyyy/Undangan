import { motion } from 'framer-motion'

interface HeroProps {
  groomName: string
  brideName: string
  weddingDate: string
}

export const Hero = ({ groomName, brideName, weddingDate }: HeroProps) => {
  const formattedDate = weddingDate ? new Date(weddingDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-12 md:pt-32 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-4xl w-full"
      >
        <p className="text-sage tracking-[0.4em] uppercase mb-10 md:mb-16 text-xs md:text-sm font-light">The Wedding of</p>
        
        <div className="relative mb-12 md:mb-20">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-6xl md:text-9xl font-serif text-sage italic leading-tight"
          >
            {groomName} <span className="block text-3xl md:text-6xl my-4 text-terracotta/60 font-sans not-italic">&</span> {brideName}
          </motion.h1>
        </div>

        <div className="flex justify-center items-center -space-x-12 md:-space-x-20 mb-20 md:mb-32 relative">
          <motion.div
            initial={{ opacity: 0, x: -40, rotate: -8 }}
            whileInView={{ opacity: 1, x: 0, rotate: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative z-10"
          >
            <div className="w-48 h-72 md:w-[22rem] md:h-[30rem] overflow-visible">
              <img src="/cowo.png" alt="Groom" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 8 }}
            whileInView={{ opacity: 1, x: 0, rotate: 4 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="relative z-20 -mt-12 md:-mt-24"
          >
            <div className="w-48 h-72 md:w-[22rem] md:h-[30rem] overflow-visible">
              <img src="/cewe.png" alt="Bride" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]" />
            </div>
          </motion.div>
          
          {/* Subtle decorative circle behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[40rem] md:h-[40rem] bg-terracotta/[0.03] rounded-full blur-[100px] -z-10" />
        </div>

        <div className="w-32 h-px bg-terracotta/20 mx-auto mb-12"></div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-xl md:text-2xl font-serif text-sage mb-2 italic">{formattedDate}</p>
          <div className="flex items-center justify-center gap-4 text-gray-500 uppercase tracking-[0.2em] text-xs font-light">
            <span>Jakarta</span>
            <span className="w-1 h-1 bg-terracotta rounded-full"></span>
            <span>Indonesia</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
