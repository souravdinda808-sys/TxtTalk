import React, { useState, useEffect, useRef } from 'react';
import MicIcon from './icons/MicIcon';
import { SPEECH_RECOGNITION_LANGUAGES } from '../languages';

// Fix: Add types for the Web Speech API to resolve TypeScript errors.
// These types are not included in the standard TypeScript DOM library.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const SpeechToText: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('en-US');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported by your browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let currentFinalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(interimTranscript);
      if (currentFinalTranscript) {
        setFinalTranscript(prev => prev.trim() + (prev ? ' ' : '') + currentFinalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    return () => {
        recognition.stop();
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setFinalTranscript('');
      setError(null);
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalTranscript);
  };

  const handleClear = () => {
    setTranscript('');
    setFinalTranscript('');
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col h-full min-h-[500px]">
      <div className="flex-grow flex flex-col">
        <div className="relative flex-grow bg-slate-900 rounded-lg p-4 ring-1 ring-slate-700/50 shadow-inner">
          <p className="text-slate-300 whitespace-pre-wrap">{finalTranscript}
            <span className="text-cyan-400">{transcript}</span>
          </p>
          {!finalTranscript && !transcript && !isListening && (
             <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                Click the microphone to start speaking...
             </div>
          )}
        </div>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>

      <div className="flex-shrink-0 mt-6 space-y-6">
        <div className="w-full max-w-md mx-auto">
            <label htmlFor="language-select" className="block text-sm font-medium text-slate-400 mb-2">Recognition Language</label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isListening}
                className="w-full bg-slate-700 text-slate-200 rounded-md py-2 px-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            >
                {SPEECH_RECOGNITION_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
            </select>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleClear}
            disabled={!finalTranscript && !transcript}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition w-24 text-center"
          >
            Clear
          </button>
          <button
            onClick={toggleListening}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800
              ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              }
            `}
          >
            {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            <MicIcon className="w-10 h-10" />
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!finalTranscript}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition w-24 text-center"
          >
            Copy Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
