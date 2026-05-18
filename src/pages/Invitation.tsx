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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <div className="animate-pulse text-2xl font-serif italic text-gray-400">Loading Invitation...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#fdfcfb] min-h-screen font-sans text-gray-900 selection:bg-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <Hero 
          groomName={settings?.groom_name || 'Groom'} 
          brideName={settings?.bride_name || 'Bride'} 
          weddingDate={settings?.wedding_date || ''}
          guestName={guestName}
        />
        
        <section className="mb-20">
          <Countdown targetDate={settings?.wedding_date || '2026-05-19T10:00:00'} />
        </section>

        <LoveStory stories={loveStories} />

        <Gallery images={galleries} />

        <section className="py-20 border-y border-gray-100 text-center">
          <h2 className="text-3xl font-serif italic mb-6">Location</h2>
          <p className="text-gray-600 mb-8 font-light tracking-wide">
            {settings?.location_name || 'Wedding Venue'}<br/>
            {settings?.location_address || ''}
          </p>
          {settings?.maps_url && (
            <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={settings.maps_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          )}
        </section>

        <GuestQR guestId={guestId} />

        <RSVPForm guestId={guestId} />

        <footer className="py-20 text-center text-gray-400 text-sm font-light tracking-widest uppercase">
          &copy; {new Date().getFullYear()} {settings?.groom_name} & {settings?.bride_name}. All rights reserved.
        </footer>
      </div>
      <MusicPlayer />
    </div>
  )
}
