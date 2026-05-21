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
    <div className="min-h-screen md:h-screen md:max-h-screen flex flex-col items-center justify-center text-center px-6 py-10 md:py-12 relative overflow-hidden bg-gradient-to-b from-white to-blush/30">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-4xl w-full flex flex-col justify-center items-center gap-6 md:gap-12"
      >
        <div className="flex-none">
          <span className="text-primary font-bold tracking-[0.3em] text-[10px] md:text-xs uppercase mb-2 block">The Wedding of</span>
          
          <div className="relative">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="text-5xl md:text-8xl font-script text-burgundy italic leading-tight"
            >
              {groomName} <span className="inline-block mx-2 text-2xl md:text-5xl text-gold font-serif not-italic font-light">&</span> {brideName}
            </motion.h1>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-2 md:my-4">
          <div className="flex justify-center items-center -space-x-12 md:-space-x-20 relative scale-[0.85] md:scale-100 transition-transform duration-500">
            <motion.div
              initial={{ opacity: 0, x: -40, rotate: -8 }}
              whileInView={{ opacity: 1, x: 0, rotate: -4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="relative z-10"
            >
              <div className="w-36 h-52 md:w-[22rem] md:h-[30rem] overflow-visible">
                {/* Embedded luxury flower border gold frame around image */}
                <div className="absolute inset-0 border-4 border-gold/40 rounded-3xl -m-2 -z-10" />
                <img src="/cowo.png" alt="Groom" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(131,24,67,0.15)] rounded-3xl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 8 }}
              whileInView={{ opacity: 1, x: 0, rotate: 4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="relative z-20 -mt-6 md:-mt-20"
            >
              <div className="w-36 h-52 md:w-[22rem] md:h-[30rem] overflow-visible">
                {/* Embedded luxury flower border gold frame around image */}
                <div className="absolute inset-0 border-4 border-gold/40 rounded-3xl -m-2 -z-10" />
                <img src="/cewe.png" alt="Bride" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(131,24,67,0.15)] rounded-3xl" />
              </div>
            </motion.div>
            
            {/* Decorative blush background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-[40rem] md:h-[40rem] bg-primary/[0.04] rounded-full blur-[60px] -z-10" />
          </div>
        </div>

        <div className="flex-none pt-2 md:pt-4">
          <div className="w-16 h-0.5 bg-primary/20 mx-auto mb-3 md:mb-5"></div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <p className="text-xl md:text-3xl font-serif text-burgundy mb-1.5 italic font-medium">{formattedDate}</p>
            <div className="flex items-center justify-center gap-3 md:gap-4 text-gray-500 uppercase tracking-[0.2em] text-[9px] md:text-xs font-semibold">
              <span>Jakarta</span>
              <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
              <span>Indonesia</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
