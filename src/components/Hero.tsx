import { motion } from 'framer-motion'

export const Hero = () => {
  return (
    <section className="py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-sm tracking-widest uppercase mb-4 text-gray-500">The Wedding of</p>
        <h1 className="text-6xl md:text-8xl font-serif mb-6 text-gray-900 italic">John & Jane</h1>
        <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
        <p className="text-xl font-light tracking-wide text-gray-600">Saturday, 18 May 2026</p>
      </motion.div>
    </section>
  )
}
