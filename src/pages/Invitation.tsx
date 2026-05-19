import { useEffect, useState } from 'react'
import { AddToCalendarButton } from 'add-to-calendar-button-react'
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
import { Envelope } from '../components/Envelope'
import { ParallaxDecor } from '../components/ParallaxDecor'

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

  const weddingDateStr = settings?.wedding_date ? settings.wedding_date.split('T')[0] : ''

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
      <ParallaxDecor />

      <AnimatePresence>
        {!isOpen && (
          <Envelope 
            groomName={settings?.groom_name || 'Groom'}
            brideName={settings?.bride_name || 'Bride'}
            guestName={guestName}
            onOpen={() => setIsOpen(true)}
          />
        )}
      </AnimatePresence>

      <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 blur-sm'}`}>
        <Hero 
          groomName={settings?.groom_name || 'Groom'} 
          brideName={settings?.bride_name || 'Bride'} 
          weddingDate={settings?.wedding_date || ''}
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

        {/* Section Divider */}
        <div className="flex justify-center py-12">
          <svg className="w-24 h-8 text-sage/30" viewBox="0 0 100 20" fill="none" stroke="currentColor">
            <path d="M0,10 Q25,0 50,10 Q75,20 100,10" strokeWidth="0.5" />
            <circle cx="50" cy="10" r="2" fill="currentColor" />
          </svg>
        </div>

        <Gallery images={galleries} />

        {/* Section Divider */}
        <div className="flex justify-center py-12">
          <svg className="w-24 h-8 text-sage/30" viewBox="0 0 100 20" fill="none" stroke="currentColor">
            <path d="M0,10 Q25,20 50,10 Q75,0 100,10" strokeWidth="0.5" />
            <circle cx="50" cy="10" r="2" fill="currentColor" />
          </svg>
        </div>

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="py-24 px-6 text-center bg-transparent relative"
        >
          <h2 className="text-5xl font-serif italic text-sage-dark mb-12">Wedding Location</h2>
          <div className="max-w-xl mx-auto mb-12">
            <p className="text-xl text-sage font-medium mb-2">{settings?.location_name || 'Wedding Venue'}</p>
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              {settings?.location_address || ''}
            </p>
            {settings && (
              <div className="flex justify-center mb-8">
                <AddToCalendarButton
                  name={`The Wedding of ${settings.groom_name} & ${settings.bride_name}`}
                  options={['Apple', 'Google', 'Outlook.com']}
                  location={settings.location_name}
                  startDate={weddingDateStr}
                  endDate={weddingDateStr}
                  startTime="10:00"
                  endTime="13:00"
                  timeZone="Asia/Jakarta"
                  buttonStyle="default"
                  lightMode="light"
                />
              </div>
            )}
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
