import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface GalleryImage {
  image_url: string
  aspect_ratio: string
}

interface GalleryProps {
  images: GalleryImage[]
}

const Gallery = ({ images }: GalleryProps) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [mobileIdx, setMobileIdx] = useState<number>(0)

  if (!images || images.length === 0) return null

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIdx((prev) => (prev === null || prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIdx((prev) => (prev === null || prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleMobilePrev = () => {
    setMobileIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleMobileNext = () => {
    setMobileIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div id="gallery" className="py-14 sm:py-20 md:py-24 bg-gradient-to-b from-[#FFF] to-[#FDF2F8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-10 sm:mb-14 md:mb-16"
        >
          <span className="text-primary font-medium tracking-[0.3em] text-[10px] sm:text-xs uppercase mb-3 block">Our Moments</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-script italic text-burgundy mb-4 sm:mb-6 leading-tight">Love Story Gallery</h2>
          <div className="w-12 h-px bg-gold/50 mx-auto" />
        </motion.div>

        {/* ─── Mobile Version: Touch Carousel / Slider (below sm) ─── */}
        <div className="block sm:hidden relative">
          <div className="relative overflow-hidden rounded-3xl border border-primary/10 shadow-lg bg-white/70">
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveIdx(mobileIdx)}
                className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden flex items-center justify-center bg-burgundy/5"
              >
                <img
                  src={images[mobileIdx].image_url}
                  alt={`Moment ${mobileIdx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy/40 via-transparent to-transparent flex items-end justify-between p-4">
                  <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-sans tracking-widest px-3 py-1.5 rounded-full border border-white/20 uppercase">
                    {mobileIdx + 1} / {images.length}
                  </span>
                  <span className="bg-white/90 text-burgundy text-[11px] font-sans font-medium px-3 py-1.5 rounded-full shadow flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5" /> Perbesar
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next Touch Buttons */}
            <button
              onClick={handleMobilePrev}
              aria-label="Foto sebelumnya"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-md text-burgundy rounded-full shadow-md flex items-center justify-center border border-white/60 active:scale-90 transition-transform cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleMobileNext}
              aria-label="Foto selanjutnya"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-md text-burgundy rounded-full shadow-md flex items-center justify-center border border-white/60 active:scale-90 transition-transform cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Pagination */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setMobileIdx(idx)}
                aria-label={`Lihat foto ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  mobileIdx === idx ? 'w-6 bg-primary' : 'w-2 bg-primary/25 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ─── Desktop & Tablet Version: Masonry Columns (sm and up) ─── */}
        <div className="hidden sm:block sm:columns-2 md:columns-3 gap-6 space-y-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              onClick={() => setActiveIdx(index)}
              className="break-inside-avoid overflow-hidden rounded-3xl border border-primary/10 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer relative group aspect-auto bg-white/50"
            >
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-burgundy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  className="bg-white/95 text-burgundy p-4 rounded-full shadow-lg"
                >
                  <ZoomIn className="w-5 h-5" />
                </motion.div>
              </div>

              <img
                src={image.image_url}
                alt={`Moment ${index + 1}`}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 block"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIdx(null)}
            className="fixed inset-0 bg-burgundy/95 backdrop-blur-md z-[110] flex items-center justify-center p-4 md:p-8 cursor-zoom-out select-none"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveIdx(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-[120] bg-white/10 hover:bg-white text-white hover:text-burgundy p-3.5 rounded-full shadow-xl transition-all duration-300 cursor-pointer border border-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Tutup foto"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.1, x: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="absolute left-2 md:left-8 z-[120] bg-white/10 hover:bg-white text-white hover:text-burgundy p-3 md:p-3.5 rounded-full shadow-xl transition-all duration-300 cursor-pointer border border-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Image Container with Slide animation */}
            <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center cursor-default px-2" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, scale: 0.95, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-3xl overflow-hidden border-2 md:border-4 border-white/10 shadow-2xl"
                >
                  <img
                    src={images[activeIdx].image_url}
                    alt={`Moment ${activeIdx + 1}`}
                    className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain rounded-2xl block"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/45 backdrop-blur-md text-white/90 text-[10px] md:text-xs px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-white/10 font-sans tracking-widest uppercase">
                    Photo {activeIdx + 1} / {images.length}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.1, x: 4 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="absolute right-2 md:right-8 z-[120] bg-white/10 hover:bg-white text-white hover:text-burgundy p-3 md:p-3.5 rounded-full shadow-xl transition-all duration-300 cursor-pointer border border-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Foto selanjutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Gallery
