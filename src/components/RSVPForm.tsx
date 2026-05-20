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
    <div className="relative">
      <h2 className="text-4xl font-serif text-center mb-16 italic text-sage">RSVP & Wishes</h2>
      
      <div className={`grid grid-cols-1 ${submitted ? 'md:grid-cols-1 max-w-2xl mx-auto' : 'md:grid-cols-2'} gap-12 items-start`}>
        {/* Left Column: Scrolling Messages */}
        <div className="order-2 md:order-1">
          <h3 className="text-xl font-serif mb-8 text-sage/80 italic text-center md:text-left">Doa Restu dari Tamu</h3>
          <div 
            ref={containerRef}
            className="h-[500px] overflow-hidden relative bg-transparent px-2"
          >
            {messages.length > 0 ? (
              <motion.div
                animate={{
                  y: [0, '-50%'],
                }}
                transition={{
                  duration: Math.max(messages.length * 8, 20),
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="space-y-6"
              >
                {/* Double the messages for seamless loop */}
                {[...messages, ...messages].map((msg, index) => (
                  <div 
                    key={`${msg.id}-${index}`} 
                    className="bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30 relative overflow-hidden group hover:shadow-xl transition-all"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-sage/20" />
                    <p className="text-sage-dark font-serif italic text-lg leading-relaxed mb-4">
                      "{msg.message}"
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/30">
                      <div>
                        <p className="text-sage font-medium text-sm tracking-widest uppercase">— {msg.name}</p>
                      </div>
                      <p className="text-[10px] text-sage/60 font-sans tracking-tight">
                        {formatDate(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center text-sage/60 py-20 font-serif italic">
                Belum ada pesan doa restu.
              </div>
            )}
            
            {/* Gradient Overlays for smooth fade */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/10 to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Right Column: RSVP Form or Success Message */}
        <div className="order-1 md:order-2">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white/40 backdrop-blur-lg p-12 rounded-2xl shadow-xl border border-white/30"
            >
              <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <svg className="w-10 h-10 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </motion.div>
              </div>
              <h3 className="text-3xl font-serif text-sage-dark mb-4 italic">Terima Kasih!</h3>
              <p className="text-sage/70 font-light leading-relaxed text-lg">
                Konfirmasi kehadiran dan doa restu Anda telah kami terima.<br/>
                Sampai jumpa di hari bahagia kami!
              </p>
            </motion.div>
          ) : (
            <div className="bg-white/40 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-white/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-sage mb-3">Nama Lengkap</label>
                  <input
                    {...register('name', { required: true })}
                    disabled={!!guestName}
                    className={`w-full border-b-2 border-sage/20 py-3 focus:border-sage outline-none transition-colors bg-transparent font-serif text-xl text-sage-dark ${guestName ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="Masukkan Nama Anda"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-sage mb-3">Konfirmasi Kehadiran</label>
                  <select
                    {...register('rsvp_status', { required: true })}
                    className="w-full border-b-2 border-sage/20 py-3 focus:border-sage outline-none bg-transparent font-serif text-xl text-sage-dark appearance-none cursor-pointer"
                  >
                    <option value="true">Akan Hadir</option>
                    <option value="false">Tidak Bisa Hadir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-sage mb-3">Jumlah Tamu</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      {...register('attendance_count', { min: 1, max: 5 })}
                      defaultValue={1}
                      className="w-24 border-b-2 border-sage/20 py-3 focus:border-sage outline-none bg-transparent font-serif text-xl text-sage-dark"
                    />
                    <span className="text-sage/60 font-light italic">Orang</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-sage mb-3">Pesan & Doa Restu</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="w-full border border-sage/20 p-4 focus:border-sage outline-none rounded-xl transition-colors bg-white/30 font-serif text-sage-dark text-lg"
                    placeholder="Tulis ucapan selamat Anda di sini..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sage-dark text-cream py-5 rounded-xl font-medium tracking-[0.2em] uppercase hover:bg-sage transition-all disabled:bg-gray-300 shadow-xl active:scale-[0.98]"
                >
                  {loading ? 'Mengirim...' : 'Kirim RSVP'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
