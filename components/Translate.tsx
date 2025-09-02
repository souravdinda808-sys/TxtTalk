import React, { useState } from 'react';
import { translateText } from '../services/geminiService';
import { TRANSLATE_LANGUAGES } from '../languages';
import SwapIcon from './icons/SwapIcon';
import CopyIcon from './icons/CopyIcon';
import VolumeIcon from './icons/VolumeIcon';

const Translate: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [sourceLang, setSourceLang] = useState<string>('auto');
    const [targetLang, setTargetLang] = useState<string>('en');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const handleTranslate = async () => {
        if (!inputText.trim() || sourceLang === targetLang) return;

        setIsLoading(true);
        setError(null);
        setTranslatedText('');

        const result = await translateText(inputText, sourceLang, targetLang);

        if (result.startsWith('Error:')) {
            setError(result);
        } else {
            setTranslatedText(result);
        }
        setIsLoading(false);
    };

    const handleSwapLanguages = () => {
        if (sourceLang === 'auto') return;
        const currentInput = inputText;
        setInputText(translatedText);
        setTranslatedText(currentInput);
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
    };
    
    const handleCopyToClipboard = () => {
        if (!translatedText) return;
        navigator.clipboard.writeText(translatedText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleSpeak = () => {
        if (!translatedText || window.speechSynthesis.speaking) return;
        const utterance = new SpeechSynthesisUtterance(translatedText);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(targetLang));
        if (voice) {
          utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
    };
    
    return (
        <div className="p-6 sm:p-8 flex flex-col h-full min-h-[500px]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="w-full sm:w-auto flex-1">
                    <label htmlFor="source-lang" className="sr-only">From</label>
                    <select
                        id="source-lang"
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className="w-full bg-slate-700 text-slate-200 rounded-md py-2 px-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {TRANSLATE_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSwapLanguages}
                    disabled={sourceLang === 'auto'}
                    className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Swap languages"
                >
                    <SwapIcon className="w-5 h-5" />
                </button>
                
                <div className="w-full sm:w-auto flex-1">
                    <label htmlFor="target-lang" className="sr-only">To</label>
                    <select
                        id="target-lang"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full bg-slate-700 text-slate-200 rounded-md py-2 px-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {TRANSLATE_LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-grow flex flex-col space-y-4">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-36 bg-slate-900 rounded-lg p-4 ring-1 ring-slate-700/50 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-200"
                    placeholder="Enter text to translate..."
                />

                <div className="relative flex-grow bg-slate-900 rounded-lg p-4 ring-1 ring-slate-700/50 shadow-inner min-h-[120px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                        </div>
                    )}
                    {error && <p className="text-red-400 p-4">{error}</p>}
                    {!isLoading && !error && (
                         <>
                            <p className="text-slate-200 whitespace-pre-wrap">{translatedText}</p>
                            {!translatedText && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                                    Translation will appear here...
                                </div>
                            )}
                         </>
                    )}
                     {translatedText && !isLoading && (
                        <div className="absolute top-2 right-2 flex space-x-1">
                             <button onClick={handleSpeak} className="p-2 text-slate-400 hover:text-cyan-400 transition rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Listen to translated text">
                                <VolumeIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={handleCopyToClipboard} className="p-2 text-slate-400 hover:text-cyan-400 transition rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Copy translated text">
                                {copySuccess ? <span className="text-xs text-cyan-400">Copied!</span> : <CopyIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 mt-6 flex justify-center">
                <button
                    onClick={handleTranslate}
                    disabled={isLoading || !inputText.trim() || sourceLang === targetLang}
                    className="px-8 py-3 font-semibold rounded-lg bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Translating...' : 'Translate'}
                </button>
            </div>
        </div>
    );
};

export default Translate;
