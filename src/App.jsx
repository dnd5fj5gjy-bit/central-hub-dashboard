import React, { useState, useCallback, useEffect } from 'react';
import PasswordGate from './components/PasswordGate';
import Sidebar from './components/Sidebar';
import BusinessOverview from './modules/BusinessOverview';
import BusinessWorkspace from './modules/BusinessWorkspace';
import QuickAccess from './modules/QuickAccess';
import GlobalSearch from './modules/GlobalSearch';
import ActivityFeed from './modules/ActivityFeed';
import * as storage from './lib/storage';

function Dashboard({ onLogout }) {
  const [activeView, setActiveView] = useState('home');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState(null);
  const [workspaceInitialItem, setWorkspaceInitialItem] = useState(null);
  const [data, setData] = useState(() => storage.loadData());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    storage.seedData();
    setData(storage.loadData());
  }, []);

  const refresh = useCallback(() => {
    setData(storage.loadData());
  }, []);

  function handleSelectBusiness(bizId) {
    setSelectedBusiness(bizId);
    setWorkspaceInitialTab(null);
    setWorkspaceInitialItem(null);
    setActiveView('workspace');
  }

  function handleBackToHome() {
    setSelectedBusiness(null);
    setWorkspaceInitialTab(null);
    setWorkspaceInitialItem(null);
    setActiveView('home');
  }

  function handleNavigate(view) {
    if (view === 'home') {
      setSelectedBusiness(null);
      setWorkspaceInitialTab(null);
      setWorkspaceInitialItem(null);
    }
    setActiveView(view);
  }

  function handleNavigateToItem(bizId, section, itemId) {
    if (!section && !itemId) {
      handleSelectBusiness(bizId);
      return;
    }
    setSelectedBusiness(bizId);
    setWorkspaceInitialTab(section);
    setWorkspaceInitialItem(itemId);
    setActiveView('workspace');
  }

  function getActiveNav() {
    if (activeView === 'workspace' || activeView === 'home') return 'home';
    return activeView;
  }

  return (
    <div className="flex h-full noise-texture">
      <Sidebar activeView={getActiveNav()} onNavigate={handleNavigate} onLogout={onLogout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      <main className="flex-1 p-8 overflow-y-auto h-full transition-all duration-300" style={{ marginLeft: sidebarOpen ? 220 : 0, paddingLeft: sidebarOpen ? 32 : 56 }}>
        <div className="max-w-5xl mx-auto pb-8">
          {activeView === 'home' && (
            <BusinessOverview
              data={data}
              onRefresh={refresh}
              onSelectBusiness={handleSelectBusiness}
            />
          )}

          {activeView === 'workspace' && selectedBusiness && (
            <BusinessWorkspace
              key={`${selectedBusiness}-${workspaceInitialTab}-${workspaceInitialItem}`}
              businessId={selectedBusiness}
              data={data}
              onRefresh={refresh}
              onBack={handleBackToHome}
              initialTab={workspaceInitialTab}
              initialItemId={workspaceInitialItem}
            />
          )}

          {activeView === 'favourites' && (
            <QuickAccess
              data={data}
              onRefresh={refresh}
              onNavigateToItem={handleNavigateToItem}
            />
          )}

          {activeView === 'search' && (
            <GlobalSearch
              data={data}
              onNavigateToItem={handleNavigateToItem}
            />
          )}

          {activeView === 'activity' && <ActivityFeed />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PasswordGate>
      {({ onLogout }) => <Dashboard onLogout={onLogout} />}
    </PasswordGate>
  );
}
