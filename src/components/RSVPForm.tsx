import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

interface RSVPData {
  name: string
  rsvp_status: boolean
  attendance_count: number
  message: string
}

export const RSVPForm = ({ guestId }: { guestId?: string }) => {
  const { register, handleSubmit, reset } = useForm<RSVPData>()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = async (data: RSVPData) => {
    setLoading(true)
    try {
      if (guestId) {
        // Update existing guest record if guestId provided (e.g. from URL)
        const { error } = await supabase
          .from('guests')
          .update({
            rsvp_status: data.rsvp_status,
            attendance_count: data.attendance_count,
            message: data.message
          })
          .eq('qr_code', guestId)
        
        if (error) throw error
      } else {
        // Fallback or generic RSVP entry
        const { error } = await supabase
          .from('guests')
          .insert([{ ...data, qr_code: `manual-${Date.now()}` }])
        
        if (error) throw error
      }
      setSubmitted(true)
      reset()
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      alert('Gagal mengirim RSVP. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10 bg-green-50 rounded-lg border border-green-100">
        <h3 className="text-xl font-serif text-green-800 mb-2">Terima Kasih!</h3>
        <p className="text-green-600">RSVP Anda telah berhasil dikirim.</p>
      </div>
    )
  }

  return (
    <section className="py-20 max-w-lg mx-auto px-6">
      <h2 className="text-3xl font-serif text-center mb-10 italic">RSVP</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-light uppercase tracking-widest text-gray-500 mb-2">Nama</label>
          <input
            {...register('name', { required: true })}
            className="w-full border-b border-gray-300 py-2 focus:border-gray-900 outline-none transition-colors bg-transparent font-serif text-lg"
            placeholder="Masukkan Nama Anda"
          />
        </div>

        <div>
          <label className="block text-sm font-light uppercase tracking-widest text-gray-500 mb-2">Konfirmasi Kehadiran</label>
          <select
            {...register('rsvp_status', { required: true })}
            className="w-full border-b border-gray-300 py-2 focus:border-gray-900 outline-none bg-transparent font-serif text-lg"
          >
            <option value="true">Akan Hadir</option>
            <option value="false">Tidak Bisa Hadir</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-light uppercase tracking-widest text-gray-500 mb-2">Jumlah Tamu</label>
          <input
            type="number"
            {...register('attendance_count', { min: 1, max: 5 })}
            defaultValue={1}
            className="w-full border-b border-gray-300 py-2 focus:border-gray-900 outline-none bg-transparent font-serif text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-light uppercase tracking-widest text-gray-500 mb-2">Pesan & Doa Restu</label>
          <textarea
            {...register('message')}
            rows={4}
            className="w-full border border-gray-200 p-3 focus:border-gray-900 outline-none rounded-sm transition-colors bg-transparent font-serif"
            placeholder="Tulis ucapan selamat Anda..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-4 font-light tracking-[0.2em] uppercase hover:bg-black transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Mengirim...' : 'Kirim RSVP'}
        </button>
      </form>
    </section>
  )
}
