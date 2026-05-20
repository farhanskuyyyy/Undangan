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
      <div className="max-w-4xl mx-auto bg-white/20 backdrop-blur-lg rounded-[3rem] p-8 md:p-16 border border-white/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sage/20 to-transparent" />
        
        <h2 className="text-5xl font-serif italic text-sage-dark mb-16 text-center">Event Rundown</h2>
        
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-px bg-terracotta/20 hidden md:block" />
          
          <div className="space-y-12">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-3 h-3 bg-terracotta rounded-full border-4 border-white hidden md:block" />
                
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} text-left md:text-right ${index % 2 === 0 ? 'md:text-left' : ''}`}>
                  <div className="inline-block px-4 py-1 rounded-full bg-sage/10 text-sage text-sm font-medium mb-4">
                    {item.time_start} - {item.time_end}
                  </div>
                  <h3 className="text-2xl font-serif text-sage-dark mb-2">{item.title}</h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
