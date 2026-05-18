import { QRCodeCanvas } from 'qrcode.react';

interface GuestQRProps {
  guestId?: string;
}

const GuestQR = ({ guestId }: GuestQRProps) => {
  if (!guestId) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 my-8 mx-auto max-w-sm bg-cream border-2 border-sage rounded-2xl shadow-lg">
      <h3 className="text-sage font-serif text-xl mb-4 text-center">
        Pintu Masuk Digital
      </h3>
      
      <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
        <QRCodeCanvas 
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
      <p className="text-xs text-sage/60 mt-2 font-mono">
        ID: {guestId}
      </p>
    </div>
  );
};

export default GuestQR;
