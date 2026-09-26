import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wand2,
  FileText,
  Image as ImageIcon,
  Send,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Store,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface AppShellProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenAuth: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  setIsDark,
  onOpenAuth,
  children
}) => {
  const { business, logout, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Assistant', icon: Wand2 },
    { id: 'history', label: 'Campaigns', icon: FileText },
    { id: 'assets', label: 'Asset Library', icon: ImageIcon },
    { id: 'publish', label: 'Publish Center', icon: Send },
    { id: 'synthetic', label: 'Synthetic Studio', icon: Database },
    { id: 'onboarding', label: 'Store Settings', icon: Settings },
  ];

  const currentNav = navItems.find((n) => n.id === currentTab) || { label: 'LocalBiz AI' };

  return (
    <div className="min-h-screen flex bg-[--color-bg] text-[--color-text-primary] antialiased">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-40 bg-[--color-surface] border-r border-[--color-border] transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[--color-border] shrink-0">
          <div
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  LocalBiz AI
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Marketing Studio
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Store Profile / User Card */}
        <div className="p-3 border-t border-[--color-border] shrink-0">
          {isAuthenticated ? (
            <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
              <button
                onClick={() => setCurrentTab('onboarding')}
                className="flex items-center gap-2 text-left truncate flex-1 hover:opacity-80 transition"
                title="Store Settings"
              >
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {business?.business_name ? business.business_name[0].toUpperCase() : 'S'}
                </div>
                {!collapsed && (
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                      {business?.business_name || 'My Store'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {business?.preferred_language || 'Telugu'}
                    </p>
                  </div>
                )}
              </button>
              {!collapsed && (
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`btn-primary btn-sm w-full ${collapsed ? 'px-0 justify-center' : ''}`}
            >
              <Store className="w-3.5 h-3.5" />
              {!collapsed && <span>Sign In</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          collapsed ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        {/* Topbar */}
        <header className="h-14 bg-[--color-surface] border-b border-[--color-border] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {currentNav.label}
            </h2>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Authenticated user menu or sign-in */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {business?.business_name ? business.business_name[0].toUpperCase() : 'U'}
                  </div>
                </button>
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-[--color-surface] rounded-xl shadow-lg border border-[--color-border] py-1 z-50 text-xs animate-slide-up"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {business?.business_name || 'My Store'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {business?.business_category || 'Local Business'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('onboarding')}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Store Settings
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-primary btn-sm font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[--color-border] bg-[--color-surface] px-4 py-3 space-y-1 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 min-w-0 pb-16 md:pb-6">{children}</main>

        {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
        <div className="mobile-nav md:hidden">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'assistant', label: 'AI Studio', icon: Wand2 },
            { id: 'history', label: 'Campaigns', icon: FileText },
            { id: 'assets', label: 'Assets', icon: ImageIcon },
            { id: 'publish', label: 'Publish', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
