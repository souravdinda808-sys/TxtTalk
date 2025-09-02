
import React, { useState, useEffect, useRef } from 'react';
import DownloadIcon from './icons/DownloadIcon';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>('Hello! I am an AI-powered voice. Write something here and I will read it for you.');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [pitch, setPitch] = useState<number>(1);
  const [rate, setRate] = useState<number>(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const defaultVoiceSet = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length === 0) {
        return; // Voices not loaded yet.
      }
      
      setVoices(availableVoices);

      if (!defaultVoiceSet.current) {
        // Refined logic to select a default English voice
        let defaultVoice = 
            // 1. Prefer the default voice for the browser if it's English (US)
            availableVoices.find(voice => voice.lang === 'en-US' && voice.default) ||
            // 2. Or any default English voice
            availableVoices.find(voice => voice.lang.startsWith('en-') && voice.default) ||
            // 3. Or a high-quality Google voice
            availableVoices.find(voice => voice.name === 'Google US English') ||
            // 4. Or the first available US English voice
            availableVoices.find(voice => voice.lang === 'en-US') ||
            // 5. Or the first available English voice of any region
            availableVoices.find(voice => voice.lang.startsWith('en-')) ||
            // 6. Finally, fall back to the first voice in the list
            availableVoices[0];
        
        if (defaultVoice) {
          setSelectedVoice(defaultVoice.voiceURI);
          defaultVoiceSet.current = true;
        }
      }
    };

    // The 'voiceschanged' event is fired when the list of voices is ready.
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Also call it directly in case the voices are already loaded.

    return () => {
        window.speechSynthesis.onvoiceschanged = null; // Clean up the event listener
        window.speechSynthesis.cancel();
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  // Reset audio URL if settings change
  useEffect(() => {
    setAudioUrl(null);
  }, [text, selectedVoice, pitch, rate]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voiceURI === selectedVoice);
    if (voice) {
      utterance.voice = voice;
       // Use a public TTS endpoint for downloading. This is a clever workaround
       // as the Web Speech API doesn't support direct downloads.
      const langCode = voice.lang.split('-')[0]; // e.g., 'en-US' -> 'en'
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;
      setAudioUrl(url);
    }
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col h-full min-h-[500px]">
      <div className="flex-grow flex flex-col space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full flex-grow bg-slate-900 rounded-lg p-4 ring-1 ring-slate-700/50 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-200"
          placeholder="Enter text to speak..."
        />
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <label htmlFor="voice-select" className="text-slate-400 font-medium text-sm flex-shrink-0">Choose a voice:</label>
                <select
                    id="voice-select"
                    value={selectedVoice || ''}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full sm:w-auto bg-slate-700 text-slate-200 rounded-md py-2 px-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                    </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <label htmlFor="pitch-slider" className="text-slate-400 font-medium text-sm flex-shrink-0">Pitch:</label>
                <div className="flex items-center space-x-3 w-full">
                    <input
                        id="pitch-slider"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-slate-300 font-mono text-sm w-8 text-center">{pitch.toFixed(1)}</span>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <label htmlFor="rate-slider" className="text-slate-400 font-medium text-sm flex-shrink-0">Speed:</label>
                <div className="flex items-center space-x-3 w-full">
                    <input
                        id="rate-slider"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-slate-300 font-mono text-sm w-8 text-center">{rate.toFixed(1)}</span>
                </div>
            </div>
        </div>
      </div>
      <div className="flex-shrink-0 mt-6 flex justify-center items-center space-x-4">
        <button
          onClick={handleSpeak}
          disabled={!text}
          className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isSpeaking
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
            }
          `}
        >
          {isSpeaking ? 'Stop Speaking' : 'Speak Text'}
        </button>
        <a
          href={audioUrl || '#'}
          download="TxtTalk-speech.mp3"
          onClick={(e) => !audioUrl && e.preventDefault()}
          aria-disabled={!audioUrl}
          title={!audioUrl ? "Click 'Speak Text' first to generate audio" : "Download audio as MP3"}
          className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center
            ${
              !audioUrl
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                : 'bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-600'
            }
          `}
        >
          <DownloadIcon className="w-5 h-5 mr-2"/>
          Download
        </a>
      </div>
    </div>
  );
};

export default TextToSpeech;
