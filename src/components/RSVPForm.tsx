import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, Heart, User, Calendar, MessageSquare, ShieldCheck, Users } from 'lucide-react'

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
  rsvp_status: boolean
  attendance_count: number
  created_at: string
}

export const RSVPForm = ({ 
  guestId, 
  guestName, 
  invitedPax = 2, 
  guestDescription 
}: { 
  guestId?: string; 
  guestName?: string; 
  invitedPax?: number; 
  guestDescription?: string; 
}) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RSVPData>()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [messages, setMessages] = useState<GuestMessage[]>([])

  useEffect(() => {
    if (guestName) {
      setValue('name', guestName)
    }
  }, [guestName, setValue])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('id, name, message, rsvp_status, attendance_count, created_at')
      .not('message', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
    } else if (data) {
      // Parse RSVP status in case of type variations from db
      const formatted: GuestMessage[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        message: d.message,
        rsvp_status: d.rsvp_status === true || String(d.rsvp_status) === 'true',
        attendance_count: Number(d.attendance_count) || 1,
        created_at: d.created_at,
      }))
      setMessages(formatted)
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
      minute: '2-digit',
    })
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
  }

  const onSubmit = async (data: RSVPData) => {
    setLoading(true)
    try {
      const parsedStatus = data.rsvp_status === true || String(data.rsvp_status) === 'true'
      const parsedCount = parsedStatus ? Number(data.attendance_count) : 0

      if (guestId) {
        // Update existing guest record if guestId provided (e.g. from URL)
        const { error } = await supabase
          .from('guests')
          .update({
            rsvp_status: parsedStatus,
            attendance_count: parsedCount,
            message: data.message,
          })
          .eq('qr_code', guestId)

        if (error) throw error
      } else {
        // Fallback or generic RSVP entry
        const { error } = await supabase.from('guests').insert([
          {
            ...data,
            rsvp_status: parsedStatus,
            attendance_count: parsedCount,
            qr_code: `manual-${Date.now()}`,
          },
        ])

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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-primary font-medium tracking-[0.3em] text-xs uppercase mb-3 block">RSVP & Guestbook</span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-script italic text-burgundy mb-4 sm:mb-6 leading-tight">Konfirmasi Kehadiran & Doa Restu</h2>
        <div className="w-12 h-px bg-gold/50 mx-auto" />
      </motion.div>

      <div className={`grid grid-cols-1 ${submitted ? 'max-w-3xl mx-auto' : 'lg:grid-cols-12'} gap-12 items-start`}>
        {/* RSVP Form Column */}
        {!submitted && (
          <div className="lg:col-span-5">
            <div className="bg-white/80 backdrop-blur-md p-5 sm:p-8 md:p-10 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-xl border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/5 rounded-full -ml-12 -mb-12 pointer-events-none" />
              
              <h3 className="text-2xl font-serif text-burgundy italic mb-8 border-b border-primary/10 pb-4 flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-primary" /> RSVP Form
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                {guestName && (
                  <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl text-burgundy text-xs space-y-1">
                    <p className="font-semibold text-sm">Selamat datang, {guestName}!</p>
                    {guestDescription && (
                      <p className="text-gray-500 italic">Grup Undangan: {guestDescription}</p>
                    )}
                    <p className="text-gray-400 font-sans">Anda diundang dengan batas kapasitas maksimal: <strong>{invitedPax} pax</strong>.</p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Nama Lengkap
                  </label>
                  <input
                    {...register('name', { required: true })}
                    disabled={!!guestName}
                    className={`w-full bg-white/50 border border-primary/20 rounded-2xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-300 font-sans text-burgundy ${
                      guestName ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
                    }`}
                    placeholder="Masukkan Nama Lengkap Anda"
                  />
                  {guestName && (
                    <span className="text-[10px] text-gray-400 italic mt-1 block">Nama dikunci berdasarkan tautan undangan</span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Konfirmasi Kehadiran
                  </label>
                  <select
                    {...register('rsvp_status', { required: true })}
                    className="w-full bg-white/50 border border-primary/20 rounded-2xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-300 font-sans text-burgundy cursor-pointer appearance-none"
                  >
                    <option value="true">Akan Hadir</option>
                    <option value="false">Tidak Bisa Hadir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Jumlah Hadir
                  </label>
                  <input
                    type="number"
                    {...register('attendance_count', { min: 1, max: invitedPax })}
                    defaultValue={1}
                    className="w-full bg-white/50 border border-primary/20 rounded-2xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-300 font-sans text-burgundy"
                  />
                  <span className="text-[10px] text-gray-400 italic mt-1 block font-sans">Maksimal porsi kehadiran: {invitedPax} pax</span>
                  {errors.attendance_count && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block font-sans">
                      {errors.attendance_count.type === 'max' 
                        ? `Jumlah hadir melebihi alokasi porsi undangan Anda (${invitedPax} pax).` 
                        : 'Jumlah hadir minimal 1 pax.'
                      }
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Pesan & Doa Restu
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="w-full bg-white/50 border border-primary/20 rounded-2xl p-5 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-300 font-sans text-burgundy"
                    placeholder="Tulis ucapan selamat & doa restu tulus Anda di sini..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-burgundy hover:bg-primary text-white py-4.5 rounded-2xl font-bold tracking-widest uppercase text-xs shadow-lg transition-all duration-300 cursor-pointer disabled:bg-gray-300 flex items-center justify-center gap-2.5"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Mengirim...' : 'Kirim Konfirmasi'}
                </motion.button>
              </form>
            </div>
          </div>
        )}

        {/* Wishes Wall Column */}
        <div className={submitted ? 'w-full' : 'lg:col-span-7'}>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/80 backdrop-blur-lg p-10 rounded-[3rem] shadow-xl border border-primary/10 mb-12 max-w-xl mx-auto"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-serif text-burgundy mb-3 italic">Terima Kasih Banyak!</h3>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Konfirmasi kehadiran dan doa restu berharga Anda telah berhasil disimpan. Kami sangat menghargai perhatian Anda!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubmitted(false)}
                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Isi RSVP Lagi
              </motion.button>
            </motion.div>
          ) : null}

          {/* Messages Listing */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif italic text-burgundy border-b border-primary/10 pb-4 flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-primary fill-primary/10" /> Doa Restu & Ucapan Selamat ({messages.length})
            </h3>

            <div className="max-h-[600px] overflow-y-auto pr-3 space-y-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
              {messages.length > 0 ? (
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-primary/10 shadow-sm flex gap-4 group hover:shadow-md hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Avatar */}
                      <div className="flex-none">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-gold/20 flex items-center justify-center border border-primary/10">
                          <span className="text-burgundy font-serif font-bold text-sm">
                            {msg.name ? getInitials(msg.name) : '?'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h4 className="text-burgundy font-serif font-medium text-lg leading-tight truncate">
                            {msg.name}
                          </h4>
                          <span
                            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              msg.rsvp_status
                                ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            }`}
                          >
                            {msg.rsvp_status ? `Hadir (${msg.attendance_count})` : 'Tidak Hadir'}
                          </span>
                        </div>

                        <p className="text-gray-600 font-light leading-relaxed text-sm italic pr-2 break-words">
                          "{msg.message}"
                        </p>

                        <div className="text-[10px] text-gray-400 font-light mt-3">
                          {formatDate(msg.created_at)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed border-primary/20 font-serif italic text-gray-400">
                  Belum ada pesan ucapan dari tamu.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
