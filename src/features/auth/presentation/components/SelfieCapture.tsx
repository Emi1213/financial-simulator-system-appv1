'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export function SelfieCapture({ onCapture, onCancel, isUploading }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  // Inicializar cámara
  useEffect(() => {
    const enableVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        setMediaStream(stream);
        setError('');
      } catch (error) {
        console.error('Error accessing webcam:', error);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    };

    enableVideoStream();
  }, []);

  // Conectar stream al video
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        setIsReady(true);
      };
    }
  }, [mediaStream]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [mediaStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && mediaStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dibujar la imagen del video en el canvas
        ctx.drawImage(video, 0, 0);
        
        // Convertir a blob y crear archivo
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = Date.now();
            const file = new File([blob], `selfie_${timestamp}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const retryCamera = async () => {
    setError('');
    setIsReady(false);
    
    // Detener stream actual si existe
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setMediaStream(stream);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-80 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200 shadow-lg">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-3">Error de Cámara</h3>
          <p className="text-red-700 mb-6 max-w-sm">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={retryCamera} 
              variant="outline" 
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button 
              onClick={onCancel} 
              variant="outline" 
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl">
      {/* Video de la cámara */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-2xl"
      />
      
      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay de guía facial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-64 border-4 border-white/50 rounded-full border-dashed animate-pulse"></div>
        </div>
        <div className="absolute top-4 left-0 right-0 text-center">
          <div className="inline-block bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-white text-sm font-medium">Centra tu rostro en el óvalo</p>
          </div>
        </div>
      </div>
      
      {/* Overlay de carga */}
      {!isReady && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-white text-center bg-black/50 rounded-2xl p-8">
            <div className="w-12 h-12 mx-auto mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <p className="text-lg font-medium">Iniciando cámara...</p>
            <p className="text-sm text-gray-300 mt-2">Preparando captura de selfie</p>
          </div>
        </div>
      )}
      
      {/* Controles modernos */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
        <Button
          onClick={onCancel}
          disabled={isUploading}
          variant="outline"
          size="icon"
          className="bg-black/50 border-white/30 text-white hover:bg-black/70 backdrop-blur-sm rounded-full w-14 h-14"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <Button
          onClick={capturePhoto}
          disabled={!isReady || isUploading}
          size="icon"
          className="bg-white text-black hover:bg-gray-100 rounded-full w-20 h-20 shadow-2xl border-4 border-white/20 relative overflow-hidden"
        >
          {isUploading ? (
            <div className="absolute inset-0 bg-blue-600 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
            </div>
          ) : (
            <Camera className="w-10 h-10" />
          )}
        </Button>
        
        <div className="w-14 h-14 flex items-center justify-center">
          {isReady && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
          )}
        </div>
      </div>
      
      {/* Indicador de estado */}
      {isUploading && (
        <div className="absolute top-4 right-4">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            Procesando...
          </div>
        </div>
      )}
    </div>
  );
}