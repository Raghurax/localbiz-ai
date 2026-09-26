import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Sun, Moon, Store, LogOut, Wand2, Database, Image as ImageIcon, History, Send } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  setIsDark,
  onOpenAuth
}) => {
  const { business, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with 3D Sparkle Badge */}
        <div
          onClick={() => setCurrentTab('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent filter drop-shadow">
              LocalBiz AI
            </span>
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-500/30 shadow-sm">
              Telugu & English 3D
            </span>
          </div>
        </div>

        {/* Authenticated Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ' + (currentTab === 'dashboard' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('assistant')}
              className={'flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ' + (currentTab === 'assistant' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Studio</span>
            </button>
            <button
              onClick={() => setCurrentTab('synthetic')}
              className={'flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ' + (currentTab === 'synthetic' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Synthetic Studio</span>
            </button>
            <button
              onClick={() => setCurrentTab('assets')}
              className={'flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ' + (currentTab === 'assets' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Asset Library</span>
            </button>
            <button
              onClick={() => setCurrentTab('publish')}
              className={'flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ' + (currentTab === 'publish' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Center</span>
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={'flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ' + (currentTab === 'history' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentTab('onboarding')}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition border border-slate-800 hover:border-slate-700 shadow-sm"
                title="Edit Business Profile"
              >
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span className="max-w-[130px] truncate">{business?.business_name || 'My Business'}</span>
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-sky-950/40 transition border border-transparent hover:border-sky-900/50"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenAuth}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-500 hover:from-sky-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};