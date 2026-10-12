import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InstalledView } from './components/InstalledView';
import { OwnedView } from './components/OwnedView';
import { DealsView } from './components/DealsView';
import { FreebiesView } from './components/FreebiesView';
import { AddGameModal } from './components/AddGameModal';
import { FolderScannerModal } from './components/FolderScannerModal';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { GameDetailModal } from './components/GameDetailModal';
import { SettingsBackupModal } from './components/SettingsBackupModal';
import { DesktopInstallModal } from './components/DesktopInstallModal';

import { Deal, GameItem, GamePlatform, ScanFolderConfig, UserProfile } from './types';
import {
  getStoredGames,
  upsertGame,
  deleteGameById,
  toggleFavoriteGame,
  toggleInstalledStatus,
  toggleStoreOwnership,
  exportDatabaseBackup,
  importDatabaseBackup,
  saveAllGames,
  getUserProfile,
  saveUserProfile,
  getStoredScanFolders,
  addCustomScanFolder,
  deleteCustomScanFolder,
  DEFAULT_INITIAL_GAMES
} from './services/libraryStorage';
import { executeGameLaunch, buildProtocolUri } from './services/storeProtocols';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'installed' | 'owned' | 'deals' | 'freebies'>('installed');
  const [games, setGames] = useState<GameItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [scanFolders, setScanFolders] = useState<ScanFolderConfig[]>(getStoredScanFolders());

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedDetailGame, setSelectedDetailGame] = useState<GameItem | null>(null);
  const [initialAddGame, setInitialAddGame] = useState<Partial<GameItem> | undefined>(undefined);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load state on mount
  useEffect(() => {
    const loaded = getStoredGames();
    setGames(loaded);
    setProfile(getUserProfile());
    setScanFolders(getStoredScanFolders());
  }, []);

  const installedCount = useMemo(() => games.filter((g) => g.isInstalled).length, [games]);
  const ownedCount = useMemo(() => games.length, [games]);

  // Launch a game
  const handleLaunchGame = async (game: GameItem) => {
    showToast(`Launching ${game.title}...`);
    const res = await executeGameLaunch(game);
    if (res.success) {
      if (res.method === 'executable_spawned') {
        showToast(`Running ${game.title} native local process directly`);
      } else {
        showToast(`Sent launch request to ${game.store.toUpperCase()} client for ${game.title}`);
      }
    }
  };

  // Add / Edit game
  const handleSaveGame = (game: GameItem) => {
    const updated = upsertGame(game);
    setGames(updated);
    showToast(`Saved "${game.title}" to collection`);
  };

  // Delete game
  const handleDeleteGame = (id: string) => {
    const updated = deleteGameById(id);
    setGames(updated);
    showToast('Game removed from collection');
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteGame(id);
    setGames(updated);
  };

  // Toggle installed status (installed vs uninstalled)
  const handleToggleInstalled = (id: string, isInstalled: boolean) => {
    const updated = toggleInstalledStatus(id, isInstalled);
    setGames(updated);
    showToast(isInstalled ? 'Marked game as installed on disk' : 'Marked game as uninstalled');
  };

  // Toggle store ownership for a game (supports multiple stores)
  const handleToggleStoreOwnership = (gameId: string, store: GamePlatform) => {
    const updated = toggleStoreOwnership(gameId, store);
    setGames(updated);
    showToast(`Updated store ownership for game`);
  };

  // Toggle ownership from Store Deals or Freebies tab
  const handleToggleOwnedGame = (deal: Deal, currentlyOwned: boolean) => {
    if (currentlyOwned) {
      // Find and remove matching game
      const target = games.find(
        (g) =>
          (deal.steamAppID && g.storeAppId === deal.steamAppID) ||
          g.title.toLowerCase().replace(/[^a-z0-9]/g, '') ===
            deal.title.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (target) {
        const updated = deleteGameById(target.id);
        setGames(updated);
        showToast(`Removed "${deal.title}" from your owned collection`);
      }
    } else {
      // Mark as owned (default not installed until user installs it)
      let platform: GamePlatform = 'standalone';
      if (deal.storeID === '1') platform = 'steam';
      else if (deal.storeID === '25') platform = 'epic';
      else if (deal.storeID === '7') platform = 'gog';

      const appId = deal.steamAppID || '';
      const protocolUri = buildProtocolUri(platform, appId);

      const newOwnedGame: GameItem = {
        id: `owned-deal-${deal.dealID}-${Date.now()}`,
        title: deal.title,
        banner: deal.thumb,
        store: platform,
        ownedStores: [platform],
        storeAppId: appId,
        os: 'both',
        launchType: appId ? 'protocol' : 'executable',
        executablePath: '',
        launchArgs: '',
        workingDir: '',
        protocolUri,
        isInstalled: false, // In owned collection, ready to download
        isFavorite: false,
        genres: ['Store Title'],
        installPath: '',
        installSizeGb: 20.0,
        notes: `Owned on ${platform.toUpperCase()}.`,
        dateAdded: new Date().toISOString()
      };

      const updated = upsertGame(newOwnedGame);
      setGames(updated);
      showToast(`Marked "${deal.title}" as Owned in your collection!`);
    }
  };

  // Import games from folder scanner
  const handleImportScannedGames = (newGames: GameItem[]) => {
    const current = [...games];
    const updated = [...newGames, ...current];
    saveAllGames(updated);
    setGames(updated);
    showToast(`Discovered and imported ${newGames.length} installed games!`);
  };

  // Profile save
  const handleSaveProfile = (newProfile: UserProfile) => {
    saveUserProfile(newProfile);
    setProfile(newProfile);
    showToast(`Profile updated: ${newProfile.name}`);
  };

  // Custom scan folders
  const handleAddScanFolder = (folderData: Omit<ScanFolderConfig, 'id'>) => {
    const updated = addCustomScanFolder(folderData);
    setScanFolders(updated);
    showToast(`Added custom scan folder: ${folderData.name}`);
  };

  const handleDeleteScanFolder = (id: string) => {
    const updated = deleteCustomScanFolder(id);
    setScanFolders(updated);
    showToast(`Removed custom scan folder`);
  };

  // Export database JSON backup
  const handleExportBackup = () => {
    const json = exportDatabaseBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedName = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'gamer';
    a.download = `omnilaunch_${sanitizedName}_database_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Database exported to JSON backup file');
  };

  // Import database JSON backup
  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = importDatabaseBackup(text);
      if (res.success) {
        setGames(getStoredGames());
        setProfile(getUserProfile());
        setScanFolders(getStoredScanFolders());
        showToast(`Successfully restored ${res.count} games and settings from backup!`);
      } else {
        alert(res.error || 'Failed to import backup');
      }
    };
    input.click();
  };

  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to reset your local database to default seed games?')) {
      saveAllGames(DEFAULT_INITIAL_GAMES);
      setGames(DEFAULT_INITIAL_GAMES);
      showToast('Database reset to defaults');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => {
          setInitialAddGame(undefined);
          setIsAddModalOpen(true);
        }}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        installedCount={installedCount}
        ownedCount={ownedCount}
        profileName={profile.name}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'installed' && (
          <InstalledView
            games={games}
            onLaunchGame={handleLaunchGame}
            onSelectGameDetails={(game) => setSelectedDetailGame(game)}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddModal={() => {
              setInitialAddGame({ isInstalled: true });
              setIsAddModalOpen(true);
            }}
            onOpenScannerModal={() => setIsScannerModalOpen(true)}
          />
        )}

        {currentTab === 'owned' && (
          <OwnedView
            games={games}
            onLaunchGame={handleLaunchGame}
            onSelectGameDetails={(game) => setSelectedDetailGame(game)}
            onToggleFavorite={handleToggleFavorite}
            onToggleInstalled={handleToggleInstalled}
            onToggleStoreOwnership={handleToggleStoreOwnership}
            onOpenAddModal={() => {
              setInitialAddGame({ isInstalled: false });
              setIsAddModalOpen(true);
            }}
          />
        )}

        {currentTab === 'deals' && (
          <DealsView
            ownedGames={games}
            onToggleOwnedGame={handleToggleOwnedGame}
          />
        )}

        {currentTab === 'freebies' && (
          <FreebiesView
            ownedGames={games}
            onToggleOwnedGame={handleToggleOwnedGame}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">OmniLaunch</span>
            <span>·</span>
            <span>Installed Launcher · Owned Collection · Multi-Store Deals</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="hover:text-emerald-400 text-slate-400 transition-colors"
            >
              Desktop PWA / Standalone Installation
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-slate-300"
            >
              Database Backup ({profile.name})
            </button>
            <span>·</span>
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-slate-300 underline"
            >
              Desktop Execution & Architecture Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveGame}
        initialGame={initialAddGame}
        defaultInstalled={currentTab === 'installed'}
      />

      <FolderScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onImportGames={handleImportScannedGames}
        scanFolders={scanFolders}
        onAddScanFolder={handleAddScanFolder}
      />

      <SettingsBackupModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        scanFolders={scanFolders}
        onAddScanFolder={handleAddScanFolder}
        onDeleteScanFolder={handleDeleteScanFolder}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetDatabase={handleResetDatabase}
      />

      <DesktopInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <PlatformGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <GameDetailModal
        game={selectedDetailGame}
        isOpen={!!selectedDetailGame}
        onClose={() => setSelectedDetailGame(null)}
        onLaunchGame={handleLaunchGame}
        onUpdateGame={(updated) => {
          handleSaveGame(updated);
          setSelectedDetailGame(updated);
        }}
        onDeleteGame={handleDeleteGame}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
