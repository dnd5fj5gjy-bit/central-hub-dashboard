import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import BusinessOverview from './modules/BusinessOverview';
import BusinessWorkspace from './modules/BusinessWorkspace';
import QuickAccess from './modules/QuickAccess';
import GlobalSearch from './modules/GlobalSearch';
import ActivityFeed from './modules/ActivityFeed';
import * as storage from './lib/storage';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState(null);
  const [workspaceInitialItem, setWorkspaceInitialItem] = useState(null);
  const [data, setData] = useState(() => storage.load());

  const refresh = useCallback(() => {
    setData(storage.load());
  }, []);

  function handleSelectBusiness(businessId) {
    setSelectedBusiness(businessId);
    setWorkspaceInitialTab(null);
    setWorkspaceInitialItem(null);
    setActiveView('workspace');
  }

  function handleBackToOverview() {
    setSelectedBusiness(null);
    setWorkspaceInitialTab(null);
    setWorkspaceInitialItem(null);
    setActiveView('overview');
  }

  function handleNavigate(view) {
    if (view === 'overview') {
      setSelectedBusiness(null);
      setWorkspaceInitialTab(null);
      setWorkspaceInitialItem(null);
    }
    setActiveView(view);
  }

  function handleNavigateToItem(businessId, section, itemId) {
    if (!section && !itemId) {
      // Navigate to business workspace, default tab
      handleSelectBusiness(businessId);
      return;
    }
    setSelectedBusiness(businessId);
    setWorkspaceInitialTab(section);
    setWorkspaceInitialItem(itemId);
    setActiveView('workspace');
  }

  function getActiveNavItem() {
    if (activeView === 'workspace' || activeView === 'overview') return 'overview';
    if (activeView === 'favourites') return 'favourites';
    if (activeView === 'search') return 'search';
    if (activeView === 'activity') return 'activity';
    return 'overview';
  }

  return (
    <div className="flex h-full">
      <Sidebar activeView={getActiveNavItem()} onNavigate={handleNavigate} />

      <main className="flex-1 ml-[220px] p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeView === 'overview' && (
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
              onBack={handleBackToOverview}
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
