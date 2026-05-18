import { Hero } from './components/Hero'
import { Countdown } from './components/Countdown'
import { RSVPForm } from './components/RSVPForm'
import { useSearchParams } from 'react-router-dom'

export const Invitation = () => {
  const [searchParams] = useSearchParams()
  const guestId = searchParams.get('to') || undefined

  return (
    <div className="bg-[#fdfcfb] min-h-screen font-sans text-gray-900 selection:bg-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <Hero />
        
        <section className="mb-20">
          <Countdown targetDate="2026-05-18T10:00:00" />
        </section>

        <section className="py-20 border-y border-gray-100 text-center">
          <h2 className="text-3xl font-serif italic mb-6">Location</h2>
          <p className="text-gray-600 mb-8 font-light tracking-wide">
            The Glass House, Jakarta<br/>
            10:00 AM - 01:00 PM
          </p>
          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
             {/* Google Maps Embed Placeholder */}
             <div className="w-full h-full flex items-center justify-center text-gray-400 font-light">
               Google Maps Embed
             </div>
          </div>
        </section>

        <RSVPForm guestId={guestId} />

        <footer className="py-20 text-center text-gray-400 text-sm font-light tracking-widest uppercase">
          &copy; 2026 John & Jane. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
