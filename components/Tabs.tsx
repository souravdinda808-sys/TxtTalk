import React from 'react';
import { TxtTalkMode } from '../types';
import MicIcon from './icons/MicIcon';
import ScanIcon from './icons/ScanIcon';
import VolumeIcon from './icons/VolumeIcon';
import TranslateIcon from './icons/TranslateIcon';

interface TabsProps {
  activeTab: TxtTalkMode;
  setActiveTab: (tab: TxtTalkMode) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: TxtTalkMode.SpeechToText, label: 'Speech to Text', icon: <MicIcon /> },
    { id: TxtTalkMode.TextToSpeech, label: 'Text to Speech', icon: <VolumeIcon /> },
    { id: TxtTalkMode.TextScanner, label: 'Text Scanner', icon: <ScanIcon /> },
    { id: TxtTalkMode.Translate, label: 'Translate', icon: <TranslateIcon /> },
  ];

  return (
    <nav className="flex justify-center bg-slate-800 p-2 rounded-xl shadow-md">
      <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500
              ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }
            `}
          >
            <span className="w-5 h-5 mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Tabs;
