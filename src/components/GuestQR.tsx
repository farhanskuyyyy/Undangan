import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

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
    <div className="flex flex-col items-center justify-center p-8 my-8 mx-auto max-w-sm bg-cream border-2 border-sage rounded-2xl shadow-lg">
      <h3 className="text-sage font-serif text-xl mb-4 text-center">
        Pintu Masuk Digital
      </h3>
      
      <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
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
      
      <p className="text-sage/80 text-sm text-center font-sans italic">
        Tunjukkan QR Ini Saat Kedatangan
      </p>
      
      <button
        onClick={downloadQR}
        className="mt-6 px-6 py-2 border-2 border-sage text-sage rounded-full hover:bg-sage hover:text-cream transition-colors duration-300 font-serif text-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>

      <p className="text-xs text-sage/60 mt-4 font-mono">
        ID: {guestId}
      </p>
    </div>
  );
};

export default GuestQR;
