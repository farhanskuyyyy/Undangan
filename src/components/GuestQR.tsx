import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';

interface GuestQRProps {
  guestId?: string;
}

const GuestQR = ({ guestId }: GuestQRProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!guestId) return null;

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `invitation-qr-${guestId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center justify-center p-8 my-24 mx-auto max-w-sm bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-sage/5 rounded-full -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-terracotta/5 rounded-full -ml-12 -mb-12" />
      
      <h3 className="text-sage font-serif text-2xl mb-6 text-center italic">
        Digital Entry Pass
      </h3>
      
      <div className="bg-white p-6 rounded-2xl shadow-inner mb-6 border border-sage/10">
        <QRCodeCanvas 
          ref={canvasRef}
          value={guestId} 
          size={200}
          level={"H"}
          includeMargin={false}
          imageSettings={{
            src: "/favicon.svg",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>
      
      <p className="text-sage/80 text-sm text-center font-sans italic mb-8 max-w-[200px]">
        Silakan tunjukkan QR Code ini kepada petugas penerima tamu
      </p>
      
      <button
        onClick={downloadQR}
        className="group px-8 py-3 bg-sage text-cream rounded-full hover:bg-sage/90 transition-all duration-300 font-serif text-sm flex items-center gap-3 shadow-md active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Simpan QR Code
      </button>

      <p className="text-[10px] text-sage/40 mt-6 font-mono tracking-widest uppercase">
        REF: {guestId}
      </p>
    </motion.div>
  );
};

export default GuestQR;
