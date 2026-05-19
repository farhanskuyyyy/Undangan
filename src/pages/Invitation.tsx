import { useEffect, useState } from 'react'
import { Hero } from '../components/Hero'
import { Countdown } from '../components/Countdown'
import { LoveStory } from '../components/LoveStory'
import Gallery from '../components/Gallery'
import GuestQR from '../components/GuestQR'
import { RSVPForm } from '../components/RSVPForm'
import { MusicPlayer } from '../components/MusicPlayer'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'

interface WeddingSettings {
  groom_name: string
  bride_name: string
  wedding_date: string
  location_name: string
  location_address: string
  maps_url: string
}

interface LoveStoryData {
  event_date: string
  title: string
  description: string
  image_url: string
}

interface GalleryData {
  image_url: string
  aspect_ratio: string
}

export const Invitation = () => {
  const [searchParams] = useSearchParams()
  const guestId = searchParams.get('to') || undefined
  
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [loveStories, setLoveStories] = useState<LoveStoryData[]>([])
  const [galleries, setGalleries] = useState<GalleryData[]>([])
  const [guestName, setGuestName] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch wedding settings
        const { data: settingsData } = await supabase
          .from('wedding_settings')
          .select('*')
          .single()
        
        if (settingsData) setSettings(settingsData)

        // Fetch love stories
        const { data: storiesData } = await supabase
          .from('love_stories')
          .select('*')
          .order('order_index', { ascending: true })
        
        if (storiesData) setLoveStories(storiesData)

        // Fetch galleries
        const { data: galleryData } = await supabase
          .from('galleries')
          .select('*')
          .order('order_index', { ascending: true })
        
        if (galleryData) setGalleries(galleryData)

        // Fetch guest name if guestId exists
        if (guestId) {
          const { data: guestData } = await supabase
            .from('guests')
            .select('name')
            .eq('qr_code', guestId)
            .single()
          
          if (guestData) setGuestName(guestData.name)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [guestId])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'auto'
    } else {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-pulse text-2xl font-serif italic text-sage">Loading Invitation...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#fdfcfb] min-h-screen font-sans text-gray-900 selection:bg-sage/20 relative overflow-x-hidden">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream px-6 text-center"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-full border-[20px] border-sage m-4 rounded-3xl" />
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sage font-light tracking-[0.3em] uppercase mb-8"
            >
              Wedding Invitation
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-5xl md:text-7xl font-serif italic text-sage mb-12 leading-tight"
            >
              {settings?.groom_name || 'Groom'} & {settings?.bride_name || 'Bride'}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <p className="text-gray-500 italic mb-2 font-light">Kepada Yth. Bapak/Ibu/Saudara/i</p>
              <h2 className="text-2xl md:text-3xl font-serif text-sage">{guestName || 'Tamu Undangan'}</h2>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-3 bg-sage text-cream px-8 py-4 rounded-full font-light tracking-[0.2em] uppercase hover:bg-sage/90 transition-all shadow-lg active:scale-95"
            >
              <Mail className="group-hover:animate-bounce" size={20} />
              Buka Undangan
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 blur-sm'}`}>
        <Hero 
          groomName={settings?.groom_name || 'Groom'} 
          brideName={settings?.bride_name || 'Bride'} 
          weddingDate={settings?.wedding_date || ''}
          guestName={guestName}
        />
        
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-24 px-6"
        >
          <Countdown targetDate={settings?.wedding_date || '2026-05-19T10:00:00'} />
        </motion.section>

        <LoveStory stories={loveStories} />

        <Gallery images={galleries} />

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="py-24 px-6 text-center bg-cream/20 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-terracotta/30" />
          <h2 className="text-4xl font-serif italic text-sage mb-8">Location</h2>
          <div className="max-w-xl mx-auto mb-12">
            <p className="text-xl text-sage font-medium mb-2">{settings?.location_name || 'Wedding Venue'}</p>
            <p className="text-gray-600 font-light leading-relaxed">
              {settings?.location_address || ''}
            </p>
          </div>
          {settings?.maps_url && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-video w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-8 border-white"
            >
              <iframe
                src={settings.maps_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          )}
        </motion.section>

        <GuestQR guestId={guestId} />

        <RSVPForm guestId={guestId} guestName={guestName} />

        <footer className="py-24 text-center px-6">
          <div className="w-16 h-px bg-terracotta/30 mx-auto mb-8" />
          <p className="text-sage font-serif italic text-xl mb-4">
            {settings?.groom_name} & {settings?.bride_name}
          </p>
          <p className="text-gray-400 text-xs font-light tracking-[0.3em] uppercase">
            &copy; {new Date().getFullYear()} • All rights reserved.
          </p>
        </footer>
      </div>
      <MusicPlayer autoPlay={isOpen} />
    </div>
  )
}
