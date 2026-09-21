import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Heart, Calendar, Image, Gift, MessageSquare } from 'lucide-react'

interface BottomNavProps {
  visible: boolean
}

export const BottomNav: React.FC<BottomNavProps> = ({ visible }) => {
  const [activeSection, setActiveSection] = useState<string>('hero')

  const navItems = [
    { id: 'hero', label: 'Cover', icon: Home },
    { id: 'story', label: 'Story', icon: Heart },
    { id: 'event', label: 'Acara', icon: Calendar },
    { id: 'gallery', label: 'Galeri', icon: Image },
    { id: 'gift', label: 'Kado', icon: Gift },
    { id: 'rsvp', label: 'RSVP', icon: MessageSquare },
  ]

  useEffect(() => {
    if (!visible) return

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35

      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i]
        const el = document.getElementById(item.id)
        if (el) {
          const top = el.offsetTop
          if (scrollPos >= top) {
            setActiveSection(item.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visible])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed bottom-4 inset-x-0 z-[85] flex justify-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Navigasi Halaman"
      >
        <div className="pointer-events-auto bg-white/85 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-1 sm:gap-2 max-w-fit">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2.5 py-1 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-burgundy'
                }`}
                aria-label={`Menuju bagian ${item.label}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-gradient-to-r from-burgundy to-primary rounded-full shadow-md -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-medium tracking-tight mt-0.5 leading-none">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.nav>
    </AnimatePresence>
  )
}

export default BottomNav
