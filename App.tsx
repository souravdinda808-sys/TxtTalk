import React, { useState } from 'react';
import { TxtTalkMode } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import SpeechToText from './components/SpeechToText';
import TextToSpeech from './components/TextToSpeech';
import TextScanner from './components/TextScanner';
import Translate from './components/Translate';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TxtTalkMode>(TxtTalkMode.SpeechToText);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const renderContent = () => {
    switch (activeTab) {
      case TxtTalkMode.SpeechToText:
        return <SpeechToText />;
      case TxtTalkMode.TextToSpeech:
        return <TextToSpeech />;
      case TxtTalkMode.TextScanner:
        return <TextScanner />;
      case TxtTalkMode.Translate:
        return <Translate />;
      default:
        return <SpeechToText />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
          <Header onOpenSettings={() => setIsSettingsOpen(true)} />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="mt-6 flex-grow rounded-xl bg-slate-800/50 shadow-2xl shadow-slate-950/50 ring-1 ring-slate-700/50">
            {renderContent()}
          </main>
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default App;
