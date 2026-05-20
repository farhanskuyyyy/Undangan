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
    <div className="h-screen max-h-screen flex flex-col items-center justify-between text-center px-6 pt-6 md:pt-10 pb-8 md:pb-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-4xl w-full h-full flex flex-col justify-between"
      >
        <div className="flex-none">
          <p className="text-sage tracking-[0.4em] uppercase mb-2 md:mb-6 text-[10px] md:text-xs font-light">The Wedding of</p>
          
          <div className="relative mb-2 md:mb-10">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="text-4xl md:text-8xl font-serif text-sage italic leading-tight"
            >
              {groomName} <span className="inline-block mx-2 text-xl md:text-5xl text-terracotta/60 font-sans not-italic">&</span> {brideName}
            </motion.h1>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center relative min-h-0">
          <div className="flex justify-center items-center -space-x-10 md:-space-x-20 relative scale-[0.8] md:scale-100 transition-transform duration-500">
            <motion.div
              initial={{ opacity: 0, x: -40, rotate: -8 }}
              whileInView={{ opacity: 1, x: 0, rotate: -4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="relative z-10"
            >
              <div className="w-40 h-60 md:w-[22rem] md:h-[30rem] overflow-visible">
                <img src="/cowo.png" alt="Groom" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 8 }}
              whileInView={{ opacity: 1, x: 0, rotate: 4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="relative z-20 -mt-8 md:-mt-20"
            >
              <div className="w-40 h-60 md:w-[22rem] md:h-[30rem] overflow-visible">
                <img src="/cewe.png" alt="Bride" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]" />
              </div>
            </motion.div>
            
            {/* Subtle decorative circle behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-[40rem] md:h-[40rem] bg-terracotta/[0.03] rounded-full blur-[80px] -z-10" />
          </div>
        </div>

        <div className="flex-none pt-2 md:pt-10">
          <div className="w-16 h-px bg-terracotta/20 mx-auto mb-4 md:mb-6"></div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <p className="text-base md:text-2xl font-serif text-sage mb-1 md:mb-2 italic">{formattedDate}</p>
            <div className="flex items-center justify-center gap-3 md:gap-4 text-gray-500 uppercase tracking-[0.2em] text-[9px] md:text-xs font-light">
              <span>Jakarta</span>
              <span className="w-1 h-1 bg-terracotta rounded-full"></span>
              <span>Indonesia</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
