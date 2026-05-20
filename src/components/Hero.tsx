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
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <p className="text-sage tracking-[0.4em] uppercase mb-8 text-sm font-light">The Wedding of</p>
        
        <div className="relative mb-8 md:mb-12">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-7xl md:text-9xl font-serif text-sage italic leading-tight"
          >
            {groomName} <span className="block text-4xl md:text-6xl my-4 text-terracotta/60 font-sans not-italic">&</span> {brideName}
          </motion.h1>
        </div>

        <div className="flex justify-center items-center -space-x-8 md:-space-x-12 mb-16 relative">
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -5 }}
            whileInView={{ opacity: 1, x: 0, rotate: -2 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative z-10"
          >
            <div className="w-40 h-56 md:w-64 md:h-80 rounded-t-full shadow-2xl overflow-hidden">
              <img src="/cowo.png" alt="Groom" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 2 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="relative z-20 -mt-8 md:-mt-12"
          >
            <div className="w-40 h-56 md:w-64 md:h-80 rounded-t-full shadow-2xl overflow-hidden border-4 border-white/50 backdrop-blur-sm">
              <img src="/cewe.png" alt="Bride" className="w-full h-full object-cover" />
            </div>
          </motion.div>
          
          {/* Subtle decorative circle behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-terracotta/5 rounded-full blur-3xl -z-10" />
        </div>

        <div className="w-24 h-px bg-terracotta/30 mx-auto mb-12"></div>
        
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
