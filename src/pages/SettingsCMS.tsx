import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import {
  Plus, Trash2, Save, Calendar, Heart, Image, Clock,
  ChevronUp, ChevronDown, X, Loader2, CheckCircle, GripVertical
} from 'lucide-react'
import Swal from 'sweetalert2'

const toastTheme = Swal.mixin({
  background: '#FDFBF7',
  color: '#4A5D4E',
  confirmButtonColor: '#4A5D4E',
  cancelButtonColor: '#C17E61',
  customClass: {
    popup: 'rounded-2xl border border-[#E5E1DA] font-serif shadow-xl',
    title: 'text-[#4A5D4E] font-serif font-semibold text-lg',
    htmlContainer: 'text-sm text-[#8C9A8E] font-sans mt-2',
    confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm cursor-pointer mx-1 focus:ring-2 focus:ring-[#4A5D4E] text-white bg-[#4A5D4E] border border-transparent hover:bg-[#3D4C40] transition-colors',
    cancelButton: 'rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm cursor-pointer mx-1 focus:ring-2 focus:ring-[#C17E61] text-white bg-[#C17E61] border border-transparent hover:bg-[#A96B51] transition-colors'
  },
  buttonsStyling: false
})

const showAlert = (text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
  let defaultTitle = 'Informasi'
  if (icon === 'success') defaultTitle = 'Berhasil'
  if (icon === 'error') defaultTitle = 'Gagal'
  if (icon === 'warning') defaultTitle = 'Peringatan'
  return toastTheme.fire({
    title: title || defaultTitle,
    text,
    icon,
    iconColor: icon === 'success' ? '#4A5D4E' : icon === 'error' || icon === 'warning' ? '#C17E61' : '#8C9A8E'
  })
}

// ─── Wedding Settings ────────────────────────────────────────────────
interface WeddingSettings {
  id?: number
  groom_name: string
  bride_name: string
  groom_full_name: string
  bride_full_name: string
  groom_parents: string
  bride_parents: string
  wedding_date: string
  location_name: string
  location_address: string
  maps_url: string
}

const emptySettings: WeddingSettings = {
  groom_name: '', bride_name: '', groom_full_name: '', bride_full_name: '',
  groom_parents: '', bride_parents: '', wedding_date: '',
  location_name: '', location_address: '', maps_url: ''
}

// ─── Love Story ──────────────────────────────────────────────────────
interface LoveStory {
  id: number
  event_date: string
  title: string
  description: string
  image_url: string
  order_index: number
}

// ─── Gallery ─────────────────────────────────────────────────────────
interface GalleryItem {
  id: number
  image_url: string
  aspect_ratio: string
  order_index: number
}

// ─── Rundown ─────────────────────────────────────────────────────────
interface Rundown {
  id: number
  time_start: string
  time_end: string
  title: string
  description: string
  order_index?: number
}

export const SettingsCMS = () => {
  const { user } = useAuth()

  // ── Section toggle ──
  const [activeSection, setActiveSection] = useState<'wedding' | 'stories' | 'galleries' | 'rundowns'>('wedding')

  // ── Wedding Settings ──
  const [settings, setSettings] = useState<WeddingSettings>(emptySettings)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  // ── Love Stories ──
  const [stories, setStories] = useState<LoveStory[]>([])
  const [storiesLoading, setStoriesLoading] = useState(true)
  const [storyModal, setStoryModal] = useState(false)
  const [editingStory, setEditingStory] = useState<LoveStory | null>(null)
  const [storyForm, setStoryForm] = useState({ event_date: '', title: '', description: '', image_url: '' })
  const [savingStory, setSavingStory] = useState(false)

  // ── Galleries ──
  const [galleries, setGalleries] = useState<GalleryItem[]>([])
  const [galleriesLoading, setGalleriesLoading] = useState(true)
  const [galleryModal, setGalleryModal] = useState(false)
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null)
  const [galleryForm, setGalleryForm] = useState({ image_url: '', aspect_ratio: '1/1' })
  const [savingGallery, setSavingGallery] = useState(false)

  // ── Rundowns ──
  const [rundowns, setRundowns] = useState<Rundown[]>([])
  const [rundownsLoading, setRundownsLoading] = useState(true)
  const [rundownModal, setRundownModal] = useState(false)
  const [editingRundown, setEditingRundown] = useState<Rundown | null>(null)
  const [rundownForm, setRundownForm] = useState({ time_start: '', time_end: '', title: '', description: '' })
  const [savingRundown, setSavingRundown] = useState(false)

  // ═══════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.getWeddingSettings()
      setSettings(data || emptySettings)
    } catch (err: any) {
      console.error('Gagal memuat pengaturan:', err)
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const fetchStories = useCallback(async () => {
    try {
      const data = await api.getLoveStories()
      setStories((data || []).sort((a: LoveStory, b: LoveStory) => a.order_index - b.order_index))
    } catch (err: any) {
      console.error('Gagal memuat love stories:', err)
    } finally {
      setStoriesLoading(false)
    }
  }, [])

  const fetchGalleries = useCallback(async () => {
    try {
      const data = await api.getGalleries()
      setGalleries((data || []).sort((a: GalleryItem, b: GalleryItem) => a.order_index - b.order_index))
    } catch (err: any) {
      console.error('Gagal memuat galeri:', err)
    } finally {
      setGalleriesLoading(false)
    }
  }, [])

  const fetchRundowns = useCallback(async () => {
    try {
      const data = await api.getRundowns()
      setRundowns(data || [])
    } catch (err: any) {
      console.error('Gagal memuat rundown:', err)
    } finally {
      setRundownsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchStories()
    fetchGalleries()
    fetchRundowns()
  }, [fetchSettings, fetchStories, fetchGalleries, fetchRundowns])

  // ═══════════════════════════════════════════════════════════════════
  // WEDDING SETTINGS HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      await api.updateWeddingSettings(settings)
      showAlert('Pengaturan pernikahan berhasil disimpan!', 'success')
    } catch (err: any) {
      showAlert(`Gagal menyimpan: ${err.message}`, 'error')
    } finally {
      setSettingsSaving(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // LOVE STORIES HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const openStoryModal = (story?: LoveStory) => {
    if (story) {
      setEditingStory(story)
      setStoryForm({
        event_date: story.event_date || '',
        title: story.title,
        description: story.description || '',
        image_url: story.image_url || ''
      })
    } else {
      setEditingStory(null)
      setStoryForm({ event_date: '', title: '', description: '', image_url: '' })
    }
    setStoryModal(true)
  }

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyForm.title.trim()) {
      showAlert('Judul harus diisi.', 'warning')
      return
    }
    setSavingStory(true)
    try {
      const maxOrder = stories.length > 0 ? Math.max(...stories.map(s => s.order_index)) : 0
      if (editingStory) {
        await api.updateLoveStory(editingStory.id, storyForm)
        showAlert('Cerita cinta berhasil diperbarui!', 'success')
      } else {
        await api.createLoveStory({ ...storyForm, order_index: maxOrder + 1 })
        showAlert('Cerita cinta baru berhasil ditambahkan!', 'success')
      }
      setStoryModal(false)
      fetchStories()
    } catch (err: any) {
      showAlert(`Gagal menyimpan: ${err.message}`, 'error')
    } finally {
      setSavingStory(false)
    }
  }

  const handleDeleteStory = async (id: number) => {
    const result = await toastTheme.fire({
      title: 'Hapus Cerita',
      text: 'Apakah Anda yakin ingin menghapus cerita ini?',
      icon: 'warning', iconColor: '#C17E61',
      showCancelButton: true, confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal'
    })
    if (!result.isConfirmed) return
    try {
      await api.deleteLoveStory(id)
      showAlert('Cerita berhasil dihapus.', 'success')
      fetchStories()
    } catch (err: any) {
      showAlert(`Gagal menghapus: ${err.message}`, 'error')
    }
  }

  const handleMoveStory = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...stories].sort((a, b) => a.order_index - b.order_index)
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= sorted.length) return
    const a = sorted[index], b = sorted[targetIdx]
    try {
      await api.updateLoveStory(a.id, { order_index: b.order_index })
      await api.updateLoveStory(b.id, { order_index: a.order_index })
      fetchStories()
    } catch (err: any) {
      showAlert(`Gagal mengubah urutan: ${err.message}`, 'error')
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // GALLERIES HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const openGalleryModal = (item?: GalleryItem) => {
    if (item) {
      setEditingGallery(item)
      setGalleryForm({ image_url: item.image_url, aspect_ratio: item.aspect_ratio || '1/1' })
    } else {
      setEditingGallery(null)
      setGalleryForm({ image_url: '', aspect_ratio: '1/1' })
    }
    setGalleryModal(true)
  }

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!galleryForm.image_url.trim()) {
      showAlert('URL gambar harus diisi.', 'warning')
      return
    }
    setSavingGallery(true)
    try {
      const maxOrder = galleries.length > 0 ? Math.max(...galleries.map(g => g.order_index)) : 0
      if (editingGallery) {
        await api.updateGallery(editingGallery.id, galleryForm)
        showAlert('Galeri berhasil diperbarui!', 'success')
      } else {
        await api.createGallery({ ...galleryForm, order_index: maxOrder + 1 })
        showAlert('Foto baru berhasil ditambahkan!', 'success')
      }
      setGalleryModal(false)
      fetchGalleries()
    } catch (err: any) {
      showAlert(`Gagal menyimpan: ${err.message}`, 'error')
    } finally {
      setSavingGallery(false)
    }
  }

  const handleDeleteGallery = async (id: number) => {
    const result = await toastTheme.fire({
      title: 'Hapus Foto',
      text: 'Apakah Anda yakin ingin menghapus foto ini?',
      icon: 'warning', iconColor: '#C17E61',
      showCancelButton: true, confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal'
    })
    if (!result.isConfirmed) return
    try {
      await api.deleteGallery(id)
      showAlert('Foto berhasil dihapus.', 'success')
      fetchGalleries()
    } catch (err: any) {
      showAlert(`Gagal menghapus: ${err.message}`, 'error')
    }
  }

  const handleMoveGallery = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...galleries].sort((a, b) => a.order_index - b.order_index)
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= sorted.length) return
    const a = sorted[index], b = sorted[targetIdx]
    try {
      await api.updateGallery(a.id, { order_index: b.order_index })
      await api.updateGallery(b.id, { order_index: a.order_index })
      fetchGalleries()
    } catch (err: any) {
      showAlert(`Gagal mengubah urutan: ${err.message}`, 'error')
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RUNDOWNS HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const openRundownModal = (item?: Rundown) => {
    if (item) {
      setEditingRundown(item)
      setRundownForm({ time_start: item.time_start, time_end: item.time_end, title: item.title, description: item.description || '' })
    } else {
      setEditingRundown(null)
      setRundownForm({ time_start: '', time_end: '', title: '', description: '' })
    }
    setRundownModal(true)
  }

  const handleSaveRundown = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rundownForm.title.trim()) {
      showAlert('Judul harus diisi.', 'warning')
      return
    }
    setSavingRundown(true)
    try {
      const maxOrder = rundowns.length > 0 ? Math.max(...rundowns.map(r => r.order_index ?? 0)) : 0
      if (editingRundown) {
        await api.updateRundown(editingRundown.id, rundownForm)
        showAlert('Rundown berhasil diperbarui!', 'success')
      } else {
        await api.createRundown({ ...rundownForm, order_index: maxOrder + 1 })
        showAlert('Rundown baru berhasil ditambahkan!', 'success')
      }
      setRundownModal(false)
      fetchRundowns()
    } catch (err: any) {
      showAlert(`Gagal menyimpan: ${err.message}`, 'error')
    } finally {
      setSavingRundown(false)
    }
  }

  const handleDeleteRundown = async (id: number) => {
    const result = await toastTheme.fire({
      title: 'Hapus Rundown',
      text: 'Apakah Anda yakin ingin menghapus item rundown ini?',
      icon: 'warning', iconColor: '#C17E61',
      showCancelButton: true, confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal'
    })
    if (!result.isConfirmed) return
    try {
      await api.deleteRundown(id)
      showAlert('Rundown berhasil dihapus.', 'success')
      fetchRundowns()
    } catch (err: any) {
      showAlert(`Gagal menghapus: ${err.message}`, 'error')
    }
  }

  const handleMoveRundown = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= rundowns.length) return
    const arr = [...rundowns]
    const a = arr[index], b = arr[targetIdx]
    try {
      // swap order_index values
      const aOrder = a.order_index ?? index
      const bOrder = b.order_index ?? targetIdx
      await api.updateRundown(a.id, { order_index: bOrder })
      await api.updateRundown(b.id, { order_index: aOrder })
      fetchRundowns()
    } catch (err: any) {
      showAlert(`Gagal mengubah urutan: ${err.message}`, 'error')
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // INPUT FIELD HELPER
  // ═══════════════════════════════════════════════════════════════════

  const InputField = ({
    label, value, onChange, type = 'text', placeholder = '', required = false, rows
  }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; required?: boolean; rows?: number
  }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#8C9A8E] uppercase tracking-wider">{label}</label>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full px-4 py-3 rounded-xl border border-[#E5E1DA] bg-white text-[#4A5D4E] text-sm font-sans
            focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] transition-all placeholder:text-gray-300 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 rounded-xl border border-[#E5E1DA] bg-white text-[#4A5D4E] text-sm font-sans
            focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] transition-all placeholder:text-gray-300"
        />
      )}
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  const sections = [
    { key: 'wedding' as const, label: 'Pernikahan', icon: <Heart size={14} /> },
    { key: 'stories' as const, label: 'Cerita Cinta', icon: <Calendar size={14} /> },
    { key: 'galleries' as const, label: 'Galeri', icon: <Image size={14} /> },
    { key: 'rundowns' as const, label: 'Rundown', icon: <Clock size={14} /> },
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 md:p-12 text-[#4A5D4E]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif italic mb-1">Pengaturan Undangan</h1>
            <p className="text-xs sm:text-sm text-[#8C9A8E] break-all">{user?.email}</p>
          </div>
          <a
            href="/admin"
            className="text-xs sm:text-sm bg-white px-4 py-2.5 rounded-full border border-[#E5E1DA] hover:border-[#C17E61] hover:text-[#C17E61] transition-all shadow-sm flex items-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            Kembali ke Tamu
          </a>
        </header>

        {/* Section Tabs */}
        <div className="flex bg-[#FDFBF7] p-1.5 rounded-2xl mb-8 border border-[#E5E1DA] shadow-sm overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSection === s.key
                  ? 'bg-[#4A5D4E] text-white shadow-sm'
                  : 'text-[#8C9A8E] hover:text-[#4A5D4E]'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* ═══════════ WEDDING SETTINGS ═══════════ */}
        <AnimatePresence mode="wait">
          {activeSection === 'wedding' && (
            <motion.div
              key="wedding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {settingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-[#8C9A8E]" />
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  {/* Mempelai */}
                  <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-6">
                    <h2 className="text-lg font-serif italic mb-6 flex items-center gap-2">
                      <Heart size={18} className="text-[#C17E61]" /> Data Mempelai
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InputField label="Nama Panggilan Pria" value={settings.groom_name} onChange={(v) => setSettings({ ...settings, groom_name: v })} placeholder="Farhan" />
                      <InputField label="Nama Panggilan Wanita" value={settings.bride_name} onChange={(v) => setSettings({ ...settings, bride_name: v })} placeholder="Tazkiah" />
                      <InputField label="Nama Lengkap Pria" value={settings.groom_full_name} onChange={(v) => setSettings({ ...settings, groom_full_name: v })} placeholder="Farhan Fauzi" />
                      <InputField label="Nama Lengkap Wanita" value={settings.bride_full_name} onChange={(v) => setSettings({ ...settings, bride_full_name: v })} placeholder="Tazkiah Putri" />
                      <InputField label="Orang Tua Pria" value={settings.groom_parents} onChange={(v) => setSettings({ ...settings, groom_parents: v })} placeholder="Bpk. Ahmad & Ibu Fatimah" rows={2} />
                      <InputField label="Orang Tua Wanita" value={settings.bride_parents} onChange={(v) => setSettings({ ...settings, bride_parents: v })} placeholder="Bpk. Hasan & Ibu Aisyah" rows={2} />
                    </div>
                  </div>

                  {/* Acara */}
                  <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-6">
                    <h2 className="text-lg font-serif italic mb-6 flex items-center gap-2">
                      <Calendar size={18} className="text-[#C17E61]" /> Informasi Acara
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InputField label="Tanggal Pernikahan" value={settings.wedding_date} onChange={(v) => setSettings({ ...settings, wedding_date: v })} type="date" />
                      <InputField label="Nama Lokasi" value={settings.location_name} onChange={(v) => setSettings({ ...settings, location_name: v })} placeholder="Masjid Agung Al-Azhar" />
                      <div className="sm:col-span-2">
                        <InputField label="Alamat Lokasi" value={settings.location_address} onChange={(v) => setSettings({ ...settings, location_address: v })} placeholder="Jl. Sisingamangaraja, Jakarta Selatan" rows={2} />
                      </div>
                      <div className="sm:col-span-2">
                        <InputField label="Google Maps URL" value={settings.maps_url} onChange={(v) => setSettings({ ...settings, maps_url: v })} placeholder="https://maps.google.com/..." />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="bg-[#4A5D4E] text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-sm
                        hover:bg-[#3D4C40] transition-all min-h-[44px] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {settingsSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Simpan Pengaturan
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* ═══════════ LOVE STORIES ═══════════ */}
          {activeSection === 'stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-serif italic">Cerita Cinta</h2>
                <button
                  onClick={() => openStoryModal()}
                  className="bg-[#C17E61] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm
                    hover:bg-[#A96B51] transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Cerita
                </button>
              </div>

              {storiesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-[#8C9A8E]" />
                </div>
              ) : stories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-12 text-center">
                  <Heart size={32} className="mx-auto mb-3 text-[#E5E1DA]" />
                  <p className="text-sm text-[#8C9A8E]">Belum ada cerita cinta. Klik "Tambah Cerita" untuk memulai.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stories.map((story, idx) => (
                    <div key={story.id} className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-1 text-[#8C9A8E]">
                        <GripVertical size={14} />
                        <span className="text-[10px] font-mono bg-[#FDFBF7] rounded-md px-1.5 py-0.5">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-serif font-bold text-[#4A5D4E] truncate">{story.title}</h3>
                        <p className="text-[11px] text-[#C17E61]">{story.event_date}</p>
                        {story.description && (
                          <p className="text-xs text-[#8C9A8E] mt-1 line-clamp-2">{story.description}</p>
                        )}
                        {story.image_url && (
                          <img src={story.image_url} alt={story.title} className="mt-2 w-20 h-20 rounded-lg object-cover border border-[#E5E1DA]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => handleMoveStory(idx, 'up')} disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-[#FDFBF7] transition-all disabled:opacity-30 cursor-pointer"><ChevronUp size={14} /></button>
                        <button onClick={() => handleMoveStory(idx, 'down')} disabled={idx === stories.length - 1}
                          className="p-1.5 rounded-lg hover:bg-[#FDFBF7] transition-all disabled:opacity-30 cursor-pointer"><ChevronDown size={14} /></button>
                        <button onClick={() => openStoryModal(story)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-all cursor-pointer"><CheckCircle size={14} /></button>
                        <button onClick={() => handleDeleteStory(story.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Story Modal */}
              <AnimatePresence>
                {storyModal && (
                  <ModalBackdrop onClose={() => setStoryModal(false)}>
                    <ModalCard title={editingStory ? 'Edit Cerita' : 'Tambah Cerita'} onClose={() => setStoryModal(false)}>
                      <form onSubmit={handleSaveStory} className="space-y-4">
                        <InputField label="Tanggal" value={storyForm.event_date} onChange={(v) => setStoryForm({ ...storyForm, event_date: v })} type="date" />
                        <InputField label="Judul" value={storyForm.title} onChange={(v) => setStoryForm({ ...storyForm, title: v })} placeholder="Pertama kali bertemu..." required />
                        <InputField label="Deskripsi" value={storyForm.description} onChange={(v) => setStoryForm({ ...storyForm, description: v })} placeholder="Ceritakan kisah cinta kalian..." rows={3} />
                        <InputField label="URL Gambar" value={storyForm.image_url} onChange={(v) => setStoryForm({ ...storyForm, image_url: v })} placeholder="https://..." />
                        {storyForm.image_url && (
                          <img src={storyForm.image_url} alt="Preview" className="w-32 h-32 rounded-xl object-cover border border-[#E5E1DA] mx-auto" />
                        )}
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setStoryModal(false)}
                            className="flex-1 py-3 rounded-xl border border-[#E5E1DA] text-[#8C9A8E] text-xs font-semibold hover:border-[#C17E61] hover:text-[#C17E61] transition-all cursor-pointer">Batal</button>
                          <button type="submit" disabled={savingStory}
                            className="flex-1 py-3 rounded-xl bg-[#4A5D4E] text-white text-xs font-semibold hover:bg-[#3D4C40] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                            {savingStory ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Simpan
                          </button>
                        </div>
                      </form>
                    </ModalCard>
                  </ModalBackdrop>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ═══════════ GALLERIES ═══════════ */}
          {activeSection === 'galleries' && (
            <motion.div
              key="galleries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-serif italic">Galeri Foto</h2>
                <button
                  onClick={() => openGalleryModal()}
                  className="bg-[#C17E61] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm
                    hover:bg-[#A96B51] transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Foto
                </button>
              </div>

              {galleriesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-[#8C9A8E]" />
                </div>
              ) : galleries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-12 text-center">
                  <Image size={32} className="mx-auto mb-3 text-[#E5E1DA]" />
                  <p className="text-sm text-[#8C9A8E]">Belum ada foto. Klik "Tambah Foto" untuk memulai.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {galleries.map((item, idx) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-4 flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1 text-[#8C9A8E]">
                        <GripVertical size={14} />
                        <span className="text-[10px] font-mono bg-[#FDFBF7] rounded-md px-1.5 py-0.5">{idx + 1}</span>
                      </div>
                      <img src={item.image_url} alt={`Gallery ${idx + 1}`}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E5E1DA] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#8C9A8E] truncate">{item.image_url}</p>
                        <p className="text-[11px] text-[#C17E61]">Rasio: {item.aspect_ratio}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => handleMoveGallery(idx, 'up')} disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-[#FDFBF7] transition-all disabled:opacity-30 cursor-pointer"><ChevronUp size={14} /></button>
                        <button onClick={() => handleMoveGallery(idx, 'down')} disabled={idx === galleries.length - 1}
                          className="p-1.5 rounded-lg hover:bg-[#FDFBF7] transition-all disabled:opacity-30 cursor-pointer"><ChevronDown size={14} /></button>
                        <button onClick={() => openGalleryModal(item)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-all cursor-pointer"><CheckCircle size={14} /></button>
                        <button onClick={() => handleDeleteGallery(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Gallery Modal */}
              <AnimatePresence>
                {galleryModal && (
                  <ModalBackdrop onClose={() => setGalleryModal(false)}>
                    <ModalCard title={editingGallery ? 'Edit Foto' : 'Tambah Foto'} onClose={() => setGalleryModal(false)}>
                      <form onSubmit={handleSaveGallery} className="space-y-4">
                        <InputField label="URL Gambar" value={galleryForm.image_url} onChange={(v) => setGalleryForm({ ...galleryForm, image_url: v })} placeholder="https://..." required />
                        {galleryForm.image_url && (
                          <img src={galleryForm.image_url} alt="Preview" className="w-full max-h-48 rounded-xl object-cover border border-[#E5E1DA]" />
                        )}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#8C9A8E] uppercase tracking-wider">Aspek Rasio</label>
                          <select
                            value={galleryForm.aspect_ratio}
                            onChange={(e) => setGalleryForm({ ...galleryForm, aspect_ratio: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E1DA] bg-white text-[#4A5D4E] text-sm font-sans
                              focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] transition-all cursor-pointer"
                          >
                            <option value="1/1">1:1 (Square)</option>
                            <option value="4/3">4:3 (Landscape)</option>
                            <option value="3/4">3:4 (Portrait)</option>
                            <option value="16/9">16:9 (Wide)</option>
                            <option value="9/16">9:16 (Tall)</option>
                          </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setGalleryModal(false)}
                            className="flex-1 py-3 rounded-xl border border-[#E5E1DA] text-[#8C9A8E] text-xs font-semibold hover:border-[#C17E61] hover:text-[#C17E61] transition-all cursor-pointer">Batal</button>
                          <button type="submit" disabled={savingGallery}
                            className="flex-1 py-3 rounded-xl bg-[#4A5D4E] text-white text-xs font-semibold hover:bg-[#3D4C40] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                            {savingGallery ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Simpan
                          </button>
                        </div>
                      </form>
                    </ModalCard>
                  </ModalBackdrop>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ═══════════ RUNDOWNS ═══════════ */}
          {activeSection === 'rundowns' && (
            <motion.div
              key="rundowns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-serif italic">Rundown Acara</h2>
                <button
                  onClick={() => openRundownModal()}
                  className="bg-[#C17E61] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm
                    hover:bg-[#A96B51] transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Rundown
                </button>
              </div>

              {rundownsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-[#8C9A8E]" />
                </div>
              ) : rundowns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-12 text-center">
                  <Clock size={32} className="mx-auto mb-3 text-[#E5E1DA]" />
                  <p className="text-sm text-[#8C9A8E]">Belum ada rundown. Klik "Tambah Rundown" untuk memulai.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rundowns.map((item, idx) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-[#E5E1DA] shadow-sm p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-1 text-[#8C9A8E]">
                        <GripVertical size={14} />
                        <span className="text-[10px] font-mono bg-[#FDFBF7] rounded-md px-1.5 py-0.5">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-serif font-bold text-[#4A5D4E] truncate">{item.title}</h3>
                        <p className="text-[11px] text-[#C17E61]">
                          <Clock size={10} className="inline mr-1" />
                          {item.time_start} — {item.time_end}
                        </p>
                        {item.description && (
                          <p className="text-xs text-[#8C9A8E] mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => handleMoveRundown(idx, 'up')} disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-[#FDFBF7] transition-all disabled:opacity-30 cursor-pointer"><ChevronUp size={14} /></button>
                        <button onClick={() => handleMoveRundown(idx, 'down')} disabled={idx === rundowns.length - 1}
                          className="p-1.5 rounded-lg hover:bg-[#FDFBF7] transition-all disabled:opacity-30 cursor-pointer"><ChevronDown size={14} /></button>
                        <button onClick={() => openRundownModal(item)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-all cursor-pointer"><CheckCircle size={14} /></button>
                        <button onClick={() => handleDeleteRundown(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rundown Modal */}
              <AnimatePresence>
                {rundownModal && (
                  <ModalBackdrop onClose={() => setRundownModal(false)}>
                    <ModalCard title={editingRundown ? 'Edit Rundown' : 'Tambah Rundown'} onClose={() => setRundownModal(false)}>
                      <form onSubmit={handleSaveRundown} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Jam Mulai" value={rundownForm.time_start} onChange={(v) => setRundownForm({ ...rundownForm, time_start: v })} type="time" />
                          <InputField label="Jam Selesai" value={rundownForm.time_end} onChange={(v) => setRundownForm({ ...rundownForm, time_end: v })} type="time" />
                        </div>
                        <InputField label="Judul" value={rundownForm.title} onChange={(v) => setRundownForm({ ...rundownForm, title: v })} placeholder="Akad Nikah" required />
                        <InputField label="Deskripsi" value={rundownForm.description} onChange={(v) => setRundownForm({ ...rundownForm, description: v })} placeholder="Detail acara..." rows={3} />
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setRundownModal(false)}
                            className="flex-1 py-3 rounded-xl border border-[#E5E1DA] text-[#8C9A8E] text-xs font-semibold hover:border-[#C17E61] hover:text-[#C17E61] transition-all cursor-pointer">Batal</button>
                          <button type="submit" disabled={savingRundown}
                            className="flex-1 py-3 rounded-xl bg-[#4A5D4E] text-white text-xs font-semibold hover:bg-[#3D4C40] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                            {savingRundown ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Simpan
                          </button>
                        </div>
                      </form>
                    </ModalCard>
                  </ModalBackdrop>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MODAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </motion.div>
  )
}

function ModalCard({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-serif italic text-[#4A5D4E]">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#FDFBF7] text-[#8C9A8E] transition-all cursor-pointer">
          <X size={18} />
        </button>
      </div>
      {children}
    </motion.div>
  )
}

export default SettingsCMS
