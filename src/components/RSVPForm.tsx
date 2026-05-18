import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface RSVPData {
  name: string
  rsvp_status: boolean
  attendance_count: number
  message: string
}

interface GuestMessage {
  id: string
  name: string
  message: string
  created_at: string
}

export const RSVPForm = ({ guestId, guestName }: { guestId?: string; guestName?: string }) => {
  const { register, handleSubmit, reset, setValue } = useForm<RSVPData>()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [messages, setMessages] = useState<GuestMessage[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (guestName) {
      setValue('name', guestName)
    }
  }, [guestName, setValue])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('id, name, message, created_at')
      .eq('rsvp_status', true)
      .not('message', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
    } else if (data) {
      setMessages(data)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const onSubmit = async (data: RSVPData) => {
    setLoading(true)
    try {
      if (guestId) {
        // Update existing guest record if guestId provided (e.g. from URL)
        const { error } = await supabase
          .from('guests')
          .update({
            rsvp_status: data.rsvp_status === true || (data.rsvp_status as any) === 'true',
            attendance_count: Number(data.attendance_count),
            message: data.message
          })
          .eq('qr_code', guestId)
        
        if (error) throw error
      } else {
        // Fallback or generic RSVP entry
        const { error } = await supabase
          .from('guests')
          .insert([{ 
            ...data, 
            rsvp_status: data.rsvp_status === true || (data.rsvp_status as any) === 'true',
            attendance_count: Number(data.attendance_count),
            qr_code: `manual-${Date.now()}` 
          }])
        
        if (error) throw error
      }
      setSubmitted(true)
      reset()
      fetchMessages() // Refresh messages after submission
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      alert('Gagal mengirim RSVP. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 max-w-6xl mx-auto px-6">
      <h2 className="text-4xl font-serif text-center mb-16 italic text-sage">RSVP & Wishes</h2>
      
      <div className={`grid grid-cols-1 ${submitted ? 'md:grid-cols-1 max-w-2xl mx-auto' : 'md:grid-cols-2'} gap-12 items-start`}>
        {/* Left Column: Scrolling Messages */}
        <div className="order-2 md:order-1">
          <h3 className="text-xl font-serif mb-6 text-sage/80 italic">Doa Restu</h3>
          <div 
            ref={containerRef}
            className="h-[400px] overflow-hidden relative bg-cream/30 rounded-lg border border-terracotta/10 p-4"
          >
            {messages.length > 0 ? (
              <motion.div
                animate={{
                  y: [0, '-50%'],
                }}
                transition={{
                  duration: messages.length * 5, // Dynamic duration based on count
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="space-y-4"
              >
                {/* Double the messages for seamless loop */}
                {[...messages, ...messages].map((msg, index) => (
                  <div 
                    key={`${msg.id}-${index}`} 
                    className="bg-cream p-4 rounded-md border-l-4 border-terracotta shadow-sm"
                  >
                    <p className="text-sage font-serif italic mb-1">"{msg.message}"</p>
                    <div className="flex justify-between items-end">
                      <p className="text-terracotta text-sm font-light uppercase tracking-wider">— {msg.name}</p>
                      <p className="text-[10px] text-sage/40 font-sans">{formatDate(msg.created_at)}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center text-sage/60 py-20 font-serif">
                Belum ada pesan.
              </div>
            )}
            
            {/* Gradient Overlays for smooth fade */}
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-cream/80 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-cream/80 to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Right Column: RSVP Form or Success Message */}
        <div className="order-1 md:order-2">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white p-8 rounded-lg shadow-sm border border-terracotta/10"
            >
              <h3 className="text-2xl font-serif text-sage mb-4 italic">Terima Kasih!</h3>
              <p className="text-sage/70 font-light leading-relaxed">
                Konfirmasi kehadiran dan doa restu Anda telah kami terima.<br/>
                Sampai jumpa di hari bahagia kami!
              </p>
            </motion.div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-terracotta/10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-light uppercase tracking-widest text-sage mb-2">Nama</label>
                  <input
                    {...register('name', { required: true })}
                    disabled={!!guestName}
                    className={`w-full border-b border-gray-200 py-2 focus:border-terracotta outline-none transition-colors bg-transparent font-serif text-lg text-sage ${guestName ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="Masukkan Nama Anda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light uppercase tracking-widest text-sage mb-2">Konfirmasi Kehadiran</label>
                  <select
                    {...register('rsvp_status', { required: true })}
                    className="w-full border-b border-gray-200 py-2 focus:border-terracotta outline-none bg-transparent font-serif text-lg text-sage"
                  >
                    <option value="true">Akan Hadir</option>
                    <option value="false">Tidak Bisa Hadir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-light uppercase tracking-widest text-sage mb-2">Jumlah Tamu</label>
                  <input
                    type="number"
                    {...register('attendance_count', { min: 1, max: 5 })}
                    defaultValue={1}
                    className="w-full border-b border-gray-200 py-2 focus:border-terracotta outline-none bg-transparent font-serif text-lg text-sage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light uppercase tracking-widest text-sage mb-2">Pesan & Doa Restu</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="w-full border border-gray-100 p-3 focus:border-terracotta outline-none rounded-sm transition-colors bg-cream/20 font-serif text-sage"
                    placeholder="Tulis ucapan selamat Anda..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sage text-cream py-4 font-light tracking-[0.2em] uppercase hover:bg-sage/90 transition-colors disabled:bg-gray-300 shadow-md"
                >
                  {loading ? 'Mengirim...' : 'Kirim RSVP'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
