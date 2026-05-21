import { motion } from 'framer-motion'

interface RundownItem {
  time_start: string
  time_end: string
  title: string
  description: string
}

interface RundownProps {
  items: RundownItem[]
}

export const Rundown = ({ items }: RundownProps) => {
  if (!items || items.length === 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="relative"
    >
      <div className="max-w-4xl mx-auto bg-white/20 backdrop-blur-lg rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-16 border border-white/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sage/20 to-transparent" />
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-sage-dark mb-8 sm:mb-10 md:mb-16 text-center">
          Event Rundown
        </h2>
        
        {/* Mobile: vertical card list | Desktop: alternating timeline */}
        <div className="relative">
          {/* Vertical timeline line — desktop only */}
          <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-terracotta/20 md:left-1/2 md:-translate-x-1/2" />
          
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative flex items-start gap-4 md:gap-0 md:flex-row md:items-center ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Mobile Timeline Dot */}
                <div className="flex-none mt-1.5 md:hidden">
                  <div className="w-3 h-3 bg-terracotta rounded-full border-4 border-white/80 relative z-10" />
                </div>

                {/* Desktop Timeline Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-terracotta rounded-full border-4 border-white hidden md:block z-10" />
                
                {/* Content */}
                <div className={`flex-1 md:w-1/2 ${
                  index % 2 === 0
                    ? 'md:pl-12 md:text-left'
                    : 'md:pr-12 md:text-right'
                }`}>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/10 text-sage text-xs sm:text-sm font-medium mb-2 sm:mb-3`}>
                    {item.time_start} – {item.time_end}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif text-sage-dark mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
                
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
