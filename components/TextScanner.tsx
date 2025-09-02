import React, { useState, useRef, useEffect, useCallback } from 'react';
import { extractTextFromImage } from '../services/geminiService';
import ScanIcon from './icons/ScanIcon';

const TextScanner: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopStream(); // Ensure any existing stream is stopped
    try {
      setError(null);

      // Try for rear camera first, then any camera.
      // Removed 'exact' to prefer rear camera and gracefully fall back.
      const constraints = [
        { video: { facingMode: 'environment' } },
        { video: true }
      ];

      let mediaStream: MediaStream | null = null;
      let lastError: Error | null = null;

      for (const constraint of constraints) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
          // If getUserMedia succeeds, we have a stream.
          lastError = null; // Clear error on success.
          break; // Success, exit loop.
        } catch (e) {
          lastError = e as Error;
          console.warn(`Failed to get camera with constraint:`, constraint, e);
        }
      }

      if (mediaStream) {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        // If we failed to get any stream, throw the last known error
        throw lastError || new Error('No suitable camera found on this device.');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = 'Could not access the camera. Please ensure one is available and grant permission.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          message = 'Camera permission was denied. Please enable it in your browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
           message = 'No suitable camera was found on this device. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
           message = 'The camera is currently in use by another application or a hardware error occurred.';
        }
      } else if (err instanceof Error && err.message) {
           message = err.message;
      }
      setError(message);
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera();
    return stopStream;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;
    setIsLoading(true);
    setError(null);
    setExtractedText('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const base64ImageData = canvas.toDataURL('image/jpeg').split(',')[1];
    setImageSrc(canvas.toDataURL('image/jpeg'));
    
    stopStream();
    
    const text = await extractTextFromImage(base64ImageData);
    if(text.startsWith('Error:')) {
        setError(text);
    } else {
        setExtractedText(text);
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if(extractedText) navigator.clipboard.writeText(extractedText);
  };
  
  const resetScanner = () => {
      setImageSrc(null);
      setExtractedText('');
      setError(null);
      startCamera();
  }

  return (
    <div className="p-6 sm:p-8 flex flex-col h-full min-h-[500px]">
      <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden ring-1 ring-slate-700/50 shadow-inner mb-6">
        {imageSrc ? (
          <img src={imageSrc} alt="Scanned" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        {error && !stream && <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black/50 p-4 text-center">{error}</div>}
      </div>

      <div className="flex-grow flex flex-col space-y-4">
        {isLoading && (
          <div className="text-center">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
             <p className="mt-2 text-slate-400">AI is analyzing the image...</p>
          </div>
        )}
        {extractedText && (
            <textarea
                readOnly
                value={extractedText}
                className="w-full flex-grow bg-slate-900 rounded-lg p-4 ring-1 ring-slate-700/50 shadow-inner resize-none focus:outline-none text-slate-200"
                placeholder="Extracted text will appear here..."
            />
        )}
        {error && !isLoading && <p className="text-red-400 text-center">{error}</p>}
      </div>

      <div className="flex-shrink-0 mt-6 flex justify-center items-center space-x-4">
        {!imageSrc && (
          <button
            onClick={handleScan}
            disabled={isLoading || !stream}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-wait transition-all"
          >
            <ScanIcon className="w-10 h-10"/>
          </button>
        )}
        {(imageSrc || extractedText) && (
            <>
                <button onClick={resetScanner} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition">Scan Again</button>
                <button onClick={copyToClipboard} disabled={!extractedText} className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500 transition">Copy Text</button>
            </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default TextScanner;