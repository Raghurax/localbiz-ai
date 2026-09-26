import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui';
import { AppShell } from './components/AppShell';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { AssistantStudio } from './pages/AssistantStudio';
import { SyntheticStudio } from './pages/SyntheticStudio';
import { AssetLibrary } from './pages/AssetLibrary';
import { PublishCenter } from './pages/PublishCenter';
import { CampaignHistory } from './pages/CampaignHistory';

const MainContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState('Sign in to access AI marketing tools.');
  const [selectedCampaignForPublish, setSelectedCampaignForPublish] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleStartCreating = () => {
    if (!isAuthenticated) {
      setAuthPrompt('Sign in or try the 1-click Sri Lakshmi Store demo to start generating campaigns.');
      setAuthModalOpen(true);
    } else {
      setCurrentTab('assistant');
    }
  };

  const handleTryAssistant = () => {
    if (!isAuthenticated) {
      setAuthPrompt('Sign in or try the 1-click Sri Lakshmi Store demo to test speech-to-campaign generation.');
      setAuthModalOpen(true);
    } else {
      setCurrentTab('assistant');
    }
  };

  const handleNavigateToPublish = (campId: string) => {
    setSelectedCampaignForPublish(campId);
    setCurrentTab('publish');
  };

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary] transition-colors">
      {currentTab === 'landing' ? (
        <LandingPage
          onStartCreating={handleStartCreating}
          onTryAssistant={handleTryAssistant}
        />
      ) : (
        <AppShell
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isDark={isDark}
          setIsDark={setIsDark}
          onOpenAuth={() => setAuthModalOpen(true)}
        >
          {currentTab === 'dashboard' && (
            <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'assistant' && (
            <AssistantStudio onNavigateToPublish={handleNavigateToPublish} />
          )}

          {currentTab === 'synthetic' && (
            <SyntheticStudio />
          )}

          {currentTab === 'assets' && (
            <AssetLibrary />
          )}

          {currentTab === 'publish' && (
            <PublishCenter initialCampaignId={selectedCampaignForPublish} />
          )}

          {currentTab === 'history' && (
            <CampaignHistory
              onOpenCampaign={() => setCurrentTab('assistant')}
              onNavigateToPublish={handleNavigateToPublish}
            />
          )}

          {currentTab === 'onboarding' && (
            <Onboarding onComplete={() => setCurrentTab('dashboard')} />
          )}
        </AppShell>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          if (isAuthenticated) {
            setCurrentTab('dashboard');
          }
        }}
        actionPrompt={authPrompt}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;