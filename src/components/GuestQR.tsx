import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';

interface GuestQRProps {
  guestId?: string;
  guestName?: string;
  groomName?: string;
  brideName?: string;
}

const GuestQR = ({ guestId, guestName, groomName, brideName }: GuestQRProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `invitation-qr-${guestId || 'invalid'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isInvalid = !guestId || !guestName;

  const gLetter = groomName ? groomName.trim().charAt(0).toUpperCase() : '';
  const bLetter = brideName ? brideName.trim().charAt(0).toUpperCase() : '';
  
  // Generate a premium SVG data URI featuring the wedding initials
  const qrCenterImage = gLetter && bLetter
    ? `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#C17E61" stroke-width="4" />
          <text x="50" y="53" font-family="'Georgia', 'Times New Roman', serif" font-size="34" font-weight="bold" fill="#4A5D4E" text-anchor="middle" dominant-baseline="middle">
            ${gLetter}&amp;${bLetter}
          </text>
        </svg>
      `.trim())}`
    : '/favicon.svg';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center justify-center p-8 my-24 mx-auto max-w-sm bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-sage/5 rounded-full -mr-12 -mt-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-terracotta/5 rounded-full -ml-12 -mb-12 pointer-events-none" />
      
      <h3 className="text-sage font-serif text-2xl mb-6 text-center italic">
        Digital Entry Pass
      </h3>
      
      {isInvalid ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-[#C17E61]/10 rounded-full flex items-center justify-center text-[#C17E61] mb-4 border border-[#C17E61]/20 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-burgundy font-serif font-semibold text-lg mb-2">Barcode Tidak Tersedia</p>
          <p className="text-gray-500 text-xs leading-relaxed max-w-[245px] font-sans">
            Digital Entry Pass tidak ditemukan atau kode undangan Anda tidak valid. Silakan gunakan tautan resmi Anda.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-inner mb-6 border border-sage/10">
            <QRCodeCanvas 
              ref={canvasRef}
              value={guestId} 
              size={200}
              level={"H"}
              includeMargin={false}
              imageSettings={{
                src: qrCenterImage,
                x: undefined,
                y: undefined,
                height: 34,
                width: 34,
                excavate: true,
              }}
            />
          </div>
          
          <p className="text-sage/80 text-sm text-center font-sans italic mb-8 max-w-[200px]">
            Silakan tunjukkan QR Code ini kepada petugas penerima tamu
          </p>
          
          <button
            onClick={downloadQR}
            className="group px-8 py-3 bg-sage text-cream rounded-full hover:bg-sage/90 transition-all duration-300 font-serif text-sm flex items-center gap-3 shadow-md active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Simpan QR Code
          </button>

          <p className="text-[10px] text-sage/40 mt-6 font-mono tracking-widest uppercase">
            REF: {guestId}
          </p>
        </>
      )}
    </motion.div>
  );
};

export default GuestQR;
