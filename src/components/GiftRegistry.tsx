import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Gift, CreditCard, MapPin } from 'lucide-react'

interface AccountInfo {
  bankName: string
  accountNumber: string
  holderName: string
  logoUrl?: string
}

export const GiftRegistry: React.FC = () => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  const [showGiftOptions, setShowGiftOptions] = useState(false)

  const accounts: AccountInfo[] = [
    {
      bankName: 'BCA',
      accountNumber: '8691234567',
      holderName: 'Farhan Arfianto',
    },
    {
      bankName: 'Mandiri',
      accountNumber: '1570009876543',
      holderName: 'Farhan Arfianto',
    },
  ]

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber)
    setCopiedAccount(accountNumber)
    setTimeout(() => {
      setCopiedAccount(null)
    }, 2000)
  }

  return (
    <section className="py-24 bg-gradient-to-b from-[#FDF2F8] to-[#FFF] relative overflow-hidden">
      {/* Decorative frame vectors */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="gift-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0 L30 60 M0 30 L60 30" stroke="#831843" strokeWidth="1" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#gift-pattern)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium tracking-[0.3em] text-xs uppercase mb-3 block">Share Your Love</span>
          <h2 className="text-5xl font-script italic text-burgundy mb-6 leading-tight">Digital Gift & Wedding Gift</h2>
          <p className="text-gray-600 font-light leading-relaxed max-w-xl mx-auto text-lg">
            Doa restu Anda adalah karunia terindah bagi kami. Namun, apabila Anda ingin memberikan tanda kasih secara digital atau mengirim kado fisik, silakan gunakan informasi di bawah ini.
          </p>
        </motion.div>

        <div className="flex justify-center mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGiftOptions(!showGiftOptions)}
            className="flex items-center gap-3 bg-burgundy hover:bg-primary text-white font-medium px-8 py-4 rounded-full shadow-lg transition-all duration-300 font-sans tracking-wider uppercase text-xs cursor-pointer"
          >
            <Gift className="w-5 h-5" />
            {showGiftOptions ? 'Sembunyikan Informasi Kado' : 'Kirim Kado / Amplop Digital'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showGiftOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Bank Transfers */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif italic text-burgundy border-b border-primary/20 pb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Transfer Bank (Amplop Digital)
                  </h3>
                  
                  {accounts.map((acc, index) => (
                    <motion.div
                      key={acc.accountNumber}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-primary/10 shadow-md flex justify-between items-center group hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-gold" />
                      
                      <div className="pl-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                          {acc.bankName}
                        </span>
                        <p className="text-2xl font-mono font-bold text-burgundy tracking-wider mb-1">
                          {acc.accountNumber}
                        </p>
                        <p className="text-gray-500 font-light text-sm uppercase tracking-wider">
                          a.n. {acc.holderName}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(acc.accountNumber)}
                        className={`p-4 rounded-2xl cursor-pointer ${
                          copiedAccount === acc.accountNumber
                            ? 'bg-green-500 text-white shadow-green-100'
                            : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'
                        } transition-all duration-300 shadow-md`}
                      >
                        {copiedAccount === acc.accountNumber ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {/* Gift Shipping Address */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif italic text-burgundy border-b border-primary/20 pb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Pengiriman Kado Fisik
                  </h3>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-primary/10 shadow-md flex flex-col justify-between h-[216px] group hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-gold to-primary" />
                    
                    <div className="pl-2">
                      <span className="bg-gold/10 text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                        Alamat Pengiriman
                      </span>
                      <p className="text-burgundy font-serif font-medium text-lg mb-2">
                        Kediaman Mempelai Pria (Farhan Arfianto)
                      </p>
                      <p className="text-gray-600 font-light text-sm leading-relaxed mb-4">
                        Jl. Sudirman No. 123, Blok C4, Kebayoran Baru, Jakarta Selatan, 12190
                      </p>
                    </div>

                    <div className="pl-2 border-t border-gray-100 pt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-light">Penerima: Farhan Arfianto</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy('Jl. Sudirman No. 123, Blok C4, Kebayoran Baru, Jakarta Selatan, 12190')}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-burgundy font-medium uppercase tracking-wider cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Salin Alamat
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Toast Notification */}
        <AnimatePresence>
          {copiedAccount && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-burgundy/95 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl border border-primary/20 flex items-center gap-3 z-50 text-sm tracking-wide"
            >
              <Check className="w-5 h-5 text-gold animate-bounce" />
              <span>Informasi berhasil disalin ke clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
