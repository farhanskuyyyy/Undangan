import { Hero } from '../components/Hero'
import { Countdown } from '../components/Countdown'
import { LoveStory } from '../components/LoveStory'
import Gallery from '../components/Gallery'
import GuestQR from '../components/GuestQR'
import { RSVPForm } from '../components/RSVPForm'
import { MusicPlayer } from '../components/MusicPlayer'
import { useSearchParams } from 'react-router-dom'

export const Invitation = () => {
  const [searchParams] = useSearchParams()
  const guestId = searchParams.get('to') || undefined

  return (
    <div className="bg-[#fdfcfb] min-h-screen font-sans text-gray-900 selection:bg-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <Hero />
        
        <section className="mb-20">
          <Countdown targetDate="2026-05-19T10:00:00" />
        </section>

        <LoveStory />

        <Gallery />

        <section className="py-20 border-y border-gray-100 text-center">
          <h2 className="text-3xl font-serif italic mb-6">Location</h2>
          <p className="text-gray-600 mb-8 font-light tracking-wide">
            National Monument (Monas), Jakarta<br/>
            10:00 AM - 01:00 PM
          </p>
          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.666427145322!2d106.82457877586522!3d-6.175392393811883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad23d044066c!2sNational%20Monument!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        <GuestQR guestId={guestId} />

        <RSVPForm guestId={guestId} />

        <footer className="py-20 text-center text-gray-400 text-sm font-light tracking-widest uppercase">
          &copy; 2026 John & Jane. All rights reserved.
        </footer>
      </div>
      <MusicPlayer />
    </div>
  )
}
