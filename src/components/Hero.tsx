import { motion } from 'framer-motion'

interface HeroProps {
  groomName: string
  brideName: string
  weddingDate: string
  guestName?: string
}

export const Hero = ({ groomName, brideName, weddingDate, guestName }: HeroProps) => {
  const formattedDate = weddingDate ? new Date(weddingDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : ''

  return (
    <section className="py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {guestName && (
          <div className="mb-12">
            <p className="text-gray-500 font-light italic mb-2">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <h2 className="text-2xl font-serif text-gray-800">{guestName}</h2>
          </div>
        )}
        <p className="text-sm tracking-widest uppercase mb-4 text-gray-500">The Wedding of</p>
        <h1 className="text-6xl md:text-8xl font-serif mb-6 text-gray-900 italic">{groomName} & {brideName}</h1>
        <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
        <p className="text-xl font-light tracking-wide text-gray-600">{formattedDate}</p>
      </motion.div>
    </section>
  )
}
