
import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import LogoutIcon from './icons/LogoutIcon';
import GoogleIcon from './icons/GoogleIcon';
import MobileIcon from './icons/MobileIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 ring-1 ring-slate-700/50 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-full p-1"
            aria-label="Close settings"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Theme</label>
              <div className="flex bg-slate-900/80 p-1 rounded-lg">
                  <button className="flex-1 py-2 px-4 text-sm font-medium rounded-md bg-cyan-500 text-white shadow">Dark</button>
                  <button className="flex-1 py-2 px-4 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700/50">Light</button>
              </div>
              <p className="text-xs text-slate-500">Light mode is coming soon!</p>
          </div>
          <div className="border-t border-slate-700"></div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Account</label>
             {isLoggedIn ? (
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                    <LogoutIcon className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                </button>
             ) : (
                <div className="space-y-3">
                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md transition-colors bg-white/5 text-slate-200 hover:bg-white/10"
                    >
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        <span>Login with Google</span>
                    </button>
                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md transition-colors bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                    >
                        <MobileIcon className="w-5 h-5 mr-2" />
                        <span>Login with Mobile Number</span>
                    </button>
                </div>
             )}
             <p className="text-xs text-slate-500">{isLoggedIn ? 'You are currently logged in.' : 'Login to sync your settings (demo).'}</p>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;
