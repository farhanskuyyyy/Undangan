import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, X, Download, ShieldCheck } from 'lucide-react'

interface FloatingQRProps {
  guestId?: string
  guestName?: string
  groomName?: string
  brideName?: string
  visible?: boolean
}

export const FloatingQR = ({
  guestId,
  guestName,
  groomName,
  brideName,
  visible = true,
}: FloatingQRProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  if (!guestId || !guestName || !visible) return null

  const downloadQR = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `invitation-qr-${guestId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const gLetter = groomName ? groomName.trim().charAt(0).toUpperCase() : ''
  const bLetter = brideName ? brideName.trim().charAt(0).toUpperCase() : ''

  const qrCenterImage = gLetter && bLetter
    ? `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#C17E61" stroke-width="4" />
          <text x="50" y="53" font-family="'Georgia', 'Times New Roman', serif" font-size="34" font-weight="bold" fill="#4A5D4E" text-anchor="middle" dominant-baseline="middle">
            ${gLetter}&amp;${bLetter}
          </text>
        </svg>
      `.trim())}`
    : '/favicon.svg'

  return (
    <>
      {/* ─── Floating Button Badge ─── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-4 sm:right-6 z-[95] bg-white/90 hover:bg-white text-burgundy backdrop-blur-xl border border-primary/20 rounded-full shadow-xl px-3.5 py-2 flex items-center gap-2 cursor-pointer group min-h-[44px] select-none transition-all duration-300"
        aria-label="Buka QR Code Masuk"
        title="Klik untuk membuka QR Code Masuk"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
        </span>
        <QrCode className="w-4 h-4 text-primary group-hover:rotate-6 transition-transform" />
        <span className="text-xs font-semibold tracking-wider font-serif uppercase text-[#4A5D4E]">
          QR Tamu
        </span>
      </motion.button>

      {/* ─── QR Code Modal / Popup ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-[#FDFBF7] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-primary/20 text-center overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-burgundy bg-white/80 rounded-full shadow-sm border border-[#E5E1DA] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center justify-center gap-1.5 mb-1 text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-[0.25em]">
                  Digital Entry Pass
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif italic text-burgundy font-medium mb-1">
                {guestName}
              </h3>
              <p className="text-xs text-[#8C9A8E] font-sans mb-5">
                Tunjukkan QR Code ini kepada penerima tamu di lokasi
              </p>

              {/* QR Code Container */}
              <div className="bg-white p-5 rounded-2xl shadow-inner border border-[#E5E1DA] inline-block mb-5">
                <QRCodeCanvas
                  ref={canvasRef}
                  value={guestId}
                  size={190}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: qrCenterImage,
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
              </div>

              {/* Download QR Button */}
              <button
                onClick={downloadQR}
                className="w-full bg-burgundy hover:bg-primary text-white py-3 rounded-xl transition-all duration-300 font-serif text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                Simpan QR Code ke Galeri
              </button>

              <p className="text-[9px] text-[#8C9A8E] mt-4 font-mono uppercase tracking-widest">
                KODE: {guestId}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingQR
