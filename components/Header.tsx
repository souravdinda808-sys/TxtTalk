
import React from 'react';
import SettingsIcon from './icons/SettingsIcon';

interface HeaderProps {
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="relative text-center mb-8">
       <div className="absolute top-0 right-0">
          <button 
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Open settings"
          >
            <SettingsIcon className="w-6 h-6"/>
          </button>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 text-transparent bg-clip-text">
        TxtTalk
      </h1>
      <p className="text-slate-400 mt-2 text-sm sm:text-base">
        Your AI-powered Speech and Text Companion
      </p>
    </header>
  );
};

export default Header;
