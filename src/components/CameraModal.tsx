import React, { useState, useRef } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera.");
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
        onCapture(data);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl overflow-hidden border border-gold-500/30">
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto bg-black" />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
          <button
            onClick={stopCamera}
            className="p-4 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
          >
            <X size={24} />
          </button>
          <button
            onClick={capture}
            className="p-6 bg-gold-primary text-zinc-950 rounded-full hover:scale-110 transition-transform shadow-lg shadow-gold-500/20"
          >
            <Camera size={32} />
          </button>
        </div>
      </div>
    </div>
  );
};
